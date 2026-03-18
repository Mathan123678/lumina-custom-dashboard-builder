const { EventEmitter } = require('events');

// Singleton event bus for order updates (works for both MongoDB and mock DB)
const orderEvents = new EventEmitter();

// Avoid memory leak warnings in dev (many SSE clients)
orderEvents.setMaxListeners(0);

module.exports = orderEvents;

