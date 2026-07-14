/**
 * EvaluationContext
 *
 * A clean, provider-agnostic data object that transforms raw InterviewSession
 * and InterviewConfig data into structured input for EvaluationPromptBuilder.
 *
 * This is the evaluation counterpart to PromptContext. While PromptContext
 * feeds question generation, EvaluationContext feeds post-interview evaluation.
 *
 * No Mongoose documents should reach the PromptBuilder — EvaluationContext
 * is the boundary where DB shapes are translated into prompt-ready data.
 */
export class EvaluationContext {
  /**
   * @param {Object} params
   *
   * @param {Object} params.interviewConfig - Interview configuration.
   * @param {string} params.interviewConfig.jobRole
   * @param {string} params.interviewConfig.experienceLevel
   * @param {string[]} params.interviewConfig.topics
   * @param {number} params.interviewConfig.duration
   * @param {number} params.interviewConfig.totalQuestions
   *
   * @param {Object} params.interviewSummary - Computed summary of the session.
   * @param {number} params.interviewSummary.answeredQuestions
   * @param {string[]} params.interviewSummary.coveredTopics
   * @param {string[]} params.interviewSummary.remainingTopics
   * @param {Date|string|null} params.interviewSummary.startedAt
   * @param {Date|string|null} params.interviewSummary.endedAt
   * @param {number|null} params.interviewSummary.totalDurationMinutes
   *
   * @param {Array<Object>} params.transcript - Ordered Q&A pairs.
   * @param {string|number} params.transcript[].questionId
   * @param {string} params.transcript[].question
   * @param {string} params.transcript[].topic
   * @param {string} params.transcript[].difficulty
   * @param {string|null} params.transcript[].answer
   */
  constructor({ interviewConfig, interviewSummary, transcript }) {
    this.interviewConfig = interviewConfig;
    this.interviewSummary = interviewSummary;
    this.transcript = transcript;
  }

  /**
   * Factory method: build an EvaluationContext from an InterviewConfig
   * and a completed InterviewSession document.
   *
   * This is the ONLY place where Mongoose document shapes are read.
   *
   * @param {import('../services/InterviewConfig.js').InterviewConfig} config
   * @param {Object} sessionDoc - Mongoose InterviewSession document (or plain object).
   * @returns {EvaluationContext}
   */
  static fromSessionAndConfig(config, sessionDoc) {
    const questions = sessionDoc.questions || [];

    // Derive covered/remaining topics from the session's question list.
    const coveredTopics = [...new Set(questions.map((q) => q.topic))];
    const configTopics = config.topics || [];
    const remainingTopics = configTopics.filter(
      (t) => !coveredTopics.includes(t)
    );

    const answeredQuestions = questions.filter(
      (q) => q.answer !== null && q.answer !== undefined
    ).length;

    // Compute interview duration in minutes if both timestamps exist.
    const startedAt = sessionDoc.startedAt || null;
    const endedAt = sessionDoc.updatedAt || null;
    let totalDurationMinutes = null;
    if (startedAt && endedAt) {
      totalDurationMinutes = Math.round(
        (new Date(endedAt) - new Date(startedAt)) / 60000
      );
    }

    // Build the ordered transcript — one entry per question.
    const transcript = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      topic: q.topic,
      difficulty: q.difficulty,
      answer: q.answer || null,
    }));

    return new EvaluationContext({
      interviewConfig: {
        jobRole: config.jobRole,
        experienceLevel: config.experienceLevel,
        topics: configTopics,
        duration: config.duration,
        totalQuestions: questions.length,
      },
      interviewSummary: {
        answeredQuestions,
        coveredTopics,
        remainingTopics,
        startedAt,
        endedAt,
        totalDurationMinutes,
      },
      transcript,
    });
  }
}
