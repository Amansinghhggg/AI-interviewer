/**
 * AIProvider Factory
 *
 * Creates the appropriate AI provider based on the given type.
 * Currently no AI providers are implemented — this is a placeholder
 * for the architecture that will be used in future phases.
 *
 * @param {string} type - The AI provider type (e.g., 'gemini', 'openai', 'claude').
 * @returns {import('./BaseAIProvider.js').BaseAIProvider}
 * @throws {Error} Always throws for now — no providers are available yet.
 */
export const createAIProvider = (type) => {
  throw new Error(
    `Not Implemented: AI provider "${type}" is not available. ` +
    "AI providers will be implemented in a future phase."
  );
};
