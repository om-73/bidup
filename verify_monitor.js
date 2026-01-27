const axios = require('axios');

async function testMonitoring() {
    const baseUrl = 'http://localhost:3000';

    try {
        console.log('1. Creating new auction item...');
        const createRes = await axios.post(`${baseUrl}/api/pastes`, {
            content: 'Monitoring Test',
            starting_bid: 50,
            max_views: 5,
            ttl_seconds: 60
        });
        const id = createRes.data.id;
        console.log(`   Created item ID: ${id}`);

        console.log('2. Placing a bid...');
        await axios.post(`${baseUrl}/api/pastes/${id}/bids`, { amount: 60 });
        console.log('   Bid placed.');

        console.log('3. Accessing Monitoring Page...');
        const monitorRes = await axios.get(`${baseUrl}/p/monitor/${id}`);

        if (monitorRes.status === 200 && monitorRes.data.includes('Owner Dashboard')) {
            console.log('   SUCCESS: Monitoring page loaded.');

            if (monitorRes.data.includes('₹60.00')) {
                console.log('   SUCCESS: Bid history displayed.');
            } else {
                console.error('   FAIL: Bid history not found.');
            }
        } else {
            console.error('   FAIL: Monitoring page returned unexpected status or content.');
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

testMonitoring();
