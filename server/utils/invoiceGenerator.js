const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            // Create invoices directory if it doesn't exist
            // Create invoices directory if it doesn't exist
            // Store in server/public/invoices so express.static can serve it
            const invoiceDir = path.join(__dirname, '../public/invoices');
            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const fileName = `${invoiceNumber}.pdf`;
            const filePath = path.join(invoiceDir, fileName);

            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- HEADER ---
            doc.fillColor('#444444')
                .fontSize(20)
                .text('FoodHub Invoice', 50, 57)
                .fontSize(10)
                .text('FoodHub Inc.', 200, 50, { align: 'right' })
                .text('123 Food Street', 200, 65, { align: 'right' })
                .text('Mumbai, India, 400001', 200, 80, { align: 'right' })
                .moveDown();

            // --- DIVIDER ---
            doc.moveTo(50, 100).lineTo(550, 100).stroke();

            // --- INFO ---
            doc.fontSize(10)
                .text(`Invoice Number: ${invoiceNumber}`, 50, 110)
                .text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 125)
                .text(`Order ID: ${order._id}`, 50, 140)
                .text(`Payment ID: ${order.razorpayPaymentId || 'N/A'}`, 50, 155)
                .text(`Customer Name: ${user.name || order.deliveryAddress.fullName}`, 300, 110, { align: 'right' })
                .text(`Address: ${order.deliveryAddress.city}, ${order.deliveryAddress.state}`, 300, 125, { align: 'right' })
                .moveDown();

            // --- TABLE HEADER ---
            const tableTop = 200;
            doc.font('Helvetica-Bold');
            doc.text('Item', 50, tableTop);
            doc.text('Qty', 300, tableTop, { width: 90, align: 'right' });
            doc.text('Price', 400, tableTop, { width: 90, align: 'right' });
            doc.text('Total', 500, tableTop, { width: 90, align: 'right' });
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // --- TABLE ROWS ---
            let position = tableTop + 30;
            doc.font('Helvetica');

            order.items.forEach(item => {
                doc.text(item.name.substring(0, 30), 50, position);
                doc.text(item.quantity, 300, position, { width: 90, align: 'right' });
                doc.text(`₹${item.price}`, 400, position, { width: 90, align: 'right' });
                doc.text(`₹${item.price * item.quantity}`, 500, position, { width: 90, align: 'right' });
                position += 20;
            });

            // --- TOTALS ---
            const subtotalTop = position + 20;
            doc.moveTo(50, subtotalTop).lineTo(550, subtotalTop).stroke();

            doc.font('Helvetica-Bold');
            const subtotal = order.subtotal || order.totalAmount; // Fallback if subtotal missing
            const tax = order.taxPrice || 0;
            const total = order.totalAmount;

            doc.text('Subtotal:', 400, subtotalTop + 15, { width: 90, align: 'right' });
            doc.text(`₹${subtotal}`, 500, subtotalTop + 15, { width: 90, align: 'right' });

            doc.text('Tax (GST):', 400, subtotalTop + 30, { width: 90, align: 'right' });
            doc.text(`₹${tax}`, 500, subtotalTop + 30, { width: 90, align: 'right' });

            doc.fontSize(14)
                .text('Total Amount:', 400, subtotalTop + 55, { width: 90, align: 'right' });
            doc.text(`₹${total}`, 500, subtotalTop + 55, { width: 90, align: 'right' });

            // --- FOOTER ---
            doc.fontSize(10).fillColor('gray')
                .text('Thank you for ordering with FoodHub!', 50, 700, { align: 'center', width: 500 });


            doc.end();

            stream.on('finish', () => {
                // Return relative path for URL and absolute info
                resolve({
                    invoiceNumber,
                    filePath,
                    relativeUrl: `/invoices/${fileName}`
                });
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateInvoice;
