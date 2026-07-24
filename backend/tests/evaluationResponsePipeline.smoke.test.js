/**
 * Smoke Test — Evaluation Response Pipeline (Parser + Validator)
 *
 * Tests the complete parsing and validation pipeline without AI calls or DB.
 * Run with:  node backend/tests/evaluationResponsePipeline.smoke.test.js
 */

import { EvaluationResponseParser } from "../src/modules/interview/parsers/EvaluationResponseParser.js";
import { EvaluationResponseValidator } from "../src/modules/interview/validators/EvaluationResponseValidator.js";
import { ParsingError } from "../src/modules/interview/errors/ParsingError.js";
import { ValidationError } from "../src/modules/interview/errors/ValidationError.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function pass(label) {
  console.log(`  ✅  ${label}`);
}

function fail(label, err) {
  console.error(`  ❌  ${label}`);
  console.error(`      ${err.message ?? err}`);
  process.exitCode = 1;
}

/** Create a mock AIProviderResponse. */
function mockResponse(text) {
  return { text };
}

// ── Valid Test Data ──────────────────────────────────────────────────────────

const validEvaluation = {
  scores: {
    overall: 8.5,
    technical: 8,
    communication: 9,
    problemSolving: 8,
    confidence: 8,
    topicCoverage: 9,
  },
  recommendation: "HIRE",
  reasoning:
    "The candidate demonstrated strong React fundamentals and excellent communication skills. Minor gaps in system design knowledge.",
  strengths: [
    "Clear explanation of Virtual DOM internals",
    "Strong understanding of closures with practical examples",
    "Well-structured answers throughout the interview",
  ],
  weaknesses: [
    "Limited system design knowledge",
    "Could improve edge-case handling in algorithm questions",
  ],
  questionEvaluations: [
    {
      questionId: "q1",
      scores: { technical: 9, communication: 9 },
      feedback:
        "Excellent explanation of the Virtual DOM with accurate details about the diffing algorithm.",
      keyTakeaways: ["Accurate details about diffing algorithm", "Excellent explanation"],
    },
    {
      questionId: "q2",
      scores: { technical: 8, communication: 8 },
      feedback:
        "Good closure explanation with a practical counter example. Could have mentioned memory implications.",
      keyTakeaways: ["Practical counter example", "Could have mentioned memory implications"],
    },
    {
      questionId: 3,
      scores: { technical: 7, communication: 8 },
      feedback:
        "Decent event loop explanation but missed microtask queue details.",
      keyTakeaways: ["Missed microtask queue details"],
    },
  ],
};

// ── Tests ────────────────────────────────────────────────────────────────────

console.log("\n🧪 Evaluation Response Pipeline — Smoke Tests\n");

// ─── Parser Tests ────────────────────────────────────────────────────────────

