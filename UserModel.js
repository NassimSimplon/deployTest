const mongoose = require("mongoose");

// SCHEMA
const Schema = mongoose.Schema;

// MEETING SUB-SCHEMA
const MeetingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Reference to the users collection
    required: true,
  },
 
  date: {
    type: Date,
    required: true,
  },

  phone: {
    type: String,
  },

  subject: {
    type: String,
    required: true,
  },
  
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
});

// USERS MODEL
module.exports = mongoose.model(
  "users",
  new Schema({
    username: {
      type: String,
     
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    Title: {
      type: String,
  
    },

  phone: {
    type: String,
    required: true,
  },
    password: {
      type: String,
      required: true,
    },
    
    role: {
      type: String,
      enum: ["admin", "user","owner",'subAdmin'],
      required: true,
      default: "user",
    } 
  })
);
