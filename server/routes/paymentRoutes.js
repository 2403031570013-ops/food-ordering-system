const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Initiate Payment (Create DB Order + Razorpay Order)
// 1. Initiate Payment (Create DB Order + Razorpay Order)
// 1. Initiate Payment (Create DB Order + Razorpay Order)
router.post('/initiate', async (req, res) => {
    try {
        const { items, deliveryAddress, totalAmount, user, orderId, paymentMethod, couponCode, discountAmount } = req.body;

        // --- 1. Validation ---
        if (!user || !items || items.length === 0) {
            console.error('Payment Initiate Error: Missing user or items', { user, itemCount: items?.length });
            return res.status(400).json({ success: false, message: 'Invalid order data. User or items missing.' });
        }

        if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid total amount.' });
        }

        // --- Helper: Get Hotel ID from first item ---
        const Food = require('../models/Food');
        const firstFoodItem = await Food.findById(items[0].food);
        if (!firstFoodItem) {
            return res.status(400).json({ success: false, message: 'Invalid food item detected.' });
        }
        const hotelId = firstFoodItem.hotelId;

        // --- Handle COD (Cash on Delivery) ---
        if (paymentMethod === 'COD') {
            const newOrder = new Order({
                user: user,
                hotel: hotelId,
                items: items,
                deliveryAddress: deliveryAddress,
                totalAmount: totalAmount,
                paymentMethod: 'COD',
                paymentStatus: 'PENDING',
                status: 'PLACED',
                couponCode,
                discountAmount,
                createdAt: new Date()
            });
            await newOrder.save();

            return res.status(200).json({
                success: true,
                orderId: newOrder._id,
                paymentMethod: 'COD',
                message: 'Order placed successfully via COD'
            });
        }

        // --- Handle ONLINE Payment (Razorpay) ---
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('SERVER CONFIG ERROR: Razorpay keys missing');
            return res.status(500).json({ success: false, message: 'Payment service configuration error.' });
        }

        // --- 2. Check for Existing Order (Idempotency for Retries) ---
        let targetOrder;

        if (orderId) {
            targetOrder = await Order.findById(orderId);
            if (targetOrder) {
                // If order is already paid, STOP.
                if (targetOrder.paymentStatus === 'paid' || targetOrder.paymentStatus === 'COMPLETED') {
                    return res.status(400).json({
                        success: false,
                        message: 'This order is already paid.',
                        orderId: targetOrder._id,
                        paymentStatus: targetOrder.paymentStatus
                    });
                }
                console.log(`Retrying payment for existing Order: ${orderId}`);
            }
        }

        // --- 3. Create or Update Razorpay Order ---
        const amountInPaise = Math.round(totalAmount * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: targetOrder
                ? `receipt_${targetOrder._id}_retry_${Date.now()}`
                : `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            payment_capture: 1,
        };

        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create(options);
        } catch (rzpError) {
            console.error('Razorpay API Error:', rzpError);
            return res.status(502).json({
                success: false,
                message: 'Failed to communicate with payment gateway',
                error: rzpError.error ? rzpError.error.description : rzpError.message
            });
        }

        // --- 4. Database Order (Create New or Update Existing) ---
        if (targetOrder) {
            // Update existing order with new Razorpay Order ID provided we aren't paid
            targetOrder.razorpayOrderId = razorpayOrder.id;
            targetOrder.totalAmount = totalAmount; // Update amount just in case
            targetOrder.hotel = hotelId; // Ensure hotel is set
            targetOrder.paymentMethod = 'ONLINE'; // Data integrity
            await targetOrder.save();
        } else {
            // Create New Order
            targetOrder = new Order({
                user: user,
                hotel: hotelId, // <--- IMPORTANT: Link order to Hotel
                items: items,
                deliveryAddress: deliveryAddress,
                totalAmount: totalAmount,
                paymentMethod: 'ONLINE',
                paymentStatus: 'PENDING',
                status: 'PLACED', // Updated to PLACED
                razorpayOrderId: razorpayOrder.id,
                razorpayOrderId: razorpayOrder.id,
                couponCode,
                discountAmount,
                // Add timestamp for debugging
                createdAt: new Date()
            });
            await targetOrder.save();
        }

        console.log(`Payment Initialized - Order: ${targetOrder._id} | Hotel: ${hotelId} | RZP: ${razorpayOrder.id}`);

        res.status(200).json({
            success: true,
            orderId: targetOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount, // Paise
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
            paymentMethod: 'ONLINE'
        });

    } catch (error) {
        console.error('CRITICAL: Initiate payment logic failed:', error);
        res.status(500).json({
            success: false,
            message: 'Server failed to initiate payment',
            error: error.message,
        });
    }
});

// 2. Verify Payment (Called by Frontend after success)
router.post('/verify', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // DB Order ID passed from frontend
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        // Update Order Status
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                orderId: order._id
            });
        }

        order.paymentStatus = 'paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id,
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message,
        });
    }
});

// 3. Webhook (Async Source of Truth)
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            // In some cases bodyParser might mess up JSON order, but for now this is standard. 
            // If it fails, we might need verify with raw body. 
            // Ideally we should return 400, but to avoid Razorpay retrying on config errors we can log and return 200 or 400.
            console.error('Webhook signature mismatch');
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;

            const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });

            if (order) {
                if (order.paymentStatus === 'paid') {
                    // DUPLICATE PAYMENT DETECTED!
                    console.warn(`Duplicate payment detected for Order ${order._id}. Initiating Refund...`);

                    try {
                        // Trigger Razorpay Refund
                        const refund = await razorpay.payments.refund(payment.id, {
                            amount: payment.amount, // Full refund
                            speed: 'optimum',
                            notes: {
                                reason: 'Duplicate Payment Auto-Refund',
                                orderId: order._id.toString()
                            }
                        });

                        // Update Order with Refund Details
                        order.isDuplicatePayment = true;
                        order.refundId = refund.id;
                        order.refundAmount = refund.amount / 100; // Store in Rupees
                        order.refundStatus = refund.status;
                        await order.save();

                        console.log(`Auto-refund successful for Order ${order._id}. Refund ID: ${refund.id}`);
                        // Here: Send email notification to user about auto-refund

                    } catch (refundError) {
                        console.error('Auto-refund failed:', refundError);
                        // Log this critical failure for manual intervention
                    }

                } else {
                    // Normal Success Case
                    order.paymentStatus = 'paid';
                    order.razorpayPaymentId = payment.id;
                    await order.save();
                    console.log(`Order ${order._id} marked as paid via Webhook`);

                    // --- GENERATE INVOICE ---
                    try {
                        const generateInvoice = require('../utils/invoiceGenerator');
                        const User = require('../models/User');
                        const user = await User.findById(order.user); // Fetch user details

                        const invoiceData = await generateInvoice(order, user || {});

                        // Save Invoice Metadata to Order
                        order.invoiceNumber = invoiceData.invoiceNumber;
                        order.invoiceUrl = invoiceData.relativeUrl;
                        order.invoiceGeneratedAt = new Date();
                        await order.save();

                        console.log(`Invoice generated for Order ${order._id}: ${invoiceData.invoiceNumber}`);

                        // --- SEND EMAIL ---
                        const sendEmail = require('../utils/emailService');
                        await sendEmail({
                            email: user.email,
                            subject: `Order Confirmation & Invoice - ${invoiceData.invoiceNumber}`,
                            message: `Hi ${user.name},\n\nThank you for your order! Please find your invoice attached.\n\nRegards,\nFoodHub Team`,
                            html: `<h1>Thank You for Your Order!</h1><p>Hi ${user.name},</p><p>We have received your payment. Your order is now being prepared.</p><p>Please find your invoice attached.</p>`,
                            attachments: [
                                {
                                    filename: `${invoiceData.invoiceNumber}.pdf`,
                                    path: invoiceData.filePath
                                }
                            ]
                        });

                    } catch (invoiceError) {
                        console.error('Failed to generate invoice or send email:', invoiceError);
                        // Don't fail the webhook response, just log error
                    }
                }
            }
        } else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
            if (order) {
                order.paymentStatus = 'failed';
                await order.save();
            }
        }

        res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

const { protect, admin } = require('../middleware/auth');

// ... (existing code)

// 4. Admin: Manual Refund
router.post('/refund', protect, admin, async (req, res) => {
    try {
        const { orderId, amount } = req.body; // Amount is optional (for partial refunds)

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.razorpayPaymentId) {
            return res.status(400).json({ message: 'No payment ID found for this order' });
        }

        // Trigger Razorpay Refund
        const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: amount ? amount * 100 : undefined, // Check if amount is passed (in Rupees) -> convert to paise
            speed: 'optimum',
            notes: {
                reason: 'Admin Manual Refund',
                orderId: order._id.toString()
            }
        });

        // Update Order
        order.paymentStatus = 'refunded';
        order.refundId = refund.id;
        order.refundAmount = refund.amount / 100;
        order.refundStatus = refund.status;
        await order.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refundId: refund.id
        });

    } catch (error) {
        console.error('Manual refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund failed',
            error: error.error ? error.error.description : error.message
        });
    }
});

module.exports = router;
