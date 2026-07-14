/**
 * BaseEvaluationProvider
 *
 * Abstract base class that defines the contract for all evaluation providers.
 * Future providers (GeminiEvaluationProvider, OpenAIEvaluationProvider)
 * must extend this class and implement the evaluate method.
 *
 * Providers should NOT know about Express, MongoDB, or any framework details.
 * They receive an EvaluationContext and return a validated evaluation object.
 */
export class BaseEvaluationProvider {
  /**
   * Evaluate a candidate's interview performance.
   *
   * @param {import('../../prompts/EvaluationContext.js').EvaluationContext} context
   *   The structured evaluation context containing interview config, summary, and transcript.
   * @returns {Promise<Object>} A validated evaluation object matching the InterviewResult schema.
   * @throws {Error} If the method is not implemented by a subclass.
   */
  async evaluate(context) {
    throw new Error(
      "Not Implemented: evaluate must be implemented by the provider subclass."
    );
  }
}
