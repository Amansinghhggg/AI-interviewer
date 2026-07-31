import InterviewResult from "../models/InterviewResult.js";
import InterviewSession from "../models/InterviewSession.js";
import Interview from "../models/interview.model.js";
import User from "../../users/user.model.js";
import { getScoreInterpretation } from "../utils/scoreInterpretation.js";

/**
 * InterviewResultService
 * 
 * Responsible for fetching InterviewResult and transforming it into a clean DTO
 * for the Employer Results Dashboard.
 */
class InterviewResultService {
  /**
   * Fetches an interview result and returns a structured DTO.
   * Ensures the employer requesting the result owns the interview.
   * 
   * @param {string} interviewId
   * @param {string} resultId
   * @param {string} employerId
   * @returns {Promise<Object>} Clean DTO
   */
  async getCandidateResult(interviewId, resultId, employerId) {
    // 1. Verify employer owns the interview
    const interview = await Interview.findOne({ _id: interviewId, employer: employerId });
    if (!interview) {
      throw new Error("not_found");
    }

    // 2. Fetch InterviewResult
    const result = await InterviewResult.findOne({ _id: resultId, interviewId }).populate("sessionId");
    if (!result) {
      throw new Error("result_not_found");
    }

    // 3. Fetch Candidate details
    const candidate = await User.findById(result.candidateId).select("name email");
    if (!candidate) {
      throw new Error("candidate_not_found");
    }

    // 4. Build and return clean DTO
    return this.buildInterviewResultDTO(result, interview, candidate);
  }

  /**
   * Transforms raw Mongoose documents into a clean API ViewModel DTO.
   * Omits all internal identifiers, version keys, and raw model configurations.
   */
  buildInterviewResultDTO(result, interview, candidate) {
    const interpretation = getScoreInterpretation(result.scores?.overall);
    
    // Format duration nicely
    const durationMs = result.aiMetadata?.latencyMs || 0;
    const formattedDuration = durationMs ? `${(durationMs / 1000).toFixed(2)} seconds` : "0 seconds";

    return {
      candidate: {
        id: candidate._id.toString(),
        name: candidate.name,
        email: candidate.email,
      },
      interview: {
        id: interview._id.toString(),
        title: interview.title,
        jobRole: interview.jobRole,
        experienceLevel: interview.experienceLevel || "Fresher",
        createdAt: interview.createdAt,
      },
      summary: {
        overallScore: result.scores?.overall || 0,
        interpretation: `${interpretation.label} Candidate`,
        recommendation: result.recommendation || "BORDERLINE",
        reasoning: result.reasoning || "",
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
      },
      evaluation: {
        status: result.status,
        provider: result.aiMetadata?.provider || "AI Provider",
        durationMs,
        duration: formattedDuration,
        evaluatedAt: result.aiMetadata?.evaluatedAt || result.createdAt,
      },
      charts: {
        technical: result.scores?.technical || 0,
        communication: result.scores?.communication || 0,
        problemSolving: result.scores?.problemSolving || 0,
        confidence: result.scores?.confidence || 0,
        topicCoverage: result.scores?.topicCoverage || 0,
      },
      startedAt: result.sessionId?.startedAt || null,
      recording: result.sessionId?.recording || null,
      questionBreakdown: result.questionEvaluations.map(qe => {
        // Try to find the original question from the populated session to get its metadata
        const sessionQuestion = result.sessionId?.questions?.find(
          sq => sq.id === qe.questionId || sq._id?.toString() === qe.questionId?.toString()
        );
        return {
          questionId: qe.questionId,
          question: qe.question,
          answer: qe.answer,
          topic: sessionQuestion?.topic || qe.topic || "General",
          difficulty: sessionQuestion?.difficulty || qe.difficulty || "Medium",
          askedAt: sessionQuestion?.askedAt || null,
          answeredAt: sessionQuestion?.answeredAt || null,
          questionEndedAt: sessionQuestion?.questionEndedAt || null,
          scores: qe.scores,
          feedback: qe.feedback,
        };
      }),
    };
  }
}

export default new InterviewResultService();
