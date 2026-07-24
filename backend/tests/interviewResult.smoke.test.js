/**
 * Smoke Test — InterviewResult Schema (Refined)
 *
 * Validates the schema in-memory (no MongoDB connection required).
 * Run with:  node backend/tests/interviewResult.smoke.test.js
 */

import mongoose from "mongoose";
import InterviewResult from "../src/modules/interview/models/InterviewResult.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const oid = () => new mongoose.Types.ObjectId();

function pass(label) {
  console.log(`  ✅  ${label}`);
}

function fail(label, err) {
  console.error(`  ❌  ${label}`);
  console.error(`      ${err.message ?? err}`);
  process.exitCode = 1;
}

// ── Test Data ────────────────────────────────────────────────────────────────

const validDoc = {
  interviewId: oid(),
  candidateId: oid(),
  sessionId: oid(),
  scores: {
    overall: 8,
    technical: 7.5,
    communication: 9,
    problemSolving: 8,
    confidence: 7,
    topicCoverage: 8.5,
  },
  recommendation: "HIRE",
  reasoning: "Strong fundamentals with room for growth in system design.",
  strengths: [
    "Clean code practices",
    "Good communication",
    "Quick problem solving",
  ],
  weaknesses: [
    "Needs deeper system design knowledge",
    "Could improve on edge-case handling",
  ],
  questionEvaluations: [
    {
      questionId: "q1",
      question: "Explain closures in JavaScript.",
      answer:
        "A closure is a function that retains access to its lexical scope...",
      scores: { technical: 8, communication: 9 },
      feedback: "Clear and concise explanation with a good example.",
    },
    {
      questionId: "q2",
      question: "What is the event loop?",
      answer: "The event loop is a mechanism that...",
      scores: { technical: 7, communication: 8 },
      feedback: "Decent answer but missed microtask queue details.",
    },
  ],
  aiMetadata: {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    evaluatedAt: new Date(),
    latencyMs: 1240,
  },
};

// ── Tests ────────────────────────────────────────────────────────────────────

console.log("\n🧪 InterviewResult Schema — Smoke Tests (Refined)\n");

// 1. Valid document passes validation
try {
  const doc = new InterviewResult(validDoc);
  const err = doc.validateSync();
  if (err) throw err;
  pass("Valid document passes validation");
} catch (e) {
  fail("Valid document passes validation", e);
}

// 2. Timestamps are generated
try {
  const schemaOptions = InterviewResult.schema.options;
  if (!schemaOptions.timestamps) throw new Error("timestamps not enabled");
  pass("Schema has timestamps enabled");
} catch (e) {
  fail("Schema has timestamps enabled", e);
}

// 3. Enum validation — valid values (normalized UPPER_SNAKE_CASE)
try {
  const validValues = [
    "STRONG_HIRE",
    "HIRE",
    "BORDERLINE",
    "NEEDS_IMPROVEMENT",
    "REJECT",
  ];
  for (const val of validValues) {
    const doc = new InterviewResult({ ...validDoc, recommendation: val });
    const err = doc.validateSync();
    if (err)
      throw new Error(`"${val}" should be valid but got: ${err.message}`);
  }
  pass("All valid recommendation enums accepted (UPPER_SNAKE_CASE)");
} catch (e) {
  fail("All valid recommendation enums accepted (UPPER_SNAKE_CASE)", e);
}

// 4. Enum validation — old display values rejected
try {
  const doc = new InterviewResult({
    ...validDoc,
    recommendation: "Strong Hire",
  });
  const err = doc.validateSync();
  if (!err)
    throw new Error(
      "Expected validation error for old display value 'Strong Hire'"
    );
  if (!err.errors.recommendation)
    throw new Error("Expected error on 'recommendation' path");
  pass("Old display-format enum values rejected");
} catch (e) {
  fail("Old display-format enum values rejected", e);
}

// 5. Enum validation — arbitrary invalid value rejected
try {
  const doc = new InterviewResult({
    ...validDoc,
    recommendation: "Maybe",
  });
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for invalid enum 'Maybe'");
  if (!err.errors.recommendation)
    throw new Error("Expected error on 'recommendation' path");
  pass("Invalid recommendation enum rejected");
} catch (e) {
  fail("Invalid recommendation enum rejected", e);
}

