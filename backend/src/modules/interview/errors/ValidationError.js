import { AIResponseError } from "./AIResponseError.js";

/**
 * ValidationError
 * 
 * Thrown when the parsed JSON successfully loads, but fails to match
 * the expected domain schema (e.g. missing required fields, wrong types).
 */
export class ValidationError extends AIResponseError {
  constructor(message, validationDetails = null) {
    super(message);
    this.name = "ValidationError";
    this.validationDetails = validationDetails;
  }
}
