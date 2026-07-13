/**
 * ConversationHistory
 *
 * Dedicated object for maintaining the conversation memory.
 * Stores the sequence of questions asked and answers provided.
 */
export class ConversationHistory {
  /**
   * @param {Object} params
   * @param {Array<Object>} [params.exchanges=[]] - Array of { question, answer, topic, difficulty } objects.
   */
  constructor({ exchanges = [] } = {}) {
    this.exchanges = exchanges;
  }

  /**
   * Helper to get the most recent exchange.
   * @returns {Object|null} The last { question, answer, topic, difficulty } or null if empty.
   */
  getLastExchange() {
    if (this.exchanges.length === 0) return null;
    return this.exchanges[this.exchanges.length - 1];
  }
}