// 6. Required field — interviewId missing
try {
  const { interviewId, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for missing interviewId");
  if (!err.errors.interviewId)
    throw new Error("Expected error on 'interviewId' path");
  pass("Missing interviewId rejected");
} catch (e) {
  fail("Missing interviewId rejected", e);
}

// 7. Required field — candidateId missing
try {
  const { candidateId, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for missing candidateId");
  if (!err.errors.candidateId)
    throw new Error("Expected error on 'candidateId' path");
  pass("Missing candidateId rejected");
} catch (e) {
  fail("Missing candidateId rejected", e);
}

// 8. Required field — sessionId missing
try {
  const { sessionId, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for missing sessionId");
  if (!err.errors.sessionId)
    throw new Error("Expected error on 'sessionId' path");
  pass("Missing sessionId rejected");
} catch (e) {
  fail("Missing sessionId rejected", e);
}

// 9. Required field — recommendation missing
try {
  const { recommendation, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for missing recommendation");
  if (!err.errors.recommendation)
    throw new Error("Expected error on 'recommendation' path");
  pass("Missing recommendation rejected");
} catch (e) {
  fail("Missing recommendation rejected", e);
}

// 10. Required field — aiMetadata missing
try {
  const { aiMetadata, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for missing aiMetadata");
  pass("Missing aiMetadata rejected");
} catch (e) {
  fail("Missing aiMetadata rejected", e);
}

// 11. Nested scores — out-of-bounds values rejected
try {
  const doc = new InterviewResult({
    ...validDoc,
    scores: {
      ...validDoc.scores,
      overall: 15,
      technical: -1,
    },
  });
  const err = doc.validateSync();
  if (!err)
    throw new Error("Expected validation error for out-of-range scores");
  if (!err.errors["scores.overall"])
    throw new Error("Expected error on 'scores.overall' path");
  if (!err.errors["scores.technical"])
    throw new Error("Expected error on 'scores.technical' path");
  pass("Out-of-range nested scores rejected (scores.overall > 10, scores.technical < 0)");
} catch (e) {
  fail("Out-of-range nested scores rejected", e);
}

// 12. Nested scores — valid boundary values accepted
try {
  const doc = new InterviewResult({
    ...validDoc,
    scores: {
      overall: 0,
      technical: 10,
      communication: 5,
      problemSolving: 0,
      confidence: 10,
      topicCoverage: 5,
    },
  });
  const err = doc.validateSync();
  if (err) throw err;
  pass("Boundary score values (0 and 10) accepted");
} catch (e) {
  fail("Boundary score values (0 and 10) accepted", e);
}

// 13. Question evaluation — nested scores validated
try {
  const doc = new InterviewResult({
    ...validDoc,
    questionEvaluations: [
      {
        questionId: "q1",
        question: "Test question",
        answer: "Test answer",
        scores: { technical: 15, communication: -1 },
        feedback: "Test",
      },
    ],
  });
  const err = doc.validateSync();
  if (!err)
    throw new Error(
      "Expected validation error for out-of-range question scores"
    );
  pass("Out-of-range nested question scores rejected");
} catch (e) {
  fail("Out-of-range nested question scores rejected", e);
}

// 14. Question evaluation sub-schema — missing required fields
try {
  const doc = new InterviewResult({
    ...validDoc,
    questionEvaluations: [{ feedback: "Good" }],
  });
  const err = doc.validateSync();
  if (!err)
    throw new Error(
      "Expected validation error for question evaluation missing questionId & question"
    );
  pass("Question evaluation rejects missing required fields");
} catch (e) {
  fail("Question evaluation rejects missing required fields", e);
}

// 15. Defaults — strengths/weaknesses default to empty arrays
try {
  const { strengths, weaknesses, ...rest } = validDoc;
  const doc = new InterviewResult(rest);
  if (!Array.isArray(doc.strengths) || doc.strengths.length !== 0)
    throw new Error("strengths should default to []");
  if (!Array.isArray(doc.weaknesses) || doc.weaknesses.length !== 0)
    throw new Error("weaknesses should default to []");
  pass("Strengths & weaknesses default to empty arrays");
} catch (e) {
  fail("Strengths & weaknesses default to empty arrays", e);
}

// 16. Indexes exist
try {
  const indexes = InterviewResult.schema.indexes();
  const indexKeys = indexes.map(([fields]) => Object.keys(fields).join("+"));

  const expected = [
    "interviewId",
    "candidateId",
    "sessionId",
    "interviewId+candidateId",
  ];
  for (const key of expected) {
    if (!indexKeys.includes(key)) throw new Error(`Missing index: ${key}`);
  }
  pass("All expected indexes defined");
} catch (e) {
  fail("All expected indexes defined", e);
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log("\n──────────────────────────────────────────");
if (process.exitCode) {
  console.log("⚠️  Some tests failed. See errors above.\n");
} else {
  console.log("🎉 All smoke tests passed!\n");
}
