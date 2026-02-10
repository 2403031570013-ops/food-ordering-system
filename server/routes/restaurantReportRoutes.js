const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Hotel = require('../models/Hotel');
const { protect, restrictTo } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════

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

const rangeLabel = (r) => ({ today: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly', custom: 'Custom' })[r] || 'Report';

const findHotel = async (user) =>
    await Hotel.findOne({ user: user._id }) || await Hotel.findOne({ email: user.email });

const buildQuery = (hotelId, start, end) => ({
    hotel: hotelId,
    createdAt: { $gte: start, $lte: end },
    status: { $nin: CANCELLED }
});

const calcMetrics = (orders) => {
    const delivered = orders.filter(o => DELIVERED.includes(o.status));
    const totalRevenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);
    return {
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: delivered.length ? Math.round(totalRevenue / delivered.length) : 0
    };
};

// ═══════════════════════════════════════════════════════════
//  1) GET /summary
// ═══════════════════════════════════════════════════════════
router.get('/summary', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);
        const hotel = await findHotel(req.user);
        if (!hotel) return res.status(404).json({ message: 'Restaurant not found' });

        const orders = await Order.find(buildQuery(hotel._id, start, end));
        const metrics = calcMetrics(orders);

        res.json({ range, ...metrics, period: { start, end } });
    } catch (e) {
        console.error('Report Summary Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  2) GET /orders
// ═══════════════════════════════════════════════════════════
router.get('/orders', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);
        const hotel = await findHotel(req.user);
        if (!hotel) return res.status(404).json({ message: 'Restaurant not found' });

        const orders = await Order.find(buildQuery(hotel._id, start, end))
            .select('totalAmount paymentMethod status createdAt user items')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (e) {
        console.error('Report Orders Error:', e);
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  3) GET /pdf
// ═══════════════════════════════════════════════════════════
router.get('/pdf', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);
        const hotel = await findHotel(req.user);
        if (!hotel) return res.status(404).json({ message: 'Restaurant not found' });

        const orders = await Order.find(buildQuery(hotel._id, start, end))
            .populate('user', 'name').sort({ createdAt: -1 });

        const { totalOrders, totalRevenue, avgOrderValue } = calcMetrics(orders);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=FoodHubNow_Report_${range}_${Date.now()}.pdf`);
        doc.pipe(res);

        // ── HEADER ──
        doc.rect(0, 0, doc.page.width, 110).fill('#0f172a');
        doc.fontSize(22).fillColor('#fff').text(hotel.name, 50, 25, { align: 'center' });
        doc.fontSize(11).fillColor('#94a3b8').text(`${rangeLabel(range)} Sales Report  •  FoodHub Now`, { align: 'center' });
        doc.fontSize(9).fillColor('#64748b').text(
            `${start.toLocaleDateString('en-IN')} — ${end.toLocaleDateString('en-IN')}  |  Generated: ${new Date().toLocaleString('en-IN')}`,
            { align: 'center' }
        );

        // ── SUMMARY ──
        const bY = 130, bW = 155, bH = 65, gap = 22;
        const boxes = [
            { label: 'TOTAL ORDERS', value: String(totalOrders), bg: '#eff6ff' },
            { label: 'TOTAL REVENUE', value: `Rs. ${totalRevenue}`, bg: '#f0fdf4' },
            { label: 'AVG ORDER VALUE', value: `Rs. ${avgOrderValue}`, bg: '#faf5ff' },
        ];
        boxes.forEach((b, i) => {
            const x = 50 + i * (bW + gap);
            doc.roundedRect(x, bY, bW, bH, 6).fill(b.bg);
            doc.fontSize(8).fillColor('#64748b').text(b.label, x + 12, bY + 10, { width: bW - 24 });
            doc.fontSize(20).fillColor('#0f172a').text(b.value, x + 12, bY + 28, { width: bW - 24 });
        });

        // ── TABLE ──
        let y = bY + bH + 25;
        doc.rect(50, y, 500, 22).fill('#f1f5f9');
        const cols = [
            { label: 'ORDER ID', x: 55 },
            { label: 'DATE', x: 140 },
            { label: 'CUSTOMER', x: 250 },
            { label: 'AMOUNT', x: 370 },
            { label: 'STATUS', x: 460 },
        ];
        doc.fontSize(7).fillColor('#475569').font('Helvetica-Bold');
        cols.forEach(c => doc.text(c.label, c.x, y + 7));
        y += 28;
        doc.font('Helvetica').fontSize(8).fillColor('#334155');

        for (const o of orders) {
            if (y > 740) {
                doc.addPage();
                y = 50;
                doc.rect(50, y, 500, 22).fill('#f1f5f9');
                doc.fontSize(7).fillColor('#475569').font('Helvetica-Bold');
                cols.forEach(c => doc.text(c.label, c.x, y + 7));
                y += 28;
                doc.font('Helvetica').fontSize(8).fillColor('#334155');
            }
            doc.text(`#${o._id.toString().slice(-6)}`, 55, y);
            doc.text(new Date(o.createdAt).toLocaleDateString('en-IN'), 140, y);
            doc.text((o.user?.name || 'Guest').substring(0, 18), 250, y);
            doc.text(`Rs. ${o.totalAmount}`, 370, y);
            const isDlv = DELIVERED.includes(o.status);
            doc.fillColor(isDlv ? '#16a34a' : '#2563eb').text(o.status.toUpperCase(), 460, y);
            doc.fillColor('#334155');
            doc.moveTo(50, y + 14).lineTo(550, y + 14).strokeColor('#e2e8f0').stroke();
            y += 20;
        }
        if (!orders.length) {
            doc.fontSize(11).fillColor('#94a3b8').text('No orders in this period.', 50, y + 10, { align: 'center', width: 500 });
        }

        // ── FOOTER ──
        const fY = doc.page.height - 50;
        doc.moveTo(50, fY).lineTo(550, fY).strokeColor('#e2e8f0').stroke();
        doc.fontSize(7).fillColor('#94a3b8').text(
            'Generated by FoodHub Now  |  Support: 6375157243  |  anikjain4470@gmail.com',
            50, fY + 8, { align: 'center', width: 500 }
        );
        doc.end();
    } catch (e) {
        console.error('PDF Error:', e);
        if (!res.headersSent) res.status(500).json({ message: 'PDF generation error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  4) GET /csv
// ═══════════════════════════════════════════════════════════
router.get('/csv', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);
        const hotel = await findHotel(req.user);
        if (!hotel) return res.status(404).json({ message: 'Restaurant not found' });

        const orders = await Order.find(buildQuery(hotel._id, start, end))
            .populate('user', 'name').sort({ createdAt: -1 });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=FoodHubNow_Orders_${range}_${Date.now()}.csv`);

        let csv = 'Order ID,Date,Customer,Amount,Payment Method,Status\n';
        for (const o of orders) {
            csv += `#${o._id.toString().slice(-6)},${new Date(o.createdAt).toLocaleDateString('en-IN')},${(o.user?.name || 'Guest').replace(/,/g, ' ')},${o.totalAmount},${o.paymentMethod || 'N/A'},${o.status}\n`;
        }
        res.send(csv);
    } catch (e) {
        console.error('CSV Error:', e);
        res.status(500).json({ message: 'CSV generation error' });
    }
});

