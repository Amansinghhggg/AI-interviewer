import { ValidationError } from "../errors/VoiceErrors.js";

/**
 * Validates the raw response string from the speech provider.
 */
export class SpeechResponseValidator {
  /**
   * Validate transcript
   * @param {string} transcript
   * @returns {string} The trimmed valid transcript
   * @throws {ValidationError}
   */
  static validate(transcript) {
    if (typeof transcript !== "string") {
      throw new ValidationError("Transcript must be a string");
    }

    const cleanTranscript = transcript.trim();

    if (!cleanTranscript) {
      throw new ValidationError("Transcript is empty or could not be generated");
    }

    return cleanTranscript;
  }
}
