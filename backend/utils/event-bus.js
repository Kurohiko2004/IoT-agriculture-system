const EventEmitter = require('events');

// Tạo một instance duy nhất (Singleton)
const eventBus = new EventEmitter();

module.exports = eventBus;