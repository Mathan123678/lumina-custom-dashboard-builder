const { models: { DashboardConfig } } = require('../db');

// Get dashboard config
exports.getDashboardConfig = async (req, res) => {
  try {
    const organization = req.user?.organization;
    let config = await DashboardConfig.findOne({ organization });
    if (!config) {
      // Return empty config if none exists
      return res.status(200).json({ widgets: [] });
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save or Update dashboard config
exports.saveDashboardConfig = async (req, res) => {
  try {
    const organization = req.user?.organization;
    let config = await DashboardConfig.findOne({ organization });
    if (config) {
      config.widgets = req.body.widgets;
      const updatedConfig = await config.save();
      return res.status(200).json(updatedConfig);
    } else {
      const newConfig = new DashboardConfig({ organization, widgets: req.body.widgets });
      const savedConfig = await newConfig.save();
      return res.status(201).json(savedConfig);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
