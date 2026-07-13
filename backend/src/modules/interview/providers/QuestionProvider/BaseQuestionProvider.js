/**
 * BaseQuestionProvider
 *
 * Abstract base class that defines the contract for all question providers.
 * Every question provider (Static, Gemini, OpenAI) must extend this class
 * and implement the getQuestions method.
 *
 * Providers should NOT know about Express, MongoDB, or any framework details.
 * They receive a clean InterviewConfig object and return an array of questions.
 */
export class BaseQuestionProvider {
  /**
   * Generates or retrieves the first question (or batch of questions) for an interview.
   *
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config
   * @returns {Promise<Array<Object>>} An array of question objects.
   */
  async generateFirstQuestion(config) {
    throw new Error("Not Implemented: generateFirstQuestion must be implemented by the provider subclass.");
  }

  /**
   * Generates the next adaptive question based on context.
   * 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext
   * @returns {Promise<Array<Object>>} An array containing the next question.
   */
  async generateNextQuestion(promptContext) {
    throw new Error("Not Implemented: generateNextQuestion must be implemented by the provider subclass.");
  }
}
