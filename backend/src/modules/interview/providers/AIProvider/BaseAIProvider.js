/**
 * BaseAIProvider
 *
 * Abstract base class that defines the contract for all raw AI providers.
 * Future providers (GeminiProvider, OpenAIProvider, ClaudeProvider)
 * must extend this class and implement the generate method.
 *
 * This is the lowest-level AI abstraction. QuestionProviders and
 * EvaluationProviders may use an AIProvider internally to communicate
 * with an AI service, but the rest of the application should never
 * interact with an AIProvider directly.
 *
 * Providers should NOT know about Express, MongoDB, or any framework details.
 */
export class BaseAIProvider {
  /**
   * Send a prompt to the AI service and return the response.
   *
   * @param {string} prompt - The prompt to send to the AI service.
   * @param {Object} [options={}] - Provider-specific options.
   * @param {string} [options.model] - The model to use (provider-specific).
   * @param {number} [options.temperature] - Sampling temperature.
   * @param {number} [options.maxTokens] - Maximum tokens in the response.
   * @returns {Promise<string>} The AI-generated response text.
   * @throws {Error} If the method is not implemented by a subclass.
   */
  async generate(prompt, options = {}) {
    throw new Error("Not Implemented: generate must be implemented by the provider subclass.");
  }
}
