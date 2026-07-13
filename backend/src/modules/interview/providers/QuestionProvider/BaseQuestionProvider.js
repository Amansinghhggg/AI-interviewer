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
   * Generate or retrieve questions for an interview.
   *
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config
   *   A clean, provider-friendly interview configuration object.
   * @returns {Promise<Array<{
   *   id: number,
   *   version: number,
   *   order: number,
   *   type: string,
   *   topic: string,
   *   difficulty: string,
   *   expectedDuration: number,
   *   question: string
   * }>>} An array of question objects.
   * @throws {Error} If the method is not implemented by a subclass.
   */
  async getQuestions(config) {
    throw new Error("Not Implemented: getQuestions must be implemented by the provider subclass.");
  }
}
