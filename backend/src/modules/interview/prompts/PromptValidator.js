/**
 * PromptValidator
 *
 * Validates the PromptContext before it is used by any PromptBuilder.
 * Ensures that AI providers receive complete and well-formed instructions.
 * Provider-agnostic.
 */
export class PromptValidator {
  /**
   * Validates the configuration required for initial prompt generation.
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @throws {Error} If validation fails.
   */
  static validateInitialContext(promptContext) {
    if (!promptContext) throw new Error("PromptContext is required");
    if (!promptContext.config) throw new Error("PromptContext must contain config");

    const { config } = promptContext;

    if (!config.jobRole) throw new Error("config.jobRole is required");
    if (!Array.isArray(config.topics)) throw new Error("config.topics must be an array");
    if (!config.difficulty) throw new Error("config.difficulty is required");
    if (!config.duration) throw new Error("config.duration is required");
    if (!config.language) throw new Error("config.language is required");
    if (!config.interviewType) throw new Error("config.interviewType is required");
  }

  /**
   * Validates the configuration and state/history required for adaptive generation.
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @throws {Error} If validation fails.
   */
  static validateAdaptiveContext(promptContext) {
    this.validateInitialContext(promptContext);

    if (!promptContext.state) throw new Error("PromptContext must contain state for adaptive generation");
    if (!promptContext.history) throw new Error("PromptContext must contain history for adaptive generation");

    const { history } = promptContext;
    if (!Array.isArray(history.exchanges)) throw new Error("history.exchanges must be an array");
  }
}
