const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboardConfig);
router.post('/', dashboardController.saveDashboardConfig);

module.exports = router;
