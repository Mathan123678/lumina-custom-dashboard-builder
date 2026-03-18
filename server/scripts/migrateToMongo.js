const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const DB_PATH = path.join(__dirname, '../data');
const collections = ['users', 'orders', 'dashboard_configs'];

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');

    for (const col of collections) {
      const filePath = path.join(DB_PATH, `${col}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${col}: file not found`);
        continue;
      }

      console.log(`Migrating ${col}...`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Determine model
      let Model;
      if (col === 'users') Model = require('../models/User');
      else if (col === 'orders') Model = require('../models/Order');
      else if (col === 'dashboard_configs') Model = require('../models/DashboardConfig');

      if (Model) {
        // Clear existing data? Or just insert?
        // await Model.deleteMany({}); 
        await Model.insertMany(data);
        console.log(`Migrated ${data.length} items to ${col}`);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
