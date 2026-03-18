const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Telecom Order Analytics Dashboard API is running');
});

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;

  console.log('Attempting persistent MongoDB connection...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to persistent MongoDB successfully');
    return true;
  } catch (err) {
    console.error('--- MONGODB CONNECTION ERROR ---');
    console.error('URI:', uri);
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    console.warn('Falling back to JSON persistence...');
    return false;
  }
}

function registerSystemRoutes() {
  const { models } = require('./db');
  const { DB_PATH } = require('./utils/mockDb');

  app.get('/api/health', (req, res) => res.status(200).json({ ok: true, ts: Date.now() }));

  app.get('/api/db-status', (req, res) => {
    res.status(200).json({
      ok: true,
      isMock: Boolean(models.isMock),
      dataPath: models.isMock ? DB_PATH : null,
      mongoReadyState: mongoose.connection?.readyState ?? 0,
      ts: Date.now(),
    });
  });
}

function registerApiRoutes() {
  const authRoutes = require('./routes/authRoutes');
  const orderRoutes = require('./routes/orderRoutes');
  const dashboardRoutes = require('./routes/dashboardRoutes');
  const { protect, protectSse } = require('./middleware/auth');
  const { streamOrders } = require('./controllers/orderController');

  app.use('/api/auth', authRoutes);
  app.get('/api/orders/stream', protectSse, streamOrders);
  app.use('/api/orders', protect, orderRoutes);
  app.use('/api/dashboard', protect, dashboardRoutes);
}

async function start() {
  try {
    const connected = await connectDatabase();
    if (!connected) {
      const { useMock } = require('./db');
      useMock();
      console.log('Connected to JSON File Persistence successfully');
    }

    registerSystemRoutes();
    registerApiRoutes();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (err) {
    console.error('Critical failure starting server:', err.message);
    process.exit(1);
  }
}

start();