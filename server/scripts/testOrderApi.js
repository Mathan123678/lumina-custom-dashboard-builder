const http = require('http');

const baseURL = 'localhost';
const port = 5000;

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : {}
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCreateOrder() {
  try {
    console.log('--- TEST: CREATE ORDER ---');
    
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await request({
      hostname: baseURL,
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'mathansmathan27@gmail.com',
      password: 'Mathan@123'
    });
    
    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.status, loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('Login successful! Token acquired.');

    // 2. Sample order data
    const orderData = {
      customerInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'United States'
      },
      orderInfo: {
        product: 'Fiber Internet 300 Mbps',
        quantity: 1,
        unitPrice: 50,
        totalAmount: 50,
        status: 'Pending',
        createdBy: 'Mr. Michael Harris'
      }
    };

    // 3. Create order
    console.log('Creating order...');
    const orderRes = await request({
      hostname: baseURL,
      port: port,
      path: '/api/orders',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, orderData);

    console.log('Order created successfully!');
    console.log('Response Status:', orderRes.status);
    console.log('Response Data:', JSON.stringify(orderRes.data, null, 2));

  } catch (error) {
    console.error('--- TEST FAILED ---');
    console.error(error.message);
  }
}

testCreateOrder();
