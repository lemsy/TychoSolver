// Download a static map image of Spain using OpenStreetMap staticmap API
const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://staticmap.openstreetmap.de/staticmap.php?center=40.0,-3.5&zoom=6&size=600x600&maptype=mapnik';
const outPath = path.join(__dirname, 'spain_map.png');

https.get(url, (res) => {
    if (res.statusCode !== 200) {
        console.error('Failed to download map:', res.statusCode);
        return;
    }
    const file = fs.createWriteStream(outPath);
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Map image downloaded to', outPath);
    });
}).on('error', (err) => {
    console.error('Error downloading map:', err);
});
