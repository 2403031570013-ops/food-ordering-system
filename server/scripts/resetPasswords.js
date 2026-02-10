const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const COMMON_PASSWORD = 'Food@123';

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require(path.join(__dirname, '..', 'models', 'User'));

    const hashedPassword = await bcrypt.hash(COMMON_PASSWORD, 12);

    // Reset password for key accounts
    const accounts = [
        'admin@foodhub.com',
        'demo@foodhub.com',
        'owner@foodhub.com',
        'restaurant@foodhub.com',
        'bombay@foodhub.com',
        'anikjain4470@gmail.com',
        '2403031570013@paruluniversity.ac.in',
        '2403031570115@paruluniversity.ac.in',
        'partner1@test.com',
        'partner2@test.com',
        'anikjain44709@gmail.com',
        'abhi1234coz@gmail.com',
    ];

    for (const email of accounts) {
        const result = await User.updateOne({ email }, { $set: { password: hashedPassword } });
        if (result.modifiedCount > 0) {
            console.log(`  ✅ ${email} -> Password reset to: ${COMMON_PASSWORD}`);
        } else {
            console.log(`  ⚠️  ${email} -> Not found or already set`);
        }
    }

    console.log('\n========================================');
    console.log('All accounts password set to: ' + COMMON_PASSWORD);
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('DB Error:', err.message);
    process.exit(1);
});
