import { ProviderError } from "../../errors/VoiceErrors.js";

/**
 * Abstract Base Class for Speech Providers
 */
export class BaseSpeechProvider {
  /**
   * Transcribe an audio file buffer.
   * @param {Object} audio - Contains buffer, mimetype, and originalname
   * @returns {Promise<string>} The transcript
   */
  async transcribe(audio) {
    throw new Error("Method 'transcribe()' must be implemented by subclasses");
  }

  /**
   * Helper to throw standardized provider errors
   * @param {Error} error - Original error
   */
  handleError(error) {
    console.error(`[${this.constructor.name}] Error:`, error);
    throw new ProviderError(error.message || "Speech transcription failed", this.constructor.name);
  }
}
