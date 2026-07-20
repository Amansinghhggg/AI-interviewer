import { z } from "zod";
import { ValidationError } from "../errors/ValidationError.js";

// ── Score Schema ─────────────────────────────────────────────────────────────
// Reusable: a number between 0 and 10 (decimals allowed).

const ScoreSchema = z.coerce.number().min(0).max(10);

// ── Overall Scores Schema ────────────────────────────────────────────────────
// Maps directly to InterviewResult.scores

const EvaluationScoresSchema = z.object({
  overall: ScoreSchema,
  technical: ScoreSchema,
  communication: ScoreSchema,
  problemSolving: ScoreSchema,
  confidence: ScoreSchema,
  topicCoverage: ScoreSchema,
});

// ── Question-level Scores Schema ─────────────────────────────────────────────
// Maps directly to InterviewResult.questionEvaluations[].scores

const QuestionScoresSchema = z.object({
  technical: ScoreSchema,
  communication: ScoreSchema,
});

// ── Question Evaluation Schema ───────────────────────────────────────────────
// Maps directly to InterviewResult.questionEvaluations[]

const QuestionEvaluationSchema = z
  .object({
    questionId: z.union([z.string(), z.number()]),
    scores: QuestionScoresSchema,
    feedback: z.string().min(1),
  })
  .strip(); // Remove unknown properties

// ── Recommendation Enum ──────────────────────────────────────────────────────
// Must match InterviewResult.recommendation enum exactly.

const RecommendationEnum = z.enum([
  "STRONG_HIRE",
  "HIRE",
  "BORDERLINE",
  "NO_HIRE",
  "STRONG_NO_HIRE",
]);

// ── Full Evaluation Response Schema ──────────────────────────────────────────
// Maps directly to the AI-generated fields of InterviewResult.
// Reference fields (interviewId, candidateId, sessionId) and aiMetadata
// are populated by the caller, not by the AI.

const EvaluationResponseSchema = z
  .object({
    scores: EvaluationScoresSchema,
    recommendation: RecommendationEnum,
    reasoning: z.string().min(1),
    strengths: z.array(z.string().min(1)).min(1),
    weaknesses: z.array(z.string().min(1)).min(1),
    questionEvaluations: z.array(QuestionEvaluationSchema).min(1),
  })
  .strip(); // Remove unknown properties

/**
 * EvaluationResponseValidator
 *
 * Validates that a parsed JSON object matches the InterviewResult schema.
 * Uses Zod for strict structural validation.
 * Strips unknown fields to prevent unexpected data from reaching the DB.
 * Throws ValidationError on failure.
 *
 * Mirrors QuestionResponseValidator for architectural consistency.
 */
export class EvaluationResponseValidator {
  /**
   * Validates a parsed evaluation object against the schema.
   *
   * @param {Object} parsedData - The parsed JSON object from EvaluationResponseParser.
   * @returns {Object} A validated and cleaned evaluation object.
   * @throws {ValidationError} If the data does not match the schema.
   */
  static validate(parsedData) {
    try {
      return EvaluationResponseSchema.parse(parsedData);
    } catch (error) {
      console.error("[EvaluationValidator] Validation failed for data:", JSON.stringify(parsedData, null, 2));
      if (error instanceof z.ZodError) {
        console.error("[EvaluationValidator] Zod Errors:", JSON.stringify(error.errors, null, 2));
        throw new ValidationError(
          "AI evaluation response failed schema validation.",
          error.errors
        );
      }
      throw new ValidationError(
        `Unexpected validation error: ${error.message}`
      );
    }
  }
}
