const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Interview title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },
    numberOfQuestions: {
      type: Number,
      required: [true, "Number of questions is required"],
      min: [1, "Must have at least 1 question"],
      max: [50, "Cannot exceed 50 questions"],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
interviewSchema.index({ createdBy: 1, status: 1 });
interviewSchema.index({ status: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
