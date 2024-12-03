const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  tenantName: {
    type: String,
    required: true,
  },
  tenantEmail: {
    type: String,
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  daysNumber: {
    type: Number,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  notes: {
    type: String,
  },
});

const Rent = mongoose.model("Rent", RentSchema);

module.exports = Rent;
