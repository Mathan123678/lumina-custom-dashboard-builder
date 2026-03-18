const { models: { Order, DashboardConfig } } = require('../db');

const sampleOrders = [
  {
    customerInfo: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.j@example.com',
      phone: '+1 555-010-9988',
      street: '123 Maple Ave',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States'
    },
    orderInfo: {
      product: 'Fiber Internet 1 Gbps',
      quantity: 1,
      unitPrice: 89.99,
      totalAmount: 89.99,
      status: 'Completed',
      createdBy: 'Ms. Olivia Carter',
      duration: 12,
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    customerInfo: {
      firstName: 'Robert',
      lastName: 'Smith',
      email: 'r.smith@extel.net',
      phone: '+65 9123 4567',
      street: '45 Orchard Road',
      city: 'Singapore',
      state: 'Central',
      postalCode: '238865',
      country: 'Singapore'
    },
    orderInfo: {
      product: '5G Unlimited Mobile Plan',
      quantity: 2,
      unitPrice: 45.00,
      totalAmount: 90.00,
      status: 'In progress',
      createdBy: 'Mr. Ryan Cooper',
      duration: 24,
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    customerInfo: {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'jwilson@business.com',
      phone: '+1 212-555-0198',
      street: '789 Broadway',
      city: 'New York',
      state: 'NY',
      postalCode: '10003',
      country: 'United States'
    },
    orderInfo: {
      product: 'Business Internet 500 Mbps',
      quantity: 1,
      unitPrice: 199.99,
      totalAmount: 199.99,
      status: 'Pending',
      createdBy: 'Mr. Michael Harris',
      duration: 6,
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    customerInfo: {
      firstName: 'Emma',
      lastName: 'Brown',
      email: 'emma.b@gmail.com',
      phone: '+61 412 345 678',
      street: '12 George St',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'Australia'
    },
    orderInfo: {
      product: 'VoIP Corporate Package',
      quantity: 5,
      unitPrice: 25.00,
      totalAmount: 125.00,
      status: 'Completed',
      createdBy: 'Mr. Lucas Martin',
      duration: 3,
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    customerInfo: {
      firstName: 'David',
      lastName: 'Lee',
      email: 'davidlee@hknet.hk',
      phone: '+852 2345 6789',
      street: '18 Nathan Road',
      city: 'Kowloon',
      state: 'HK',
      postalCode: '000000',
      country: 'Hong Kong'
    },
    orderInfo: {
      product: 'Fiber Internet 300 Mbps',
      quantity: 1,
      unitPrice: 55.00,
      totalAmount: 55.00,
      status: 'In progress',
      createdBy: 'Ms. Olivia Carter',
      duration: 12,
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

const defaultDashboard = {
  widgets: [
    {
      id: 'kpi_total_revenue',
      type: 'kpi',
      title: 'Total Revenue',
      description: 'Sum of all completed orders',
      layout: { x: 0, y: 0, w: 3, h: 2 },
      settings: {
        metric: 'Total amount',
        aggregation: 'sum',
        format: 'currency',
        precision: 2
      }
    },
    {
      id: 'kpi_order_count',
      type: 'kpi',
      title: 'Active Orders',
      description: 'Count of pending and in-progress orders',
      layout: { x: 3, y: 0, w: 3, h: 2 },
      settings: {
        metric: 'Status',
        aggregation: 'count',
        format: 'number',
        precision: 0
      }
    },
    {
      id: 'chart_revenue_by_product',
      type: 'bar',
      title: 'Revenue by Product',
      description: 'Total revenue breakdown by telecom product',
      layout: { x: 0, y: 2, w: 6, h: 4 },
      settings: {
        xAxis: 'Product',
        yAxis: 'Total amount',
        color: '#54bd95',
        showLabel: true,
        showLegend: true
      }
    },
    {
      id: 'chart_order_status',
      type: 'pie',
      title: 'Order Status Distribution',
      description: 'Current status of all orders',
      layout: { x: 6, y: 2, w: 6, h: 4 },
      settings: {
        xAxis: 'Status',
        yAxis: 'Quantity',
        showLabel: true,
        showLegend: true
      }
    },
    {
      id: 'recent_orders_table',
      type: 'table',
      title: 'Recent Orders',
      description: 'Overview of latest customer transactions',
      layout: { x: 0, y: 6, w: 12, h: 4 },
      settings: {
        columns: ['Order date', 'Customer name', 'Product', 'Total amount', 'Status', 'Created by'],
        sort: 'Descending',
        pagination: 5,
        fontSize: 14,
        headerBgColor: '#54bd95'
      }
    }
  ]
};

const seedData = async () => {
  try {
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(sampleOrders);
      console.log('Sample orders seeded');
    }

    const configCount = await DashboardConfig.countDocuments();
    if (configCount === 0) {
      await new DashboardConfig(defaultDashboard).save();
      console.log('Default dashboard configuration seeded');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
    throw err;
  }
};

module.exports = seedData;
