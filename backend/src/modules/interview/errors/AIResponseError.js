/**
 * AIResponseError
 * 
 * Base error class for all failures related to handling AI responses.
 * Ensures we can cleanly catch AI-specific pipeline errors.
 */
export class AIResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = "AIResponseError";
  }
}