// 1. Valid JSON parses correctly
try {
  const response = mockResponse(JSON.stringify(validEvaluation));
  const parsed = EvaluationResponseParser.parse(response);
  if (parsed.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  if (parsed.scores.overall !== 8.5) throw new Error("scores.overall mismatch");
  pass("Valid JSON parses correctly");
} catch (e) {
  fail("Valid JSON parses correctly", e);
}

// 2. Markdown ```json wrapper removed
try {
  const wrapped = "```json\n" + JSON.stringify(validEvaluation) + "\n```";
  const parsed = EvaluationResponseParser.parse(mockResponse(wrapped));
  if (parsed.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  pass("Markdown ```json wrapper removed");
} catch (e) {
  fail("Markdown ```json wrapper removed", e);
}

// 3. Markdown ``` wrapper (no language) removed
try {
  const wrapped = "```\n" + JSON.stringify(validEvaluation) + "\n```";
  const parsed = EvaluationResponseParser.parse(mockResponse(wrapped));
  if (parsed.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  pass("Markdown ``` wrapper (no language) removed");
} catch (e) {
  fail("Markdown ``` wrapper (no language) removed", e);
}

// 4. Leading/trailing whitespace trimmed
try {
  const padded = "   \n\n" + JSON.stringify(validEvaluation) + "\n   \n";
  const parsed = EvaluationResponseParser.parse(mockResponse(padded));
  if (parsed.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  pass("Leading/trailing whitespace trimmed");
} catch (e) {
  fail("Leading/trailing whitespace trimmed", e);
}

// 5. Invalid JSON throws ParsingError
try {
  let threw = false;
  try {
    EvaluationResponseParser.parse(mockResponse("{ not valid json }"));
  } catch (err) {
    if (!(err instanceof ParsingError)) throw new Error(`Expected ParsingError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ParsingError");
  pass("Invalid JSON throws ParsingError");
} catch (e) {
  fail("Invalid JSON throws ParsingError", e);
}

// 6. Null response throws ParsingError
try {
  let threw = false;
  try {
    EvaluationResponseParser.parse(null);
  } catch (err) {
    if (!(err instanceof ParsingError)) throw new Error(`Expected ParsingError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ParsingError");
  pass("Null response throws ParsingError");
} catch (e) {
  fail("Null response throws ParsingError", e);
}

// 7. ParsingError is an AIResponseError
try {
  let caughtError = null;
  try {
    EvaluationResponseParser.parse(mockResponse("broken"));
  } catch (err) {
    caughtError = err;
  }
  if (!caughtError) throw new Error("Expected error");
  if (caughtError.name !== "ParsingError") throw new Error(`Expected ParsingError, got ${caughtError.name}`);
  // Check inheritance chain
  const { AIResponseError } = await import(
    "../src/modules/interview/errors/AIResponseError.js"
  );
  if (!(caughtError instanceof AIResponseError))
    throw new Error("ParsingError should extend AIResponseError");
  pass("ParsingError extends AIResponseError");
} catch (e) {
  fail("ParsingError extends AIResponseError", e);
}

// ─── Validator Tests ─────────────────────────────────────────────────────────

// 8. Valid evaluation passes validation
try {
  const validated = EvaluationResponseValidator.validate(validEvaluation);
  if (validated.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  if (validated.scores.overall !== 8.5) throw new Error("scores.overall mismatch");
  if (validated.questionEvaluations.length !== 3) throw new Error("questionEvaluations length mismatch");
  pass("Valid evaluation passes validation");
} catch (e) {
  fail("Valid evaluation passes validation", e);
}

// 9. Invalid recommendation throws ValidationError
try {
  let threw = false;
  try {
    EvaluationResponseValidator.validate({
      ...validEvaluation,
      recommendation: "MAYBE",
    });
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Invalid recommendation throws ValidationError");
} catch (e) {
  fail("Invalid recommendation throws ValidationError", e);
}

// 10. Missing scores rejected
try {
  let threw = false;
  try {
    const { scores, ...rest } = validEvaluation;
    EvaluationResponseValidator.validate(rest);
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Missing scores rejected");
} catch (e) {
  fail("Missing scores rejected", e);
}

// 11. Invalid nested scores rejected (out of range)
try {
  let threw = false;
  try {
    EvaluationResponseValidator.validate({
      ...validEvaluation,
      scores: { ...validEvaluation.scores, overall: 15 },
    });
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Invalid nested scores (out of range) rejected");
} catch (e) {
  fail("Invalid nested scores (out of range) rejected", e);
}

// 12. Negative score rejected
try {
  let threw = false;
  try {
    EvaluationResponseValidator.validate({
      ...validEvaluation,
      scores: { ...validEvaluation.scores, technical: -1 },
    });
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Negative score rejected");
} catch (e) {
  fail("Negative score rejected", e);
}

// 13. Missing questionEvaluation fields rejected
try {
  let threw = false;
  try {
    EvaluationResponseValidator.validate({
      ...validEvaluation,
      questionEvaluations: [{ questionId: "q1" }], // missing scores and feedback
    });
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Missing questionEvaluation fields rejected");
} catch (e) {
  fail("Missing questionEvaluation fields rejected", e);
}

// 14. Unknown fields are stripped
try {
  const withExtras = {
    ...validEvaluation,
    extraField: "should be removed",
    anotherOne: 42,
    questionEvaluations: validEvaluation.questionEvaluations.map((qe) => ({
      ...qe,
      unknownProp: "strip me",
    })),
  };
  const validated = EvaluationResponseValidator.validate(withExtras);
  if ("extraField" in validated) throw new Error("extraField should be stripped");
  if ("anotherOne" in validated) throw new Error("anotherOne should be stripped");
  if ("unknownProp" in validated.questionEvaluations[0])
    throw new Error("unknownProp should be stripped from question evaluations");
  pass("Unknown fields are stripped");
} catch (e) {
  fail("Unknown fields are stripped", e);
}

// 15. Boundary score values (0 and 10) accepted
try {
  const boundary = {
    ...validEvaluation,
    scores: {
      overall: 0,
      technical: 10,
      communication: 0,
      problemSolving: 10,
      confidence: 0,
      topicCoverage: 10,
    },
    questionEvaluations: [
      {
        questionId: "q1",
        scores: { technical: 0, communication: 10 },
        feedback: "Boundary test.",
        keyTakeaways: ["Boundary case"],
      },
    ],
  };
  const validated = EvaluationResponseValidator.validate(boundary);
  if (validated.scores.overall !== 0) throw new Error("overall should be 0");
  if (validated.scores.technical !== 10) throw new Error("technical should be 10");
  if (validated.questionEvaluations[0].scores.technical !== 0)
    throw new Error("question technical should be 0");
  if (validated.questionEvaluations[0].scores.communication !== 10)
    throw new Error("question communication should be 10");
  pass("Boundary score values (0 and 10) accepted");
} catch (e) {
  fail("Boundary score values (0 and 10) accepted", e);
}

// 16. All recommendation enum values accepted
try {
  const enums = ["STRONG_HIRE", "HIRE", "BORDERLINE", "NEEDS_IMPROVEMENT", "REJECT"];
  for (const rec of enums) {
    const validated = EvaluationResponseValidator.validate({
      ...validEvaluation,
      recommendation: rec,
    });
    if (validated.recommendation !== rec)
      throw new Error(`Expected ${rec}, got ${validated.recommendation}`);
  }
  pass("All 5 recommendation enum values accepted");
} catch (e) {
  fail("All 5 recommendation enum values accepted", e);
}

// 17. ValidationError is an AIResponseError
try {
  let caughtError = null;
  try {
    EvaluationResponseValidator.validate({});
  } catch (err) {
    caughtError = err;
  }
  if (!caughtError) throw new Error("Expected error");
  const { AIResponseError } = await import(
    "../src/modules/interview/errors/AIResponseError.js"
  );
  if (!(caughtError instanceof AIResponseError))
    throw new Error("ValidationError should extend AIResponseError");
  pass("ValidationError extends AIResponseError");
} catch (e) {
  fail("ValidationError extends AIResponseError", e);
}

// ─── Full Pipeline Tests ─────────────────────────────────────────────────────

// 18. End-to-end: parse → validate
try {
  const response = mockResponse(JSON.stringify(validEvaluation));
  const parsed = EvaluationResponseParser.parse(response);
  const validated = EvaluationResponseValidator.validate(parsed);
  if (validated.recommendation !== "HIRE") throw new Error("recommendation mismatch");
  if (validated.questionEvaluations.length !== 3) throw new Error("length mismatch");
  pass("Full pipeline: parse → validate succeeds");
} catch (e) {
  fail("Full pipeline: parse → validate succeeds", e);
}

// 19. End-to-end: markdown-wrapped → parse → validate
try {
  const wrapped = "```json\n" + JSON.stringify(validEvaluation, null, 2) + "\n```";
  const parsed = EvaluationResponseParser.parse(mockResponse(wrapped));
  const validated = EvaluationResponseValidator.validate(parsed);
  if (validated.scores.overall !== 8.5) throw new Error("scores.overall mismatch");
  pass("Full pipeline: markdown-wrapped → parse → validate succeeds");
} catch (e) {
  fail("Full pipeline: markdown-wrapped → parse → validate succeeds", e);
}

// 20. Missing reasoning rejected
try {
  let threw = false;
  try {
    const { reasoning, ...rest } = validEvaluation;
    EvaluationResponseValidator.validate(rest);
  } catch (err) {
    if (!(err instanceof ValidationError))
      throw new Error(`Expected ValidationError, got ${err.name}`);
    threw = true;
  }
  if (!threw) throw new Error("Expected ValidationError");
  pass("Missing reasoning rejected");
} catch (e) {
  fail("Missing reasoning rejected", e);
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log("\n──────────────────────────────────────────");
if (process.exitCode) {
  console.log("⚠️  Some tests failed. See errors above.\n");
} else {
  console.log("🎉 All smoke tests passed!\n");
}
