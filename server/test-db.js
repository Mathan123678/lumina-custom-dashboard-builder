require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  const uri = process.env.MONGODB_URI;
  console.log('Testing connection to:', uri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('SUCCESS: Connected to MongoDB Atlas successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB Atlas.');
    console.error('Error:', err.message);
    process.exit(1);
  }
};

testConnection();
