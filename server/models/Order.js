const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, enum: ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'] }
  },
  orderInfo: {
    product: { 
      type: String, 
      required: true, 
      enum: ['Fiber Internet 300 Mbps', '5GUnlimited Mobile Plan', 'Fiber Internet 1 Gbps', 'Business Internet 500 Mbps', 'VoIP Corporate Package'] 
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Pending', 'In progress', 'Completed'], default: 'Pending' },
    createdBy: { 
      type: String, 
      required: true, 
      enum: ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'] 
    },
    duration: { type: Number, required: true, default: 12 },
    orderDate: { type: Date, default: Date.now }
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
