const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if credentials exist
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email credentials not found. Skipping email sending.');
        console.log(`[MOCK EMAIL] To: ${options.email}, Subject: ${options.subject}, Body having attachment: ${!!options.attachments}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `FoodHub <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
        attachments: options.attachments // Array of { filename, path }
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${options.email}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
    }
};

module.exports = sendEmail;
