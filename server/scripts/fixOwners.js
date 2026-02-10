const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PLAIN_PASSWORD = 'Food@123';

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require(path.join(__dirname, '..', 'models', 'User'));
    const Hotel = require(path.join(__dirname, '..', 'models', 'Hotel'));

    // Fix all hotels status
    await Hotel.collection.updateMany(
        {},
        { $set: { approved: true, status: 'active', menuStatus: 'ACTIVE' } }
    );
    console.log('✅ All hotels status -> active\n');

    const restaurantOwners = [
        { restaurantName: 'Midnight Munchies', email: 'midnight@foodhub.com', name: 'Midnight Munchies Owner', phone: '9876543001' },
        { restaurantName: 'Bombay Biryani House', email: 'bombay@foodhub.com', name: 'Bombay Biryani Owner', phone: '9876543002' },
        { restaurantName: 'Dragon Bowl', email: 'dragon@foodhub.com', name: 'Dragon Bowl Owner', phone: '9876543003' },
        { restaurantName: 'Spice Villa', email: 'spicevilla@foodhub.com', name: 'Spice Villa Owner', phone: '9876543004' },
    ];

    for (const ro of restaurantOwners) {
        let user = await User.findOne({ email: ro.email });

        if (!user) {
            // User.create calls save() which triggers pre-save hook to hash password
            user = new User({
                name: ro.name,
                email: ro.email,
                password: PLAIN_PASSWORD,  // pre-save hook will hash this
                role: 'restaurant',
                phone: ro.phone,
                firstLogin: false
            });
            await user.save();
            console.log(`  ✅ Created: ${ro.email}`);
        } else {
            // For existing user, set password (triggers pre-save hook)
            user.role = 'restaurant';
            user.name = ro.name;
            user.password = PLAIN_PASSWORD;  // pre-save hook will hash this
            user.firstLogin = false;
            await user.save();
            console.log(`  🔄 Updated: ${ro.email}`);
        }

        // Link hotel
        await Hotel.collection.updateOne(
            { name: ro.restaurantName },
            { $set: { user: user._id, email: ro.email } }
        );
        console.log(`  🔗 Linked: "${ro.restaurantName}" -> ${ro.email}\n`);
    }

    // Fix admin accounts
    const adminAccounts = ['admin@foodhub.com', 'demo@foodhub.com'];
    for (const email of adminAccounts) {
        const admin = await User.findOne({ email }).select('+password');
        if (admin) {
            admin.password = PLAIN_PASSWORD;  // pre-save hook hashes
            admin.role = 'admin';
            admin.firstLogin = false;
            await admin.save();
            console.log(`  ✅ Admin fixed: ${email}`);
        }
    }

    // Fix user accounts
    const userAccounts = ['anikjain4470@gmail.com'];
    for (const email of userAccounts) {
        const u = await User.findOne({ email }).select('+password');
        if (u) {
            u.password = PLAIN_PASSWORD;
            u.firstLogin = false;
            await u.save();
            console.log(`  ✅ User fixed: ${email}`);
        }
    }

    console.log('\n==========================================');
    console.log('   ALL CREDENTIALS — Password: Food@123');
    console.log('==========================================');
    console.log('\n👑 ADMIN:');
    console.log('   admin@foodhub.com / Food@123');
    console.log('   demo@foodhub.com  / Food@123');
    console.log('\n🏪 RESTAURANTS:');
    restaurantOwners.forEach(ro => {
        console.log(`   ${ro.email.padEnd(26)} / Food@123  (${ro.restaurantName})`);
    });
    console.log('\n👤 USER:');
    console.log('   anikjain4470@gmail.com / Food@123');
    console.log('==========================================');

    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('DB Error:', err.message);
    process.exit(1);
});
