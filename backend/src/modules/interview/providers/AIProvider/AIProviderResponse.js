/**
 * AIProviderResponse
 * 
 * A unified wrapper for raw responses returned by AI providers.
 * Currently it only holds the raw text, but in the future it can be 
 * cleanly extended to include provider details, model, token usage, 
 * latency, and finish reasons.
 */
export class AIProviderResponse {
  /**
   * @param {Object} params
   * @param {string} params.text - The raw string response from the model.
   */
  constructor({ text }) {
    if (typeof text !== "string") {
      throw new Error("AIProviderResponse requires a 'text' string.");
    }
    this.text = text;
  }
}
