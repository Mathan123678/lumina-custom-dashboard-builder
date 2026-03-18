const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log(`Connecting to: ${uri}...`);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:');
    console.error(`Code: ${err.code}`);
    console.error(`Message: ${err.message}`);
    process.exit(1);
  });
