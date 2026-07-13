/**
 * BaseEvaluationProvider
 *
 * Abstract base class that defines the contract for all evaluation providers.
 * Future providers (GeminiEvaluationProvider, OpenAIEvaluationProvider)
 * must extend this class and implement the evaluate method.
 *
 * Providers should NOT know about Express, MongoDB, or any framework details.
 * They receive structured interview data and return evaluation results.
 */
export class BaseEvaluationProvider {
  /**
   * Evaluate a candidate's interview responses.
   *
   * @param {Object} interviewData - The interview data to evaluate.
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} interviewData.config
   *   The interview configuration.
   * @param {Array<Object>} interviewData.questions - The questions that were asked.
   * @param {Array<Object>} interviewData.answers - The candidate's answers.
   * @returns {Promise<Object>} Evaluation results.
   * @throws {Error} If the method is not implemented by a subclass.
   */
  async evaluate(interviewData) {
    throw new Error("Not Implemented: evaluate must be implemented by the provider subclass.");
  }
}
