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

// @desc    Candidate starts an interview
// @route   POST /api/interviews/:id/start
// @access  Candidate only
const startInterview = async (req, res, next) => {
  try {
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

// @desc    Candidate submits an interview
// @route   POST /api/interviews/:id/submit
// @access  Candidate only
const submitInterview = async (req, res, next) => {
  try {
    await interviewService.submitInterview(req.params.id, req.user.email);
    res.status(200).json({
      success: true,
      message: "Interview submitted successfully.",
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

// @desc    Candidate gets interview questions
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
};
