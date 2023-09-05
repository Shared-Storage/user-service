const mongoose = require("mongoose");

const paymentPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subheader: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: Array,
    default: [],
    required: true,
  },
  priceId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("PaymentsPlan", paymentPlanSchema);
