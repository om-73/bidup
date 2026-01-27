const axios = require('axios');

async function testPublicView() {
    const baseUrl = 'http://localhost:3000';
    try {
        console.log('Creating item...');
        const createRes = await axios.post(`${baseUrl}/api/pastes`, {
            content: 'Test Content',
            starting_bid: 100
        });
        const id = createRes.data.id;
        console.log(`Created ID: ${id}`);

        console.log('Fetching public view...');
        const viewRes = await axios.get(`${baseUrl}/p/${id}`);

        if (viewRes.status === 200) {
            console.log('SUCCESS: Page loaded');
            if (viewRes.data.includes('₹100')) {
                console.log('SUCCESS: Currency symbol found');
            } else {
                console.log('WARNING: Currency symbol not found');
            }
        }
    } catch (err) {
        console.error('FAILED:', err.message);
        if (err.response) console.error('Status:', err.response.status);
    }
}

testPublicView();
