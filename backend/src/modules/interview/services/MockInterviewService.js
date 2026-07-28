import crypto from "crypto";
import InterviewRepository from "../repositories/InterviewRepository.js";
import InterviewResult from "../models/InterviewResult.js";
import InterviewResultService from "./InterviewResultService.js";
import User from "../../users/user.model.js";

const generateInterviewCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

class MockInterviewService {
  /**
   * Create a new Mock Interview for candidate practice.
   * @param {string} candidateId 
   * @param {string} candidateEmail 
   * @param {Object} payload 
   * @returns {Promise<Object>} Created MockInterview DTO
   */
  async createMockInterview(candidateId, candidateEmail, payload) {
    const { title, jobRole, topics, experienceLevel, duration, instructions, interviewType } = payload;

    let interviewCode;
    let isUnique = false;
    while (!isUnique) {
      interviewCode = generateInterviewCode();
      const existing = await InterviewRepository.findByCode(interviewCode);
      if (!existing) isUnique = true;
    }

    const mockData = {
      title: title || `Mock Interview - ${jobRole}`,
      description: `Candidate self-serve practice interview for ${jobRole}`,
      interviewCode,
      status: "CREATED",
      mode: "MOCK",
      interviewType: interviewType || "gemini",
      candidate: candidateId,
      configuration: {
        jobRole: jobRole || "Software Engineer",
        topics: Array.isArray(topics) ? topics : (topics ? topics.split(',').map(t => t.trim()) : []),
        experienceLevel: experienceLevel || "1-2 Years",
        duration: duration ? Number(duration) : 15,
        instructions: instructions || "",
      },
      assignedCandidates: [{
        email: candidateEmail.toLowerCase(),
        status: "Pending",
      }],
    };

    const mockDoc = await InterviewRepository.saveMock(mockData);
    return this.buildMockInterviewDTO(mockDoc);
  }

  /**
   * Validate that candidate owns the target mock interview.
   * @param {Object} mockInterview 
   * @param {string} candidateId 
   */
  validateCandidateOwnership(mockInterview, candidateId) {
    if (!mockInterview) {
      const err = new Error("Mock interview not found.");
      err.status = 404;
      throw err;
    }
    const ownerId = mockInterview.candidate?.toString() || mockInterview.employer?.toString();
    if (ownerId !== candidateId.toString()) {
      const err = new Error("Unauthorized access to this mock interview.");
      err.status = 403;
      throw err;
    }
  }

  /**
   * Get candidate's mock evaluation history with pagination.
   * @param {string} candidateId 
   * @param {Object} queryOptions { page, limit }
   * @returns {Promise<Object>} DTO with evaluations, total, page, totalPages
   */
  async getCandidateHistory(candidateId, { page = 1, limit = 10 } = {}) {
    const history = await InterviewRepository.findCandidateMockHistory(candidateId, { page, limit });
    
    // Transform results into clean DTOs
    const evaluationsDTO = history.evaluations.map(res => ({
      id: res._id.toString(),
      interviewId: res.interviewId?.toString(),
      title: res.interviewSnapshot?.title || "Mock Interview",
      jobRole: res.interviewSnapshot?.jobRole || "Practice Role",
      experienceLevel: res.interviewSnapshot?.experienceLevel || "1-2 Years",
      duration: res.interviewSnapshot?.duration || 15,
      topics: res.interviewSnapshot?.topics || [],
      evaluatedAt: res.aiMetadata?.evaluatedAt || res.createdAt,
      mode: res.mode || "MOCK",
      scores: res.scores || {},
      recommendation: res.recommendation || "BORDERLINE",
      reasoning: res.reasoning || "",
      strengths: res.strengths || [],
      weaknesses: res.weaknesses || [],
      questionBreakdown: (res.questionEvaluations || []).map(q => ({
        questionId: q.questionId,
        question: q.question,
        answer: q.answer || "No answer recorded",
        topic: res.interviewSnapshot?.jobRole || "Technical Question",
        scores: q.scores || { technical: 0, communication: 0 },
        feedback: q.feedback || "Good overall response.",
      })),
    }));

    return {
      evaluations: evaluationsDTO,
      total: history.total,
      page: history.page,
      totalPages: history.totalPages,
    };
  }

  /**
   * Get candidate's active / resumeable mock interviews.
   * @param {string} candidateId 
   * @param {string} candidateEmail 
   * @returns {Promise<Array>} List of resumeable mock DTOs
   */
  async getCandidateIncompleteMocks(candidateId, candidateEmail) {
    const list = await InterviewRepository.findCandidateIncompleteMocks(candidateId, candidateEmail);
    return list.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      jobRole: doc.configuration?.jobRole || doc.jobRole || "Practice Interview",
      experienceLevel: doc.configuration?.experienceLevel || doc.experienceLevel || "1-2 Years",
      duration: doc.configuration?.duration || doc.duration || 15,
      topics: doc.configuration?.topics || doc.topics || [],
      status: doc.candidateStatus || doc.status || "CREATED",
      createdAt: doc.createdAt,
    }));
  }

  /**
   * Fetch detailed evaluation DTO by result ID for candidate.
   * @param {string} resultId 
   * @param {string} candidateId 
   * @returns {Promise<Object>} Clean evaluation DTO
   */
  async getMockEvaluation(resultId, candidateId) {
    const result = await InterviewResult.findOne({
      _id: resultId,
      candidateId,
    }).populate("sessionId");

    if (!result) {
      const err = new Error("Evaluation result not found");
      err.status = 404;
      throw err;
    }

    const interviewDoc = await InterviewRepository.findById(result.interviewId);
    if (!interviewDoc) {
      const err = new Error("Associated interview not found");
      err.status = 404;
      throw err;
    }

    const candidateUser = await User.findById(candidateId).select("name email");

    return InterviewResultService.buildInterviewResultDTO(result, interviewDoc, candidateUser);
  }

  /**
   * Build clean ViewModel DTO for MockInterview document.
   * @param {Object} mockDoc 
   * @returns {Object}
   */
  buildMockInterviewDTO(mockDoc) {
    const doc = mockDoc.toObject ? mockDoc.toObject() : mockDoc;
    return {
      _id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      interviewCode: doc.interviewCode,
      status: doc.status,
      mode: doc.mode,
      interviewType: doc.interviewType,
      jobRole: doc.configuration?.jobRole || doc.jobRole,
      topics: doc.configuration?.topics || doc.topics || [],
      experienceLevel: doc.configuration?.experienceLevel || doc.experienceLevel,
      duration: doc.configuration?.duration || doc.duration,
      instructions: doc.configuration?.instructions || doc.instructions || "",
      assignedCandidates: doc.assignedCandidates || [],
      createdAt: doc.createdAt,
    };
  }
}

export default new MockInterviewService();
