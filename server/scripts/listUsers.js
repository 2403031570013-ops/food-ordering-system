const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require(path.join(__dirname, '..', 'models', 'User'));
    const Hotel = require(path.join(__dirname, '..', 'models', 'Hotel'));

    let output = '========== ALL USERS ==========\n';
    const users = await User.find({}, 'name email role phone');
    users.forEach(u => {
        output += `Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Phone: ${u.phone || 'N/A'}\n`;
    });

    output += '\n========== ALL RESTAURANTS ==========\n';
    const hotels = await Hotel.find({}, 'name email user approved status');
    for (const h of hotels) {
        const owner = await User.findById(h.user, 'name email role');
        output += `Restaurant: ${h.name} | Owner Email: ${owner ? owner.email : h.email} | Owner: ${owner ? owner.name : 'N/A'} | Approved: ${h.approved}\n`;
    }

    output += '\nNOTE: Passwords are bcrypt hashed - cannot show plain text.\n';

    fs.writeFileSync(path.join(__dirname, 'users_output.txt'), output);
    console.log('Written to scripts/users_output.txt');

    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('DB Error:', err.message);
    process.exit(1);
});
