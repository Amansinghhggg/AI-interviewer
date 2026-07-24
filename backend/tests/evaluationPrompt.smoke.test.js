/**
 * Smoke Test — EvaluationPromptBuilder
 *
 * Validates prompt generation in isolation (no AI calls, no DB).
 * Run with:  node backend/tests/evaluationPrompt.smoke.test.js
 */

import { EvaluationContext } from "../src/modules/interview/prompts/EvaluationContext.js";
import { EvaluationPromptBuilder } from "../src/modules/interview/prompts/EvaluationPromptBuilder.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function pass(label) {
  console.log(`  ✅  ${label}`);
}

function fail(label, err) {
  console.error(`  ❌  ${label}`);
  console.error(`      ${err.message ?? err}`);
  process.exitCode = 1;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const mockContext = new EvaluationContext({
  interviewConfig: {
    jobRole: "Senior React Developer",
    experienceLevel: "3-5 Years",
    topics: ["React", "JavaScript", "Node.js", "System Design"],
    duration: 45,
    totalQuestions: 5,
  },
  interviewSummary: {
    answeredQuestions: 5,
    coveredTopics: ["React", "JavaScript", "Node.js"],
    remainingTopics: ["System Design"],
    startedAt: new Date("2026-07-14T10:00:00Z"),
    endedAt: new Date("2026-07-14T10:40:00Z"),
    totalDurationMinutes: 40,
  },
  transcript: [
    {
      questionId: "q1",
      question: "Explain the Virtual DOM in React and why it improves performance.",
      topic: "React",
      difficulty: "Medium",
      answer:
        "The Virtual DOM is a lightweight in-memory representation of the real DOM. When state changes, React creates a new virtual DOM tree, diffs it against the previous one, and applies only the minimal set of changes to the real DOM. This batching avoids costly direct DOM manipulations.",
    },
    {
      questionId: "q2",
      question: "What are closures in JavaScript? Provide an example.",
      topic: "JavaScript",
      difficulty: "Easy",
      answer:
        "A closure is a function that has access to variables from its outer lexical scope even after the outer function has returned. For example, a counter factory function that returns an inner function which increments and returns a private count variable.",
    },
    {
      questionId: "q3",
      question: "Explain the event loop in Node.js.",
      topic: "Node.js",
      difficulty: "Medium",
      answer:
        "The event loop is the mechanism that allows Node.js to perform non-blocking I/O. It processes callbacks in phases: timers, pending callbacks, poll, check, and close. The poll phase waits for new I/O events and executes their callbacks.",
    },
    {
      questionId: "q4",
      question: "How does React's reconciliation algorithm work?",
      topic: "React",
      difficulty: "Hard",
      answer:
        "React uses a heuristic O(n) diffing algorithm. It compares trees level by level, assumes elements of different types produce different trees, and uses keys to identify which children have changed. This avoids the O(n^3) cost of a full tree comparison.",
    },
    {
      questionId: "q5",
      question: "What is the difference between useEffect and useLayoutEffect?",
      topic: "React",
      difficulty: "Medium",
      answer:
        "useEffect runs asynchronously after the browser has painted, while useLayoutEffect runs synchronously before the browser paints. useLayoutEffect is useful when you need to measure DOM elements or prevent visual flicker.",
    },
  ],
});

// ── Tests ────────────────────────────────────────────────────────────────────

console.log("\n🧪 EvaluationPromptBuilder — Smoke Tests\n");

let generatedPrompt = "";

// 1. Prompt generates successfully
try {
  generatedPrompt = EvaluationPromptBuilder.buildEvaluationPrompt(mockContext);
  if (typeof generatedPrompt !== "string" || generatedPrompt.length === 0) {
    throw new Error("Prompt should be a non-empty string");
  }
  pass("Prompt generates successfully");
} catch (e) {
  fail("Prompt generates successfully", e);
}

// 2. Prompt version is embedded
try {
  if (!generatedPrompt.includes("PROMPT VERSION: v1")) {
    throw new Error("Prompt version not found");
  }
  pass("Prompt version (v1) is embedded");
} catch (e) {
  fail("Prompt version (v1) is embedded", e);
}

// 3. System role section is present
try {
  if (!generatedPrompt.includes("=== SYSTEM ROLE ===")) {
    throw new Error("System role section missing");
  }
  if (!generatedPrompt.includes("Senior Technical Interviewer")) {
    throw new Error("System role description missing");
  }
  pass("System role section is present");
} catch (e) {
  fail("System role section is present", e);
}

// 4. Interview configuration is included
try {
  const checks = [
    ["Job Role: Senior React Developer", "jobRole"],
    ["Experience Level: 3-5 Years", "experienceLevel"],
    ["Topics: React, JavaScript, Node.js, System Design", "topics"],
    ["Duration: 45 minutes", "duration"],
    ["Total Questions: 5", "totalQuestions"],
  ];
  for (const [expected, field] of checks) {
    if (!generatedPrompt.includes(expected)) {
      throw new Error(`Missing config field: ${field} — expected "${expected}"`);
    }
  }
  pass("All interview configuration fields are present");
} catch (e) {
  fail("All interview configuration fields are present", e);
}

// 5. Interview summary is included
try {
  const checks = [
    "Answered Questions: 5",
    "Covered Topics: React, JavaScript, Node.js",
    "Remaining Topics: System Design",
    "Total Interview Duration: 40 minutes",
  ];
  for (const expected of checks) {
    if (!generatedPrompt.includes(expected)) {
      throw new Error(`Missing summary field: "${expected}"`);
    }
  }
  pass("Interview summary is included");
} catch (e) {
  fail("Interview summary is included", e);
}

// 6. Full transcript is included (all Q&A pairs)
try {
  for (let i = 0; i < mockContext.transcript.length; i++) {
    const entry = mockContext.transcript[i];
    if (!generatedPrompt.includes(`Question ${i + 1}`)) {
      throw new Error(`Missing question header for Q${i + 1}`);
    }
    if (!generatedPrompt.includes(`Q: ${entry.question}`)) {
      throw new Error(`Missing question text for Q${i + 1}`);
    }
    if (!generatedPrompt.includes(`A: ${entry.answer}`)) {
      throw new Error(`Missing answer text for Q${i + 1}`);
    }
    if (!generatedPrompt.includes(`Question ID: ${entry.questionId}`)) {
      throw new Error(`Missing questionId for Q${i + 1}`);
    }
  }
  pass("Full transcript included (all 5 Q&A pairs with IDs)");
} catch (e) {
  fail("Full transcript included", e);
}

// 7. Evaluation criteria section is present
try {
  const criteria = [
    "Technical Knowledge",
    "Communication",
    "Problem Solving",
    "Confidence",
    "Topic Coverage",
  ];
  for (const c of criteria) {
    if (!generatedPrompt.includes(c)) {
      throw new Error(`Missing evaluation criterion: ${c}`);
    }
  }
  pass("All 5 evaluation criteria are present");
} catch (e) {
  fail("All 5 evaluation criteria are present", e);
}

// 8. Scoring guide is present
try {
  const bands = ["9-10", "7-8", "5-6", "3-4", "0-2"];
  for (const band of bands) {
    if (!generatedPrompt.includes(band)) {
      throw new Error(`Missing scoring band: ${band}`);
    }
  }
  pass("Scoring guide with all 5 bands is present");
} catch (e) {
  fail("Scoring guide with all 5 bands is present", e);
}

// 9. Hiring recommendation enums are listed
try {
  const enums = [
    "STRONG_HIRE",
    "HIRE",
    "BORDERLINE",
    "NEEDS_IMPROVEMENT",
    "REJECT",
  ];
  for (const e of enums) {
    if (!generatedPrompt.includes(e)) {
      throw new Error(`Missing recommendation enum: ${e}`);
    }
  }
  pass("All 5 recommendation enums are listed");
} catch (e) {
  fail("All 5 recommendation enums are listed", e);
}

// 10. Output JSON schema matches InterviewResult
try {
  const requiredKeys = [
    '"scores"',
    '"overall"',
    '"technical"',
    '"communication"',
    '"problemSolving"',
    '"confidence"',
    '"topicCoverage"',
    '"recommendation"',
    '"reasoning"',
    '"strengths"',
    '"weaknesses"',
    '"questionEvaluations"',
    '"questionId"',
    '"feedback"',
  ];
  for (const key of requiredKeys) {
    if (!generatedPrompt.includes(key)) {
      throw new Error(`Missing JSON schema key: ${key}`);
    }
  }
  pass("Output JSON schema matches InterviewResult structure");
} catch (e) {
  fail("Output JSON schema matches InterviewResult structure", e);
}

// 11. Validation — null context rejected
try {
  let threw = false;
  try {
    EvaluationPromptBuilder.buildEvaluationPrompt(null);
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Expected error for null context");
  pass("Null context rejected");
} catch (e) {
  fail("Null context rejected", e);
}

// 12. Validation — missing jobRole rejected
try {
  let threw = false;
  try {
    EvaluationPromptBuilder.buildEvaluationPrompt(
      new EvaluationContext({
        interviewConfig: {
          jobRole: "",
          experienceLevel: "Fresher",
          topics: [],
          duration: 30,
          totalQuestions: 1,
        },
        interviewSummary: {
          answeredQuestions: 1,
          coveredTopics: [],
          remainingTopics: [],
          startedAt: null,
          endedAt: null,
          totalDurationMinutes: null,
        },
        transcript: [
          {
            questionId: "q1",
            question: "Test?",
            topic: "Test",
            difficulty: "Easy",
            answer: "Yes",
          },
        ],
      })
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Expected error for missing jobRole");
  pass("Missing jobRole rejected");
} catch (e) {
  fail("Missing jobRole rejected", e);
}

// 13. Validation — empty transcript rejected
try {
  let threw = false;
  try {
    EvaluationPromptBuilder.buildEvaluationPrompt(
      new EvaluationContext({
        interviewConfig: {
          jobRole: "Developer",
          experienceLevel: "Fresher",
          topics: ["JS"],
          duration: 30,
          totalQuestions: 0,
        },
        interviewSummary: {
          answeredQuestions: 0,
          coveredTopics: [],
          remainingTopics: ["JS"],
          startedAt: null,
          endedAt: null,
          totalDurationMinutes: null,
        },
        transcript: [],
      })
    );
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Expected error for empty transcript");
  pass("Empty transcript rejected");
} catch (e) {
  fail("Empty transcript rejected", e);
}

// 14. EvaluationContext.fromSessionAndConfig factory works
try {
  const mockConfig = {
    jobRole: "Backend Engineer",
    experienceLevel: "1-2 Years",
    topics: ["Node.js", "Express", "MongoDB"],
    duration: 30,
  };

  const mockSessionDoc = {
    startedAt: new Date("2026-07-14T10:00:00Z"),
    updatedAt: new Date("2026-07-14T10:25:00Z"),
    questions: [
      {
        id: 1,
        question: "What is middleware in Express?",
        topic: "Express",
        difficulty: "Easy",
        type: "text",
        answer: "Middleware are functions that execute during the request lifecycle.",
        askedAt: new Date(),
        answeredAt: new Date(),
      },
      {
        id: 2,
        question: "Explain MongoDB indexing.",
        topic: "MongoDB",
        difficulty: "Medium",
        type: "text",
        answer: null,
        askedAt: new Date(),
        answeredAt: null,
      },
    ],
  };

  const ctx = EvaluationContext.fromSessionAndConfig(mockConfig, mockSessionDoc);

  if (ctx.interviewConfig.jobRole !== "Backend Engineer")
    throw new Error("jobRole mismatch");
  if (ctx.interviewConfig.totalQuestions !== 2)
    throw new Error("totalQuestions mismatch");
  if (ctx.interviewSummary.answeredQuestions !== 1)
    throw new Error("answeredQuestions mismatch");
  if (ctx.interviewSummary.coveredTopics.length !== 2)
    throw new Error("coveredTopics mismatch");
  if (!ctx.interviewSummary.remainingTopics.includes("Node.js"))
    throw new Error("remainingTopics mismatch");
  if (ctx.interviewSummary.totalDurationMinutes !== 25)
    throw new Error("totalDurationMinutes mismatch");
  if (ctx.transcript.length !== 2)
    throw new Error("transcript length mismatch");
  if (ctx.transcript[0].questionId !== 1)
    throw new Error("questionId mismatch");
  if (ctx.transcript[1].answer !== null)
    throw new Error("unanswered question should have null answer");

  pass("EvaluationContext.fromSessionAndConfig factory works correctly");
} catch (e) {
  fail("EvaluationContext.fromSessionAndConfig factory works correctly", e);
}

// 15. Generated prompt from factory context
try {
  const mockConfig = {
    jobRole: "Backend Engineer",
    experienceLevel: "1-2 Years",
    topics: ["Node.js", "Express"],
    duration: 30,
  };
  const mockSessionDoc = {
    startedAt: new Date("2026-07-14T10:00:00Z"),
    updatedAt: new Date("2026-07-14T10:25:00Z"),
    questions: [
      {
        id: 1,
        question: "What is middleware?",
        topic: "Express",
        difficulty: "Easy",
        type: "text",
        answer: "Functions in the request pipeline.",
        askedAt: new Date(),
        answeredAt: new Date(),
      },
    ],
  };

  const ctx = EvaluationContext.fromSessionAndConfig(mockConfig, mockSessionDoc);
  const prompt = EvaluationPromptBuilder.buildEvaluationPrompt(ctx);

  if (!prompt.includes("Backend Engineer")) throw new Error("jobRole missing from prompt");
  if (!prompt.includes("What is middleware?")) throw new Error("question missing from prompt");
  pass("Factory-built context produces valid prompt");
} catch (e) {
  fail("Factory-built context produces valid prompt", e);
}

// ── Print Generated Prompt ───────────────────────────────────────────────────

console.log("\n──────────────────────────────────────────");
if (process.exitCode) {
  console.log("⚠️  Some tests failed. See errors above.\n");
} else {
  console.log("🎉 All smoke tests passed!\n");
}

console.log("──────────────────────────────────────────");
console.log("📝 Generated Prompt Preview (first 2000 chars):");
console.log("──────────────────────────────────────────\n");
console.log(generatedPrompt.substring(0, 2000));
console.log("\n... [truncated]\n");
