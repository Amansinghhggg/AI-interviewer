import mongoose from "mongoose";
import interviewService from "../services/interview.service.js";
import {
  createInterviewSchema,
  updateInterviewSchema,
  joinInterviewSchema,
} from "../validation/interview.validation.js";

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Employer only
const createInterview = async (req, res, next) => {
  try {
    if (req.user?.role === "employer" && !req.user?.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your employer account is not verified. Only verified employers can create campaigns.",
      });
    }

    const validated = createInterviewSchema.parse(req.body);
    const interview = await interviewService.createInterview(req.user._id, validated);

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Get interviews created by employer
// @route   GET /api/interviews
// @access  Employer only
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getEmployerInterviews(req.user._id);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview details
// @route   GET /api/interviews/:id
// @access  Employer/Candidate
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(
      req.params.id,
      req.user.role,
      req.user.email,
      req.user._id
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview details
// @route   PATCH /api/interviews/:id
// @access  Employer only
const updateInterview = async (req, res, next) => {
  try {
    const validated = updateInterviewSchema.parse(req.body);
    const interview = await interviewService.updateInterview(req.params.id, req.user._id, validated);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    next(error);
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
// @access  Employer only
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.deleteInterview(req.params.id, req.user._id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate gets assigned interviews
// @route   GET /api/interviews/candidate/assigned
// @access  Candidate only
const getAssignedInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getAssignedInterviews(req.user.email);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate joins an interview via code
// @route   POST /api/interviews/join
// @access  Candidate only
const joinInterview = async (req, res, next) => {
  try {
    const validated = joinInterviewSchema.parse(req.body);
    const interviewData = await interviewService.joinInterview(validated.interviewCode, req.user.email);

    res.status(200).json({
      success: true,
      interview: interviewData,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    if (error.message === "unauthorized") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to join this interview.",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Interview not found or inactive",
    });
  }
};

// @desc    Candidate gets the current active interview session (InterviewOS)
// @route   GET /api/interviews/:id/session
// @access  Candidate only
const getInterviewSession = async (req, res, next) => {
  try {
    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);
    if (!session) {
      return res.status(404).json({ success: false, message: "No active session found." });
    }

    res.status(200).json({
      success: true,
      session,
      currentQuestion: session.questions[session.currentQuestionIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate starts an interview
// @route   POST /api/interviews/:id/start
// @access  Candidate only
const startInterview = async (req, res, next) => {
  try {
    // 1. Get interview details from the existing legacy service
    const interviewData = await interviewService.getInterviewById(req.params.id, "candidate", req.user.email, req.user._id);
    if (!interviewData) throw new Error("not_found");

    // Check if it's an AI interview
    const provider = process.env.QUESTION_PROVIDER || "gemini";
    const isAiInterview = provider === "gemini" || provider === "groq" || interviewData.interviewType === "gemini" || interviewData.interviewType === "groq";

    if (isAiInterview) {
      const sessionStore = await import("../services/InterviewSessionService.js");
      const InterviewSessionService = sessionStore.default;

      let session = await InterviewSessionService.getOrCreateSession(req.params.id, req.user._id);

      if (session.status === "ACTIVE") {
        // Ensure legacy status is marked correctly even if resumed
        await interviewService.startInterview(req.params.id, req.user.email);
        return res.status(200).json({ success: true, session, message: "Session resumed." });
      }

      if (session.status === "COMPLETED") {
        return res.status(409).json({ success: false, message: "Interview already completed." });
      }

      // Initialize AI Engine
      const { createInterviewEngine } = await import("../services/interviewEngine.js");
      const { InterviewConfig } = await import("../services/InterviewConfig.js");

      const config = InterviewConfig.fromInterview(interviewData.interview || interviewData);

      const engine = createInterviewEngine(process.env.QUESTION_PROVIDER || "gemini");
      const questions = await engine.generateFirstQuestion(config);
      const firstQuestion = questions[0];

      session = await InterviewSessionService.startSession(session._id, firstQuestion, config.duration);

      // Update candidate status to "In Progress" in the main interview document
      await interviewService.startInterview(req.params.id, req.user.email);

      return res.status(200).json({
        success: true,
        message: "InterviewOS started.",
        session,
        currentQuestion: firstQuestion
      });
    }

    // Static legacy flow fallback
    await interviewService.startInterview(req.params.id, req.user.email);
    res.status(200).json({
      success: true,
      message: "Interview started successfully.",
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "already_completed") {
      return res.status(409).json({
        success: false,
        message: "Interview already completed.",
      });
    }
    next(error);
  }
};

// @desc    Candidate submits an answer for the current question
// @route   POST /api/interviews/:id/answer
// @access  Candidate only
const submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ success: false, message: "Answer text is required." });
    }

    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);
    if (!session || session.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "No active session found." });
    }

    const interviewData = await interviewService.getInterviewById(req.params.id, "candidate", req.user.email, req.user._id);

    // 2. Setup AI Engine
    const { createInterviewEngine } = await import("../services/interviewEngine.js");
    const { InterviewConfig } = await import("../services/InterviewConfig.js");
    const engine = createInterviewEngine(process.env.QUESTION_PROVIDER || "gemini");

    // Map actual config from the database instead of dummy values
    const config = InterviewConfig.fromInterview(interviewData);

    const result = await InterviewSessionService.submitAnswer({
      session,
      answer,
      interviewConfig: config,
      interviewEngine: engine
    });

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

// @desc    Candidate submits an interview
// @route   POST /api/interviews/:id/submit
// @access  Candidate only
const submitInterview = async (req, res, next) => {
  try {
    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;
    const session = await InterviewSessionService.getActiveSession(req.params.id, req.user._id);

    if (session) {
      await InterviewSessionService.completeSession(session._id);
    }

    await interviewService.submitInterview(req.params.id, req.user.email);

    // Trigger AI evaluation (truly non-blocking — fire and forget)
    // Send the response FIRST so the frontend can navigate immediately.
    res.status(200).json({
      success: true,
      message: "Interview submitted successfully.",
      evaluationStatus: "PENDING",
    });

    // Run evaluation in the background AFTER response is sent
    if (session) {
      try {
        const InterviewSession = (await import("../models/InterviewSession.js")).default;
        const freshSession = await InterviewSession.findById(session._id);

        const interviewDoc = await interviewService.getInterviewById(
          req.params.id,
          "candidate",
          req.user.email,
          req.user._id
        );

        if (interviewDoc && freshSession && freshSession.questions?.length > 0) {
          // Do NOT await — let this run in the background
          InterviewSessionService.evaluateAndSaveResult(
            freshSession,
            interviewDoc
          ).then(evalResult => {
            console.log(`[Evaluation] Background evaluation ${evalResult.success ? "succeeded" : "failed"} for interview ${req.params.id}`);
          }).catch(err => {
            console.error(`[Evaluation] Background evaluation error for interview ${req.params.id}:`, err.message);
          });
        }
      } catch (bgErr) {
        console.error("[Evaluation] Could not start background evaluation:", bgErr.message);
      }
    }
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "already_completed") {
      return res.status(409).json({
        success: false,
        message: "Interview already completed.",
      });
    }
    if (error.message === "not_started") {
      return res.status(403).json({
        success: false,
        message: "Interview must be started before submitting.",
      });
    }
    next(error);
  }
};

// @desc    Candidate gets interview questions (Legacy Static only)
// @route   GET /api/interviews/:id/questions
// @access  Candidate only
const getInterviewQuestions = async (req, res, next) => {
  try {
    const questions = await interviewService.getInterviewQuestions(req.params.id, req.user.email);
    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you are not assigned.",
      });
    }
    if (error.message === "not_started") {
      return res.status(403).json({
        success: false,
        message: "You must start the interview before viewing questions.",
      });
    }
    next(error);
  }
};

