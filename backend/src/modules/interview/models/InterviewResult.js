import mongoose from "mongoose";

// ─── Question-level Evaluation Sub-schema ────────────────────────────────────
// Reusable sub-document for per-question scoring. Kept lightweight:
// stores only the question text, the candidate's answer, grouped scores,
// and free-text feedback. The questionId links back to the session's
// question array so dashboards can cross-reference without duplicating
// the full question metadata.

const questionEvaluationSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "questionId is required"],
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
    },
    answer: {
      type: String,
      default: null,
    },
    scores: {
      technical: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      communication: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
    },
    feedback: {
      type: String,
      default: null,
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// ─── AI Metadata Sub-schema ──────────────────────────────────────────────────
// Captures which provider/model produced this evaluation, when, and how
// long it took. Essential for auditing, debugging latency issues, and
// comparing provider quality in the future.

const aiMetadataSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: [true, "AI provider is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "AI model is required"],
      trim: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
    latencyMs: {
      type: Number,
      min: [0, "Latency cannot be negative"],
      default: null,
    },
  },
  { _id: false }
);

// ─── InterviewResult Schema ──────────────────────────────────────────────────
// The permanent evaluation record. Completely decoupled from
// InterviewSession — it references the session but never depends on its
// runtime state. This separation means evaluation data survives session
// cleanup, can be regenerated with a different provider, and can be
// queried independently for analytics.

const interviewResultSchema = new mongoose.Schema(
  {
    // ── Reference Links ────────────────────────────────────────────────
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: [true, "interviewId is required"],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "candidateId is required"],
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: [true, "sessionId is required"],
    },

    // ── Evaluation Status ──────────────────────────────────────────────
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "RETRYING"],
      default: "PENDING",
    },

    // ── Evaluation Scores ──────────────────────────────────────────────
    scores: {
      overall: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      technical: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      communication: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      problemSolving: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      confidence: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
      topicCoverage: {
        type: Number,
        min: [0, "Score cannot be below 0"],
        max: [10, "Score cannot exceed 10"],
        default: null,
      },
    },

    // ── Hiring Recommendation ──────────────────────────────────────────
    recommendation: {
      type: String,
      enum: {
        values: [
          "STRONG_HIRE",
          "HIRE",
          "BORDERLINE",
          "NEEDS_IMPROVEMENT",
          "REJECT",
        ],
        message: "{VALUE} is not a valid recommendation",
      },
      required: [true, "Hiring recommendation is required"],
    },
    reasoning: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Strengths & Weaknesses ─────────────────────────────────────────
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },

    // ── Question-wise Evaluations ──────────────────────────────────────
    questionEvaluations: {
      type: [questionEvaluationSchema],
      default: [],
    },

    // ── AI Metadata ────────────────────────────────────────────────────
    aiMetadata: {
      type: aiMetadataSchema,
      required: [true, "AI metadata is required"],
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Single-field indexes for the three foreign keys — these are the most
// common query patterns (look up results by interview, by candidate, or
// by session).
interviewResultSchema.index({ interviewId: 1 });
interviewResultSchema.index({ candidateId: 1 });
interviewResultSchema.index({ sessionId: 1 }, { unique: true });

// Compound index for employer dashboards that filter by interview + candidate.
interviewResultSchema.index({ interviewId: 1, candidateId: 1 });

const InterviewResult = mongoose.model(
  "InterviewResult",
  interviewResultSchema
);

export default InterviewResult;
