import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  joinedAt: {
    type: Date,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: null,
  },
  resultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewResult",
    default: null,
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Interview title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
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
    experienceLevel: {
      type: String,
      enum: ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"],
      default: "Fresher",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    },
    interviewCode: {
      type: String,
      required: true,
      unique: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedCandidates: [candidateSchema],
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
interviewSchema.index({ employer: 1, status: 1 });
interviewSchema.index({ interviewCode: 1 });
interviewSchema.index({ "assignedCandidates.email": 1 });

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