// @desc    Employer gets interview result for a candidate
// @route   GET /api/interviews/:id/results/:resultId
// @access  Employer only
const getInterviewResult = async (req, res, next) => {
  try {
    const InterviewResultService = (await import("../services/InterviewResultService.js")).default;

    const resultDTO = await InterviewResultService.getCandidateResult(
      req.params.id,
      req.params.resultId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      result: resultDTO,
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Interview not found or unauthorized",
      });
    }
    if (error.message === "candidate_not_found") {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }
    if (error.message === "result_not_found") {
      return res.status(404).json({
        success: false,
        message: "Evaluation result not found",
      });
    }
    next(error);
  }
};

// @desc    Candidate uploads a recording for a session
// @route   POST /api/interviews/:sessionId/recording
// @access  Candidate only
const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No recording file provided." });
    }

    const sessionStore = await import("../services/InterviewSessionService.js");
    const InterviewSessionService = sessionStore.default;

    const result = await InterviewSessionService.uploadRecordingToCloudinary(
      req.params.sessionId,
      req.user._id,
      req.file
    );

    res.status(200).json({
      success: true,
      recording: result.recording,
      message: "Recording uploaded successfully.",
    });
  } catch (error) {
    if (error.message === "not_found") {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }
    next(error);
  }
};
// @desc    Employer re-enrolls a candidate, deleting their current result and session
// @route   POST /api/interviews/:id/candidates/:candidateId/re-enroll
// @access  Employer only
const isValidObjectId = (id) => id && typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

