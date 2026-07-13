/**
 * PromptContext
 *
 * A unified data structure that aggregates configuration, progress state, 
 * and conversation history. Every prompt builder accepts this single 
 * parameter to maintain clean signatures and allow easy extension.
 */
export class PromptContext {
  /**
   * @param {Object} params
   * @param {import('../services/InterviewConfig.js').InterviewConfig} params.config - Static configuration for the interview.
   * @param {import('../services/InterviewState.js').InterviewState} [params.state] - Current progress of the interview.
   * @param {import('../services/ConversationHistory.js').ConversationHistory} [params.history] - Past questions and answers.
   */
  constructor({ config, state = null, history = null }) {
    this.config = config;
    this.state = state;
    this.history = history;
  }
}
