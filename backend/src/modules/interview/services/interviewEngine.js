import { createQuestionProvider } from "../providers/QuestionProvider/index.js";

/**
 * InterviewEngine
 *
 * The central orchestration layer for all interview operations.
 * This is the ONLY layer that communicates with providers.
 *
 * Services delegate to the engine; the engine delegates to providers.
 * The engine does NOT contain AI-specific logic — it coordinates providers.
 *
 * Dependency flow:
 *   Controller → Service → InterviewEngine → Providers
 */
export class InterviewEngine {
  /**
   * @param {Object} params
   * @param {import('../providers/QuestionProvider/BaseQuestionProvider.js').BaseQuestionProvider} params.questionProvider
   *   The question provider to use for this interview session.
   */
  constructor({ questionProvider }) {
    this.questionProvider = questionProvider;

    // Future providers will be injected here:
    // this.evaluationProvider = evaluationProvider;
    // this.aiProvider = aiProvider;
  }

  /**
   * Start an interview session.
   * Today this is a no-op. In the future it will initialize an AI session,
   * generate the first batch of questions, set up context, etc.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<{ started: boolean }>}
   */
  async startInterview(config) {
    // Future: Initialize AI session, generate first question batch
    return { started: true };
  }

  /**
   * Retrieve questions for the interview.
   * Delegates entirely to the question provider.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<Array<Object>>} An array of question objects.
   */
  async getQuestions(config) {
    return this.questionProvider.getQuestions(config);
  }

  /**
   * Submit a candidate's answer for a specific question.
   * Today this is a no-op. In the future it will send the answer to the
   * evaluation provider and potentially generate a follow-up question.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @param {number|string} questionId - The ID of the question being answered.
   * @param {string} answer - The candidate's answer text.
   * @returns {Promise<{ received: boolean }>}
   */
  async submitAnswer(config, questionId, answer) {
    // Future: Send to evaluation provider, generate follow-up question
    return { received: true };
  }

  /**
   * Submit / complete the entire interview.
   * Today this is a no-op. In the future it will trigger final evaluation
   * and result generation.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<{ completed: boolean }>}
   */
  async submitInterview(config) {
    // Future: Trigger final evaluation, generate report
    return { completed: true };
  }
}

/**
 * Factory function to create an InterviewEngine with the correct providers
 * resolved from the interview type.
 *
 * @param {string} [interviewType='static'] - The type of interview / provider to use.
 * @returns {InterviewEngine}
 */
export const createInterviewEngine = (interviewType = "static") => {
  const questionProvider = createQuestionProvider(interviewType);

  // Future: resolve evaluation and AI providers based on interviewType
  // const evaluationProvider = createEvaluationProvider(interviewType);
  // const aiProvider = createAIProvider(interviewType);

  return new InterviewEngine({
    questionProvider,
  });
};