// Helper for re-enrolling a candidate cleanly
const performCandidateReEnrollment = async (interview, targetCandidateId, targetResultId) => {
  const InterviewSession = (await import("../models/InterviewSession.js")).default;
  const InterviewResult = (await import("../models/InterviewResult.js")).default;
  const CloudinaryService = (await import("../services/CloudinaryService.js")).default;
  const User = (await import("../../users/user.model.js")).default;

  let candidateEmail = null;
  let candidateUser = null;

  // Check if targetCandidateId is passed as an email address string
  if (typeof targetCandidateId === "string" && targetCandidateId.includes("@")) {
    candidateEmail = targetCandidateId.toLowerCase().trim();
    candidateUser = await User.findOne({ email: candidateEmail }).catch(() => null);
  }

  const validResultId = isValidObjectId(targetResultId) ? targetResultId : null;
  const validCandidateId = isValidObjectId(targetCandidateId) ? targetCandidateId : null;

  // 1. Identify result document if validResultId is provided
  let resultDoc = null;
  if (validResultId) {
    resultDoc = await InterviewResult.findById(validResultId).catch(() => null);
    if (resultDoc && resultDoc.candidateId) {
      const u = await User.findById(resultDoc.candidateId).catch(() => null);
      if (u) {
        candidateUser = u;
        candidateEmail = u.email.toLowerCase().trim();
      }
    }
  }

  // 2. Identify candidate User and candidate Email by candidateId if not found yet
  let candidateId = candidateUser ? candidateUser._id.toString() : (validCandidateId || (resultDoc ? resultDoc.candidateId?.toString() : null));

  if (!candidateEmail && candidateId && isValidObjectId(candidateId)) {
    candidateUser = await User.findById(candidateId).catch(() => null);
    if (candidateUser) {
      candidateEmail = candidateUser.email.toLowerCase().trim();
    }
  }

  // 3. Search assignedCandidates in interview using resultId, email, or candidateId
  let candidateIndex = -1;

  if (candidateEmail) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.email && c.email.toLowerCase() === candidateEmail.toLowerCase()
    );
  }

  if (candidateIndex === -1 && validResultId) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c.resultId?.toString() === validResultId?.toString()
    );
  }

  if (candidateIndex === -1 && validCandidateId) {
    candidateIndex = interview.assignedCandidates.findIndex(
      (c) => c._id?.toString() === validCandidateId?.toString()
    );
  }

  if (candidateIndex === -1 && interview.assignedCandidates.length === 1) {
    candidateIndex = 0;
  }

  if (candidateIndex !== -1) {
    candidateEmail = interview.assignedCandidates[candidateIndex].email.toLowerCase().trim();
    if (!candidateUser && candidateEmail) {
      candidateUser = await User.findOne({ email: candidateEmail }).catch(() => null);
      if (candidateUser) {
        candidateId = candidateUser._id.toString();
      }
    }
  }

  // 4. Clean up InterviewSessions safely
  const sessionFilter = { interviewId: interview._id };
  const orConditions = [];
  if (candidateId && isValidObjectId(candidateId)) orConditions.push({ candidateId: candidateId });
  if (validResultId) orConditions.push({ _id: validResultId });

  if (orConditions.length > 0) {
    sessionFilter.$or = orConditions;
    try {
      const sessions = await InterviewSession.find(sessionFilter);
      for (const session of sessions) {
        if (session.recording && session.recording.publicId) {
          try {
            await CloudinaryService.deleteRecording(session.recording.publicId);
          } catch (err) {
            console.error("Failed to delete Cloudinary recording:", err);
          }
        }
        await InterviewSession.deleteOne({ _id: session._id });
      }
    } catch (err) {
      console.warn("Session cleanup warning:", err.message);
    }
  }

  // Purge any remaining sessions or results for candidate / interview
  if (candidateId && isValidObjectId(candidateId)) {
    await InterviewSession.deleteMany({ interviewId: interview._id, candidateId: candidateId }).catch(() => null);
    await InterviewResult.deleteMany({ interviewId: interview._id, candidateId: candidateId }).catch(() => null);
  }

  if (validResultId) {
    await InterviewResult.deleteMany({ _id: validResultId }).catch(() => null);
  }

  // 5. Reset candidate subdocument status to "Pending" and clear dates / resultId
  if (candidateIndex !== -1) {
    interview.assignedCandidates[candidateIndex].status = "Pending";
    interview.assignedCandidates[candidateIndex].joinedAt = null;
    interview.assignedCandidates[candidateIndex].submittedAt = null;
    interview.assignedCandidates[candidateIndex].resultId = null;
    interview.markModified("assignedCandidates");
    await interview.save();
  }

  return true;
};

