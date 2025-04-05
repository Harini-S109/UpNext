const mongoose = require('mongoose');

const remainderSchema = new mongoose.Schema({
  userId: {type: String, required: true},

  title: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
});

// Export the model correctly
const Remainder = mongoose.model('Remainder', remainderSchema);
module.exports = Remainder;
