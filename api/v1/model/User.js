const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  emailVerificationToken: {
    type: String,
    default: "",
  },
  emailVerificationTokenExpiry: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  passwordResetTokenExpiry: {
    type: Date,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  preferences: {
    type: Object,
    default: { theme: "light", language: "en" },
  },
  payments: {
    type: Object,
    default: {
      customer: undefined,
      billingDetails: {
        billingName: undefined,
        billingPhone: undefined,
        billingAddress: undefined,
      },
    },
  },
});

module.exports = mongoose.model("User", userSchema);