// @desc    Employer re-enrolls a candidate, deleting their current result and session
// @route   POST /api/interviews/:id/candidates/:candidateId/re-enroll
// @access  Employer only
const reEnrollCandidate = async (req, res, next) => {
  try {
    const { id: interviewId, candidateId } = req.params;
    const employerId = req.user._id;

    const Interview = (await import("../models/interview.model.js")).default;
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or unauthorized" });
    }

    await performCandidateReEnrollment(interview, candidateId, null);

    res.status(200).json({
      success: true,
      message: "Candidate has been successfully re-enrolled.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employer re-enrolls a candidate using resultId/sessionId directly from the result error page
// @route   POST /api/interviews/:id/results/:resultId/re-enroll
// @access  Employer only
const reEnrollByResultId = async (req, res, next) => {
  try {
    const { id: interviewId, resultId } = req.params;
    const employerId = req.user._id;

    const Interview = (await import("../models/interview.model.js")).default;
    const InterviewSession = (await import("../models/InterviewSession.js")).default;
    const InterviewResult = (await import("../models/InterviewResult.js")).default;
    const User = (await import("../../users/user.model.js")).default;
    const CloudinaryService = (await import("../services/CloudinaryService.js")).default;

    // 1. Verify employer owns the interview
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found or unauthorized" });
    }

    // 2. Find InterviewSession using interviewId and resultId (which may be session _id, candidateId, or resultId)
    let session = null;
    if (isValidObjectId(resultId)) {
      session = await InterviewSession.findOne({
        interviewId,
        $or: [{ _id: resultId }, { candidateId: resultId }]
      });
    }

    // Fallback: If not found by ID, look up any active/completed session for this interview
    if (!session) {
      session = await InterviewSession.findOne({ interviewId });
    }

    let candidateEmail = null;
    let candidateUserId = null;

    if (session) {
      candidateUserId = session.candidateId;
      const candidateUser = await User.findById(session.candidateId).catch(() => null);
      if (candidateUser) {
        candidateEmail = candidateUser.email.toLowerCase().trim();
      }

      // Delete Cloudinary recording if it exists
      if (session.recording && session.recording.publicId) {
        try {
          await CloudinaryService.deleteRecording(session.recording.publicId);
        } catch (err) {
          console.error("Cloudinary delete error:", err);
        }
      }

      // Delete the session
      await InterviewSession.deleteOne({ _id: session._id });
    }

    // Delete any remaining sessions for this interview & candidate
    if (candidateUserId) {
      await InterviewSession.deleteMany({ interviewId, candidateId: candidateUserId }).catch(() => null);
    } else {
      await InterviewSession.deleteMany({ interviewId }).catch(() => null);
    }

    // Delete any result document if one exists
    if (isValidObjectId(resultId)) {
      await InterviewResult.deleteMany({ _id: resultId }).catch(() => null);
    }
    if (candidateUserId) {
      await InterviewResult.deleteMany({ interviewId, candidateId: candidateUserId }).catch(() => null);
    }

    // 3. Find and update the candidate in assignedCandidates using candidate email
    let candidateIndex = -1;
    if (candidateEmail) {
      candidateIndex = interview.assignedCandidates.findIndex(
        (c) => c.email && c.email.toLowerCase().trim() === candidateEmail
      );
    }

    // If candidate email matching failed, try matching candidate with status "Completed" or "In Progress"
    if (candidateIndex === -1) {
      candidateIndex = interview.assignedCandidates.findIndex(
        (c) => c.status === "Completed" || c.status === "In Progress"
      );
    }

    // Fallback: If single candidate in campaign
    if (candidateIndex === -1 && interview.assignedCandidates.length === 1) {
      candidateIndex = 0;
    }

    if (candidateIndex !== -1) {
      interview.assignedCandidates[candidateIndex].status = "Pending";
      interview.assignedCandidates[candidateIndex].joinedAt = null;
      interview.assignedCandidates[candidateIndex].submittedAt = null;
      interview.assignedCandidates[candidateIndex].resultId = null;
      interview.markModified("assignedCandidates");
      await interview.save();
    }

    res.status(200).json({
      success: true,
      message: "Candidate has been successfully re-enrolled.",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAssignedInterviews,
  joinInterview,
  startInterview,
  submitInterview,
  getInterviewQuestions,
  getInterviewSession,
  submitAnswer,
  getInterviewResult,
  uploadRecording,
  reEnrollCandidate,
  reEnrollByResultId
};
