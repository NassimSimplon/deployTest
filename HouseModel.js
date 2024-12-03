const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// House Schema
const HouseSchema = new Schema({
  ownerID: {
    type: Number, 
  },
  ownerName: {
    type: String, 
  },
  postedBy   : {
    type: String,
    enum: ["admin", "user","owner",'subAdmin'],
    required: true,
    default: "admin",
  },
  images: [
    {
      type: String, // Assuming image URLs
     
    },
  ],
  status: {
    type: String,
    enum: ["available", "rented", "under_maintenance"],
    default: "available",
  },
  description: {
    type: String,
    required: true,
  },
  pricePerDay:{
    type:Number,
    required: true,
  },
  location:{
    type:String,
    required: true,
  } , created_at: {
    type: Date,
    default: Date.now, // Automatically set the current timestamp
  },

});

module.exports = mongoose.model("Houses", HouseSchema);
