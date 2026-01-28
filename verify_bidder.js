const axios = require('axios');

async function verifyBidderName() {
    const baseUrl = 'http://localhost:3000';
    try {
        console.log('1. Creating auction...');
        const createRes = await axios.post(`${baseUrl}/api/pastes`, {
            content: 'Bidder Name Test',
            starting_bid: 100,
            title: 'Cool Item'
        });
        const id = createRes.data.id;
        console.log(`   ID: ${id}`);

        console.log('2. Placing bid with name...');
        await axios.post(`${baseUrl}/api/pastes/${id}/bids`, {
            amount: 150,
            bidderName: 'Antigravity'
        });
        console.log('   Bid placed.');

        console.log('3. Checking API monitoring data...');
        const monitorRes = await axios.get(`${baseUrl}/api/pastes/${id}/monitor`);
        const history = monitorRes.data.bid_history;

        if (history.length > 0 && history[0].bidderName === 'Antigravity') {
            console.log('   SUCCESS: Bidder name "Antigravity" found in history.');
        } else {
            console.error('   FAIL: Bidder name not found or incorrect.', JSON.stringify(history, null, 2));
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

verifyBidderName();
