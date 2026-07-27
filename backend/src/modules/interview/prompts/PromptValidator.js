/**
 * PromptValidator
 *
 * Validates the PromptContext before it is used by any PromptBuilder.
 * Ensures that AI providers receive complete and well-formed instructions.
 * Provider-agnostic.
 *
 * Philosophy: fail loudly and specifically at the validation boundary rather
 * than letting a missing/malformed field surface later as a confusing prompt
 * (e.g. "Experience Level: undefined") or a crash deep inside a PromptBuilder.
 */
export class PromptValidator {
  /** Difficulty values the PromptBuilder's calibration logic understands. */
  static ALLOWED_DIFFICULTIES = ["Easy", "Medium", "Hard"];

  /** Experience bands the PromptBuilder's calibration logic understands. */
  static ALLOWED_EXPERIENCE_LEVELS = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];

  /**
   * Validates the configuration required for initial prompt generation.
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @throws {Error} If validation fails.
   */
  static validateInitialContext(promptContext) {
    if (!promptContext) throw new Error("PromptContext is required");
    if (!promptContext.config) throw new Error("PromptContext must contain config");

    const { config } = promptContext;

    if (!this.#isNonEmptyString(config.jobRole)) {
      throw new Error("config.jobRole is required and must be a non-empty string");
    }
    if (!Array.isArray(config.topics)) {
      throw new Error("config.topics must be an array");
    }
    if (!config.topics.every((t) => this.#isNonEmptyString(t))) {
      throw new Error("config.topics must only contain non-empty strings");
    }

    if (!this.#isNonEmptyString(config.difficulty)) {
      throw new Error("config.difficulty is required");
    }
    if (!this.ALLOWED_DIFFICULTIES.includes(config.difficulty)) {
      throw new Error(
        `config.difficulty must be one of ${this.ALLOWED_DIFFICULTIES.join(", ")}, got "${config.difficulty}"`
      );
    }

    if (!this.#isNonEmptyString(config.experienceLevel)) {
      throw new Error("config.experienceLevel is required");
    }
    if (!this.ALLOWED_EXPERIENCE_LEVELS.includes(config.experienceLevel)) {
      throw new Error(
        `config.experienceLevel must be one of ${this.ALLOWED_EXPERIENCE_LEVELS.join(", ")}, got "${config.experienceLevel}"`
      );
    }

    if (!this.#isPositiveNumber(config.duration)) {
      throw new Error("config.duration is required and must be a positive number");
    }
    if (!this.#isNonEmptyString(config.language)) {
      throw new Error("config.language is required");
    }
    if (!this.#isNonEmptyString(config.interviewType)) {
      throw new Error("config.interviewType is required");
    }

    if (config.instructions !== undefined && config.instructions !== null && typeof config.instructions !== "string") {
      throw new Error("config.instructions must be a string when provided");
    }
  }

  /**
   * Validates the configuration and state/history required for adaptive generation.
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @throws {Error} If validation fails.
   */
  static validateAdaptiveContext(promptContext) {
    this.validateInitialContext(promptContext);

    const { state, history } = promptContext;

    if (!state) throw new Error("PromptContext must contain state for adaptive generation");
    if (!history) throw new Error("PromptContext must contain history for adaptive generation");

    // --- state shape ---
    const requiredStateArrays = ["coveredTopics", "remainingTopics", "coveredConcepts", "difficultyHistory"];
    for (const field of requiredStateArrays) {
      if (!Array.isArray(state[field])) {
        throw new Error(`state.${field} must be an array`);
      }
    }

    const requiredStateNumbers = ["remainingTime", "currentQuestion", "maxQuestions"];
    for (const field of requiredStateNumbers) {
      if (!this.#isNonNegativeNumber(state[field])) {
        throw new Error(`state.${field} is required and must be a non-negative number`);
      }
    }

    if (
      state.topicDistribution !== undefined &&
      state.topicDistribution !== null &&
      (typeof state.topicDistribution !== "object" || Array.isArray(state.topicDistribution))
    ) {
      throw new Error("state.topicDistribution must be a plain object when provided");
    }

    // --- history shape ---
    if (!Array.isArray(history.exchanges)) {
      throw new Error("history.exchanges must be an array");
    }
    history.exchanges.forEach((exchange, i) => {
      if (!exchange || !this.#isNonEmptyString(exchange.question)) {
        throw new Error(`history.exchanges[${i}].question is required and must be a non-empty string`);
      }
    });
  }

  static #isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  static #isPositiveNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
  }

  static #isNonNegativeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
}