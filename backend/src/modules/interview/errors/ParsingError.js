import { AIResponseError } from "./AIResponseError.js";

/**
 * ParsingError
 * 
 * Thrown when the raw AI response cannot be cleanly parsed into JSON.
 */
export class ParsingError extends AIResponseError {
  constructor(message, rawResponse = null) {
    super(message);
    this.name = "ParsingError";
    this.rawResponse = rawResponse;
  }
}
