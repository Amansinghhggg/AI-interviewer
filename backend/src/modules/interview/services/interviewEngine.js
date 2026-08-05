import { createQuestionProvider } from "../providers/QuestionProvider/index.js";
import { createEvaluationProvider } from "../providers/EvaluationProvider/index.js";

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
   * @param {import('../providers/EvaluationProvider/BaseEvaluationProvider.js').BaseEvaluationProvider} params.evaluationProvider
   *   The evaluation provider to use for post-interview evaluation.
   */
  constructor({ questionProvider, evaluationProvider }) {
    this.questionProvider = questionProvider;
    this.evaluationProvider = evaluationProvider;
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
   * Retrieve legacy/static questions for the interview.
   * Provided for backwards compatibility with the static flow.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<Array<Object>>} An array of question objects.
   */
  async getQuestions(config) {
    return this.questionProvider.generateFirstQuestion(config);
  }

  /**
   * Generates the first question for an adaptive AI interview.
   */
  async generateFirstQuestion(config) {
    return this.questionProvider.generateFirstQuestion(config);
  }

  /**
   * Generates the next question for an adaptive AI interview.
   *
   * @param {import('./InterviewConfig.js').InterviewConfig} config
   * @param {import('./InterviewState.js').InterviewState} state
   * @param {import('./ConversationHistory.js').ConversationHistory} history
   */
  async generateNextQuestion(config, state, history) {
    // 1. We must dynamically import PromptContext to avoid circular deps or just pass it in
    // However, engine is the orchestrator, so it should build it.
    const { PromptContext } = await import("../prompts/PromptContext.js");
    const promptContext = new PromptContext({ config, state, history });
    
    return this.questionProvider.generateNextQuestion(promptContext);
  }

  /**
   * Legacy submit answer endpoint, currently no-op.
   */
  async submitAnswer(config, questionId, answer) {
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

  /**
   * Evaluate a completed interview using the configured AI evaluation provider.
   *
   * The engine only orchestrates — it delegates to the provider and returns
   * the validated evaluation object. It does NOT persist anything.
   *
   * @param {import('../prompts/EvaluationContext.js').EvaluationContext} evaluationContext
   * @returns {Promise<Object>} A validated evaluation object matching InterviewResult schema.
   */
  async evaluateInterview(evaluationContext) {
    return this.evaluationProvider.evaluate(evaluationContext);
  }
}

/**
 * Factory function to create an InterviewEngine with the correct providers
 * resolved from the interview type.
 *
 * @param {string} [interviewType='static'] - The type of interview / provider to use.
 * @returns {InterviewEngine}
 */
export const createInterviewEngine = (interviewType = process.env.QUESTION_PROVIDER || "gemini", config = {}) => {
  const questionProvider = createQuestionProvider(interviewType, config);
  
  // Temporary fallback: Route all unsupported evaluation types to groq
  const evalType = (interviewType === "gemini" || interviewType === "static") ? "groq" : interviewType;
  const evaluationProvider = createEvaluationProvider(evalType);

  return new InterviewEngine({
    questionProvider,
    evaluationProvider,
  });
};
