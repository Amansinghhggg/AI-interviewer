import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, required: true },
    question: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    type: { type: String, required: true },
    concept: { type: String, default: null },
    
    // Each question owns its corresponding answer
    answer: { type: String, default: null },
    askedAt: { type: Date, default: Date.now },
    questionEndedAt: { type: Date, default: null },
    answeredAt: { type: Date, default: null }
  },
  { _id: false }
);



const interviewSessionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "ACTIVE", "COMPLETED", "EXPIRED"],
      default: "WAITING",
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },

    startedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    recording: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
      provider: { type: String, default: null },
      mimeType: { type: String, default: null },
      size: { type: Number, default: null },
      duration: { type: Number, default: null },
      status: {
        type: String,
        enum: ["UPLOADING", "READY", "FAILED", "SKIPPED"],
        default: "UPLOADING",
      },
      originalFilename: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Compound index to ensure one active session per candidate per interview
interviewSessionSchema.index({ interviewId: 1, candidateId: 1 }, { unique: true });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
