import Interview from "../models/interview.model.js";
import MockInterview from "../models/MockInterview.js";
import InterviewResult from "../models/InterviewResult.js";

/**
 * InterviewRepository Abstraction
 * Unified data access repository encapsulating queries for both Employer and Mock Interviews.
 * Prevents upper service layers from containing database location or collection-specific logic.
 */
class InterviewRepository {
  /**
   * Find an interview document by ID across both Interview and MockInterview collections.
   * @param {string} id 
   * @returns {Promise<Object|null>} Interview or MockInterview document
   */
  async findById(id) {
    if (!id) return null;
    let interview = await Interview.findById(id);
    if (!interview) {
      interview = await MockInterview.findById(id);
    }
    return interview;
  }

  /**
   * Find an interview document by code across both collections.
   * @param {string} code 
   * @returns {Promise<Object|null>}
   */
  async findByCode(code) {
    if (!code) return null;
    const formattedCode = code.toUpperCase();
    let interview = await Interview.findOne({ interviewCode: formattedCode });
    if (!interview) {
      interview = await MockInterview.findOne({ interviewCode: formattedCode });
    }
    return interview;
  }

  /**
   * Find all active employer interviews for an employer.
   * @param {string} employerId 
   * @returns {Promise<Array>}
   */
  async findEmployerInterviews(employerId) {
    return await Interview.find({ employer: employerId }).sort({ createdAt: -1 });
  }

  /**
   * Find candidate assigned interviews from employer campaigns.
   * @param {string} candidateEmail 
   * @returns {Promise<Array>}
   */
  async findCandidateAssignedInterviews(candidateEmail) {
    const emailLower = candidateEmail.toLowerCase();
    const interviews = await Interview.find({
      "assignedCandidates.email": emailLower,
      status: { $in: ["active", "completed", "CREATED", "IN_PROGRESS", "COMPLETED"] },
    })
      .populate("employer", "name")
      .sort({ createdAt: -1 })
      .lean();

    return interviews.map((interview) => {
      const candidateInfo = interview.assignedCandidates?.find(c => c.email === emailLower);
      delete interview.assignedCandidates;
      delete interview.customQuestions; // Protect question bank from candidate Network tab inspection
      return {
        ...interview,
        candidateStatus: candidateInfo?.status || "Pending",
      };
    });
  }

  /**
   * Find completed mock evaluation history for a candidate with pagination.
   * @param {string} candidateId 
   * @param {Object} options { page, limit }
   * @returns {Promise<Object>} { evaluations, total, page, totalPages }
   */
  async findCandidateMockHistory(candidateId, { page = 1, limit = 1000 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { candidateId, mode: "MOCK" };

    const total = await InterviewResult.countDocuments(query);
    const results = await InterviewResult.find(query)
      .populate("sessionId", "recording questions createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      evaluations: results,
      total,
      page: pageNum,
      totalPages,
    };
  }

  /**
   * Save a new mock interview document.
   * @param {Object} data 
   * @returns {Promise<Object>} Created MockInterview document
   */
  async saveMock(data) {
    return await MockInterview.create(data);
  }

  /**
   * Update candidate assignment status inside an interview or mock interview.
   * @param {string} interviewId 
   * @param {string} candidateEmail 
   * @param {string} status 
   * @param {string} [resultId] 
   */
  async updateCandidateStatus(interviewId, candidateEmail, status, resultId = null) {
    const interview = await this.findById(interviewId);
    if (!interview) return null;

    const emailLower = candidateEmail.toLowerCase();
    const candidate = interview.assignedCandidates.find(c => c.email.toLowerCase() === emailLower);
    if (candidate) {
      candidate.status = status;
      if (status === "In Progress" || status === "IN_PROGRESS") candidate.joinedAt = candidate.joinedAt || new Date();
      if (status === "Completed" || status === "COMPLETED") candidate.submittedAt = new Date();
      if (resultId) candidate.resultId = resultId;

      await interview.save();
    }

    return interview;
  }

  /**
   * Find incomplete or in-progress mock interviews for candidate.
   * @param {string} candidateId 
   * @param {string} candidateEmail 
   * @returns {Promise<Array>}
   */
  async findCandidateIncompleteMocks(candidateId, candidateEmail) {
    const emailLower = (candidateEmail || "").toLowerCase();
    const mocks = await MockInterview.find({
      $or: [
        { candidate: candidateId },
        { "assignedCandidates.email": emailLower }
      ],
      mode: "MOCK"
    }).sort({ createdAt: -1 }).lean();

    const incomplete = [];
    for (const m of mocks) {
      const candidateInfo = m.assignedCandidates?.find(c => c.email?.toLowerCase() === emailLower) || {};
      const status = candidateInfo.status || m.status;
      if (status !== "Completed" && status !== "COMPLETED") {
        incomplete.push({
          ...m,
          candidateStatus: status
        });
      }
    }
    return incomplete;
  }
}

export default new InterviewRepository();
