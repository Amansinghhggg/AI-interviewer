import { ParsingError } from "../errors/ParsingError.js";

/**
 * QuestionResponseParser
 * 
 * Responsible STRICTLY for parsing raw AI text into Javascript objects.
 * It trims whitespace, removes markdown code blocks, and runs JSON.parse().
 * It does NOT validate the schema.
 */
export class QuestionResponseParser {
  /**
   * Parses the text from an AIProviderResponse into a JSON object/array.
   * 
   * @param {import('../providers/AIProvider/AIProviderResponse.js').AIProviderResponse} response
   * @returns {any} The parsed JSON object or array.
   * @throws {ParsingError} If the text cannot be parsed.
   */
  static parse(response) {
    if (!response || typeof response.text !== "string") {
      throw new ParsingError("Invalid AIProviderResponse provided to parser.");
    }

    let text = response.text.trim();

    // Strip out markdown formatting (e.g. ```json ... ```)
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
      throw new ParsingError(`Failed to parse AI response as JSON: ${error.message}`, response.text);
    }
  }
}
