import { ParsingError } from "../errors/ParsingError.js";

/**
 * EvaluationResponseParser
 *
 * Responsible STRICTLY for parsing raw AI evaluation text into JavaScript objects.
 * It trims whitespace, removes markdown code blocks, and runs JSON.parse().
 * It does NOT validate the schema — that is the validator's job.
 *
 * Mirrors QuestionResponseParser for architectural consistency.
 */
export class EvaluationResponseParser {
  /**
   * Parses the text from an AIProviderResponse into a JSON object.
   *
   * @param {import('../providers/AIProvider/AIProviderResponse.js').AIProviderResponse} response
   * @returns {Object} The parsed JSON object.
   * @throws {ParsingError} If the response is invalid or the text cannot be parsed.
   */
  static parse(response) {
    if (!response || typeof response.text !== "string") {
      throw new ParsingError("Invalid AIProviderResponse provided to parser.");
    }

    let text = response.text.trim();

    // Strip out markdown formatting (e.g. ```json ... ``` or ``` ... ```)
    if (text.startsWith("```")) {
      // Find the end of the first line (e.g. ```json)
      const firstNewline = text.indexOf("\n");
      if (firstNewline !== -1) {
        text = text.substring(firstNewline).trim();
      }

      // Remove trailing ```
      if (text.endsWith("```")) {
        text = text.substring(0, text.length - 3).trim();
      }
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      throw new ParsingError(
        `Failed to parse AI evaluation response as JSON: ${error.message}`,
        response.text
      );
    }
  }
}
