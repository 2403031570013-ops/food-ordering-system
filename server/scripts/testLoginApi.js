const axios = require('axios');

async function testLogin() {
    const url = 'http://localhost:5000/api/auth/login';
    const payload = {
        email: 'restaurant@foodhub.com',
        password: 'restaurant123'
    };

    console.log(`Attempting login to: ${url}`);
    console.log(`Payload:`, payload);

    try {
        const response = await axios.post(url, payload);
        console.log('✅ LOGIN SUCCESS!');
        console.log('Status:', response.status);
        console.log('Token:', response.data.token ? 'Received' : 'Missing');
        console.log('User Role:', response.data.user.role);
    } catch (error) {
        console.log('❌ LOGIN FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();
