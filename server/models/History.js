const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  equation: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', historySchema);
