/**
 * EvaluationProvider Factory
 *
 * Creates the appropriate evaluation provider based on the given type.
 * Currently no evaluation providers are implemented — this is a placeholder
 * for the architecture that will be used in future phases.
 *
 * @param {string} type - The evaluation provider type (e.g., 'gemini', 'openai').
 * @returns {import('./BaseEvaluationProvider.js').BaseEvaluationProvider}
 * @throws {Error} Always throws for now — no providers are available yet.
 */
export const createEvaluationProvider = (type) => {
  throw new Error(
    `Not Implemented: Evaluation provider "${type}" is not available. ` +
    "Evaluation providers will be implemented in a future phase."
  );
};
