const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
    },

    budgetTier: {
      type: String,
      required: true,
    },

    interests: [String],

    itinerary: [],

    hotels: [],

    estimatedBudget: {},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);