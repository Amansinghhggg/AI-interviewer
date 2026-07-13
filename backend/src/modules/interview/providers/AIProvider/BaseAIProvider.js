import { AIProviderResponse } from "./AIProviderResponse.js";

/**
 * BaseAIProvider.js
 *
 * The abstract contract that all AI Providers must implement.
 * Ensures the InterviewEngine doesn't know which SDK is used.
 */
export class BaseAIProvider {
  /**
   * Generates a raw response from the underlying AI model.
   *
   * @param {string} prompt - The validated, fully constructed prompt string.
   * @returns {Promise<AIProviderResponse>} The structured response wrapper.
   * @throws {Error} Application-level error on failure.
   */
  async generate(prompt) {
    throw new Error("generate(prompt) must be implemented by subclasses");
  }
}
