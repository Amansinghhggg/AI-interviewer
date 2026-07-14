import { GroqEvaluationProvider } from "./GroqEvaluationProvider.js";

/**
 * Provider Registry
 * Maps configuration string to the EvaluationProvider class.
 * Ensures the caller never needs to branch logic for new providers.
 */
const providerRegistry = {
  groq: GroqEvaluationProvider,
  // gemini: GeminiEvaluationProvider,
  // openai: OpenAIEvaluationProvider,
};

/**
 * EvaluationProvider Factory
 *
 * Creates the appropriate evaluation provider based on the given type.
 * This is the single entry point for obtaining an evaluation provider instance.
 *
 * @param {string} [type] - The evaluation provider type (e.g., 'groq', 'gemini').
 *   Defaults to the AI_PROVIDER environment variable, then falls back to 'groq'.
 * @returns {import('./BaseEvaluationProvider.js').BaseEvaluationProvider}
 * @throws {Error} If the requested provider type is not supported.
 */
export const createEvaluationProvider = (
  type = process.env.AI_PROVIDER || "groq"
) => {
  const ProviderClass = providerRegistry[type.toLowerCase()];

  if (!ProviderClass) {
    throw new Error(
      `Not Implemented: Evaluation provider "${type}" is not available. ` +
        `Supported: ${Object.keys(providerRegistry).join(", ")}`
    );
  }

  return new ProviderClass();
};
