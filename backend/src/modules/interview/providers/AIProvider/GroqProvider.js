import Groq from "groq-sdk";
import { BaseAIProvider } from "./BaseAIProvider.js";
import { AIConfig } from "./config/ai.config.js";
import { AIProviderResponse } from "./AIProviderResponse.js";

/**
 * GroqProvider
 *
 * Implements the AI Provider contract using the groq-sdk.
 * Responsibilities:
 * - Initialize client
 * - Send prompt
 * - Receive and return raw text
 * - Handle provider errors cleanly
 */
export class GroqProvider extends BaseAIProvider {
  constructor() {
    super();
    if (!AIConfig.groqApiKey) {
      throw new Error("AI Provider Error: GROQ_API_KEY is missing or invalid.");
    }
    if (!AIConfig.groqModel) {
      throw new Error("AI Provider Error: GROQ_MODEL is missing.");
    }
    
    this.ai = new Groq({ apiKey: AIConfig.groqApiKey });
    this.modelName = AIConfig.groqModel;
  }

  /**
   * @param {string} prompt
   * @returns {Promise<AIProviderResponse>}
   */
  async generate(prompt) {
    const startTime = Date.now();
    try {
      const response = await this.ai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: this.modelName,
        temperature: AIConfig.temperature,
        max_tokens: AIConfig.maxOutputTokens,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new Error("AI Provider Error: Empty response from provider.");
      }

      this._log("Success", Date.now() - startTime);
      return new AIProviderResponse({ text });
      
    } catch (error) {
      this._log("Failure", Date.now() - startTime);
      this._handleError(error);
    }
  }

  /**
   * Safe logging that never leaks API keys or prompts.
   */
  _log(status, durationMs) {
    console.log(`[AI Provider] Provider: Groq | Model: ${this.modelName} | Status: ${status} | Duration: ${durationMs}ms`);
  }

  /**
   * Translates raw SDK errors into safe application errors.
   */
  _handleError(error) {
    if (error.status === 429) {
      throw new Error("AI Provider Error: Rate limit exceeded.");
    }
    if (error.status === 401 || error.status === 403) {
      throw new Error("AI Provider Error: Invalid API key or unauthorized.");
    }
    if (error.name === 'TimeoutError' || (error.message && error.message.toLowerCase().includes('timeout'))) {
      throw new Error("AI Provider Error: Request timeout.");
    }
    
    throw new Error(`AI Provider Error: Network or provider failure. (${error.message || "Unknown error"})`);
  }
}
