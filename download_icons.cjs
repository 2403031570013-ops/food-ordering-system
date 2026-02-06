const fs = require('fs');
const https = require('https');

const download = (url, dest) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${dest}`);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => { });
        console.error(`Error downloading ${dest}: ${err.message}`);
    });
};

// Ensure public directory exists
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

download('https://placehold.co/192x192/ea580c/ffffff/png?text=FoodHub', 'public/pwa-192x192.png');
download('https://placehold.co/512x512/ea580c/ffffff/png?text=FoodHub', 'public/pwa-512x512.png');
