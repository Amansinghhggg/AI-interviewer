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

// @desc    Candidate gets the current active interview session (AI Interview)
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
        message: "AI Interview started.",
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

    // Trigger AI evaluation (non-blocking for the submission response)
    let evaluationStatus = "PENDING";
    if (session && session.questions && session.questions.length > 0) {
      const interviewDoc = await interviewService.getInterviewById(
        req.params.id,
        "candidate",
        req.user.email,
        req.user._id
      );

      if (interviewDoc) {
        const evalResult = await InterviewSessionService.evaluateAndSaveResult(
          session,
          interviewDoc
        );
        evaluationStatus = evalResult.success ? "COMPLETED" : "FAILED";
      }
    }

    res.status(200).json({
      success: true,
      message: "Interview submitted successfully.",
      evaluationStatus,
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
  uploadRecording
};
