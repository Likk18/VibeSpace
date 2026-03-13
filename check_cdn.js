import https from 'https';

const url = "https://cdn.jsdelivr.net/gh/Likk18/VibeSpace@main/client/assets/Backgrounds/Backgrounds/floors/hardwood/be472cadba550f362e6a59cac14c1220.jpg";

https.get(url, (res) => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    let data = '';
    res.on('data', chunk => {
        data += chunk.toString('utf8').substring(0, 100); // just grab a bit
    });
    res.on('end', () => {
        console.log("Beginning of data:", data.substring(0, 100));
        if (data.includes('Couldn\'t find the requested file')) {
            console.log("ERROR: jsDelivr returned a 404 HTML page instead of the image because it's not flushed.");
        }
    });
}).on('error', (e) => {
    console.error(e);
});
