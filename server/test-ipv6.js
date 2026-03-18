require('dotenv').config();
const mongoose = require('mongoose');

const testIpv6 = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('Testing IPv6 connection for:', uri);

  try {
    // We try to connect by forcing IPv6 family
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 6 
    });
    console.log('SUCCESS: Connected via IPv6 successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: IPv6 connection failed.');
    console.error('Error:', err.message);
    process.exit(1);
  }
};

testIpv6();
