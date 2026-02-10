const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Hotel = require(path.join(__dirname, '..', 'models', 'Hotel'));

    // List all hotels
    const hotels = await Hotel.find({});
    for (const h of hotels) {
        console.log(JSON.stringify({
            name: h.name,
            approved: h.approved,
            status: h.status,
            menuStatus: h.menuStatus,
            id: h._id.toString()
        }));
    }

    // Approve ALL hotels
    const result = await Hotel.updateMany(
        {},
        { $set: { approved: true, status: 'approved', menuStatus: 'ACTIVE' } }
    );
    console.log('UPDATED:', result.modifiedCount, 'hotels approved');

    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('DB Error:', err.message);
    process.exit(1);
});
