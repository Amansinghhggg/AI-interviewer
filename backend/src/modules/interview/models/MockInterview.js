import mongoose from "mongoose";
import { baseInterviewFields, interviewConfigurationSchema } from "../schemas/baseInterview.schema.js";

const mockInterviewSchema = new mongoose.Schema(
  {
    ...baseInterviewFields,
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate is required"],
      index: true,
    },
    mode: {
      type: String,
      enum: ["MOCK"],
      default: "MOCK",
    },
    configuration: {
      type: interviewConfigurationSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance
mockInterviewSchema.index({ candidate: 1, status: 1, createdAt: -1 });

const MockInterview = mongoose.model("MockInterview", mockInterviewSchema, "mock-interviews");
export default MockInterview;
