const mongoose = require('mongoose');
const mockDb = require('./utils/mockDb');

let models = {
  Order: require('./models/Order'),
  DashboardConfig: require('./models/DashboardConfig'),
  User: require('./models/User'),
  isMock: false
};

const useMock = () => {
  console.log('--- SWITCHING TO JSON PERSISTENCE (MOCK DB) ---');
  models.Order = mockDb.Order;
  models.DashboardConfig = mockDb.DashboardConfig;
  models.User = new (require('./utils/mockDb').MockModel)('users');
  models.isMock = true;
};

module.exports = {
  models,
  useMock
};
