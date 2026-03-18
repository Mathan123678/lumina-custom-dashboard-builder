const { models: { Order } } = require('../db');
const orderEvents = require('../utils/orderEvents');

function emitOrdersChanged(action, id) {
  orderEvents.emit('orders_changed', { action, id, ts: Date.now() });
}

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stream order updates (Server-Sent Events)
exports.streamOrders = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent('hello', { ok: true, ts: Date.now() });
  const pingId = setInterval(() => sendEvent('ping', { ts: Date.now() }), 25000);

  const onChange = (payload) => sendEvent('orders_changed', payload);
  orderEvents.on('orders_changed', onChange);

  req.on('close', () => {
    clearInterval(pingId);
    orderEvents.off('orders_changed', onChange);
  });
};

// Create an order
exports.createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    emitOrdersChanged('created', newOrder._id || newOrder.id);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    emitOrdersChanged('updated', updatedOrder._id || updatedOrder.id);
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    emitOrdersChanged('deleted', deletedOrder._id || deletedOrder.id);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
