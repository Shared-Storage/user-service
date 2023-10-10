const mongoose = require("mongoose");
const User = require("./User");

const Schema = mongoose.Schema;

const organizationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  orgMembers: {
    type: Array,
    default: [],
  },
  orgLocations: {
    type: Array,
    default: [],
  },
  img: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Organization", organizationSchema);
