const https = require('https');

async function test() {
    const url = 'https://localhost:44382/auth/login'; // Example endpoint
    console.log(`Testing connection to: ${url}`);
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
            // This is what I suspect is needed:
            agent: new https.Agent({ rejectUnauthorized: false })
        });
        console.log(`Status: ${res.status}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
