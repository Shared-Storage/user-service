const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  price: {
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  description: {
    type: String,
  },
});

module.exports = mongoose.model("Product", productSchema);
