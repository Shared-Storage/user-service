const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  problem: {
    type: String,
    required: true,
  },
  authenticated: {
    type: Boolean,
    required: true,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Support", supportSchema);
