const mongoose = require('mongoose');

const DashboardConfigSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  widgets: [{
    id: { type: String, required: true },
    type: { type: String, required: true }, // 'kpi', 'bar', 'line', 'pie', 'area', 'scatter', 'table'
    title: { type: String, default: 'Untitled' },
    description: { type: String },
    layout: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      w: { type: Number, required: true },
      h: { type: Number, required: true }
    },
    // Optional: responsive layouts per breakpoint (lg/md/sm/xs/xxs)
    layouts: { type: Object, default: undefined },
    settings: {
      // KPI settings
      metric: { type: String },
      aggregation: { type: String }, // 'sum', 'avg', 'count'
      format: { type: String }, // 'number', 'currency'
      precision: { type: Number, default: 0 },
      
      // Chart settings
      xAxis: { type: String },
      yAxis: { type: String },
      color: { type: String, default: '#54bd95' },
      showLabel: { type: Boolean, default: false },
      showLegend: { type: Boolean, default: true },
      
      // Table settings
      columns: [{ type: String }],
      sort: { type: String },
      pagination: { type: Number, default: 5 },
      filters: [{ type: Object }],
      fontSize: { type: Number, default: 14 },
      headerBgColor: { type: String, default: '#54bd95' }
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('DashboardConfig', DashboardConfigSchema);
