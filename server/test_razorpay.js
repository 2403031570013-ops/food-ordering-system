require('dotenv').config();
const Razorpay = require('razorpay');

async function testRazorpay() {
    console.log("Checking Environment Variables...");
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error("❌ MISSING RAZORPAY KEYS!");
        console.log("Key ID present:", !!keyId);
        console.log("Key Secret present:", !!keySecret);
        process.exit(1);
    }

    console.log(`Key ID: ${keyId.substr(0, 5)}...`);
    console.log("Initializing Razorpay...");

    const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    try {
        console.log("Attempting to create a test order...");
        const options = {
            amount: 100, // 1 INR
            currency: 'INR',
            receipt: 'test_receipt_1',
            notes: { purpose: 'debugging' }
        };
        const order = await razorpay.orders.create(options);
        console.log("✅ SUCCESS! Order Created:");
        console.log(order);
    } catch (error) {
        console.error("❌ FAILED to create order:");
        console.error(JSON.stringify(error, null, 2));
    }
}

testRazorpay();
