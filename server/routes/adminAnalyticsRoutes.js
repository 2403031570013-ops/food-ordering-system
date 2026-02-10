const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const CANCELLED = ['cancelled', 'CANCELLED'];
const DELIVERED = ['delivered', 'DELIVERED'];

const getDateRange = (range, startDate, endDate) => {
    if (range === 'custom' && startDate && endDate) {
        return {
            start: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
            end: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }
    const now = new Date();
    const s = new Date();
    switch (range) {
        case 'today': s.setHours(0, 0, 0, 0); break;
        case 'week': s.setDate(now.getDate() - 7); s.setHours(0, 0, 0, 0); break;
        case 'month': s.setDate(now.getDate() - 30); s.setHours(0, 0, 0, 0); break;
        case 'year': s.setDate(now.getDate() - 365); s.setHours(0, 0, 0, 0); break;
        default: s.setDate(now.getDate() - 30); s.setHours(0, 0, 0, 0);
    }
    return { start: s, end: now };
};

// ═══════════════════════════════════════════════════════════
//  1) GET /summary — Global platform summary
// ═══════════════════════════════════════════════════════════
router.get('/summary', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $nin: CANCELLED }
        });

        const delivered = orders.filter(o => DELIVERED.includes(o.status));
        const totalRevenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const totalUsers = await User.countDocuments();
        const totalRestaurants = await Hotel.countDocuments({ approved: true });

        res.json({
            totalOrders: orders.length,
            totalRevenue,
            avgOrderValue: delivered.length ? Math.round(totalRevenue / delivered.length) : 0,
            totalUsers,
            totalRestaurants,
            period: { start, end }
        });
    } catch (e) {
        console.error('Admin Summary Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  2) GET /revenue-trend — Revenue by day/month/year
// ═══════════════════════════════════════════════════════════
router.get('/revenue-trend', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate, groupBy } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        let dateFormat;
        switch (groupBy) {
            case 'month': dateFormat = '%Y-%m'; break;
            case 'year': dateFormat = '%Y'; break;
            default: dateFormat = '%Y-%m-%d';
        }

        const trend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $in: DELIVERED }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(trend);
    } catch (e) {
        console.error('Revenue Trend Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  3) GET /top-restaurants — Top by revenue
// ═══════════════════════════════════════════════════════════
router.get('/top-restaurants', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        const topRest = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $in: DELIVERED }
                }
            },
            {
                $group: {
                    _id: '$hotel',
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'info'
                }
            },
            {
                $project: {
                    name: { $arrayElemAt: ['$info.name', 0] },
                    revenue: 1,
                    orders: 1
                }
            }
        ]);

        res.json(topRest);
    } catch (e) {
        console.error('Top Restaurants Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  4) GET /payment-split — COD vs Online
// ═══════════════════════════════════════════════════════════
router.get('/payment-split', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        const split = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    status: { $nin: CANCELLED }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json(split);
    } catch (e) {
        console.error('Payment Split Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  5) GET /csv — Global CSV export
// ═══════════════════════════════════════════════════════════
router.get('/csv', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate, restaurantId } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        const filter = { createdAt: { $gte: start, $lte: end }, status: { $nin: CANCELLED } };
        if (restaurantId) filter.hotel = restaurantId;

        const orders = await Order.find(filter)
            .populate('user', 'name').populate('hotel', 'name').sort({ createdAt: -1 });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=FoodHubNow_Global_${Date.now()}.csv`);

        let csv = 'Order ID,Date,Restaurant,Customer,Amount,Payment Method,Status\n';
        for (const o of orders) {
            csv += `#${o._id.toString().slice(-6)},${new Date(o.createdAt).toLocaleDateString('en-IN')},${(o.hotel?.name || 'N/A').replace(/,/g, ' ')},${(o.user?.name || 'Guest').replace(/,/g, ' ')},${o.totalAmount},${o.paymentMethod || 'N/A'},${o.status}\n`;
        }
        res.send(csv);
    } catch (e) {
        console.error('Admin CSV Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  6) GET /excel — Global Excel export
// ═══════════════════════════════════════════════════════════
router.get('/excel', protect, admin, async (req, res) => {
    try {
        const { range, startDate, endDate, restaurantId } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);

        const filter = { createdAt: { $gte: start, $lte: end }, status: { $nin: CANCELLED } };
        if (restaurantId) filter.hotel = restaurantId;

        const orders = await Order.find(filter)
            .populate('user', 'name').populate('hotel', 'name').sort({ createdAt: -1 });

        const wb = new ExcelJS.Workbook();
        wb.creator = 'FoodHub Now';
        const ws = wb.addWorksheet('Platform Report');

        ws.mergeCells('A1:G1');
        ws.getCell('A1').value = 'FoodHub Now — Platform Report';
        ws.getCell('A1').font = { bold: true, size: 14 };
        ws.mergeCells('A2:G2');
        ws.getCell('A2').value = `${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}`;

        ws.addRow([]);

        const hdr = ws.addRow(['Order ID', 'Date', 'Restaurant', 'Customer', 'Amount (₹)', 'Payment', 'Status']);
        hdr.font = { bold: true };
        hdr.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        for (const o of orders) {
            ws.addRow([
                `#${o._id.toString().slice(-6)}`,
                new Date(o.createdAt).toLocaleDateString('en-IN'),
                o.hotel?.name || 'N/A',
                o.user?.name || 'Guest',
                o.totalAmount,
                o.paymentMethod || 'N/A',
                o.status.toUpperCase()
            ]);
        }

        ws.columns = [
            { width: 14 }, { width: 14 }, { width: 22 }, { width: 22 }, { width: 14 }, { width: 14 }, { width: 14 }
        ];

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=FoodHubNow_Platform_${Date.now()}.xlsx`);
        await wb.xlsx.write(res);
        res.end();
    } catch (e) {
        console.error('Admin Excel Error:', e);
        if (!res.headersSent) res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
