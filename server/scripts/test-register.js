const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('Registration Success:', res.data);
    } catch (err) {
        console.error('Registration Failed:', err.response?.data || err.message);
    }
}

testRegister();