// ═══════════════════════════════════════════════════════════
//  5) GET /excel
// ═══════════════════════════════════════════════════════════
router.get('/excel', protect, restrictTo('restaurant'), async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        const { start, end } = getDateRange(range, startDate, endDate);
        const hotel = await findHotel(req.user);
        if (!hotel) return res.status(404).json({ message: 'Restaurant not found' });

        const orders = await Order.find(buildQuery(hotel._id, start, end))
            .populate('user', 'name').sort({ createdAt: -1 });

        const { totalOrders, totalRevenue, avgOrderValue } = calcMetrics(orders);

        const wb = new ExcelJS.Workbook();
        wb.creator = 'FoodHub Now';
        const ws = wb.addWorksheet('Sales Report');

        // Header rows
        ws.mergeCells('A1:F1');
        ws.getCell('A1').value = `${hotel.name} — ${rangeLabel(range)} Report`;
        ws.getCell('A1').font = { bold: true, size: 14 };

        ws.mergeCells('A2:F2');
        ws.getCell('A2').value = `${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}`;
        ws.getCell('A2').font = { size: 10, color: { argb: 'FF888888' } };

        // Summary row
        ws.getCell('A4').value = 'Total Orders'; ws.getCell('B4').value = totalOrders;
        ws.getCell('C4').value = 'Total Revenue'; ws.getCell('D4').value = totalRevenue;
        ws.getCell('E4').value = 'Avg Order Value'; ws.getCell('F4').value = avgOrderValue;
        ws.getRow(4).font = { bold: true };

        // Table header
        const headerRow = ws.addRow([]);
        const tableHeader = ws.addRow(['Order ID', 'Date', 'Customer', 'Amount (₹)', 'Payment Method', 'Status']);
        tableHeader.font = { bold: true };
        tableHeader.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // Data rows
        for (const o of orders) {
            ws.addRow([
                `#${o._id.toString().slice(-6)}`,
                new Date(o.createdAt).toLocaleDateString('en-IN'),
                o.user?.name || 'Guest',
                o.totalAmount,
                o.paymentMethod || 'N/A',
                o.status.toUpperCase()
            ]);
        }

        // Column widths
        ws.columns = [
            { width: 14 }, { width: 14 }, { width: 22 }, { width: 14 }, { width: 18 }, { width: 14 }
        ];

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=FoodHubNow_Report_${range}_${Date.now()}.xlsx`);

        await wb.xlsx.write(res);
        res.end();
    } catch (e) {
        console.error('Excel Error:', e);
        if (!res.headersSent) res.status(500).json({ message: 'Excel generation error' });
    }
});

module.exports = router;
