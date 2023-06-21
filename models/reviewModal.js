const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizer: {
      type: mongoose.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Review", reviewSchema);
