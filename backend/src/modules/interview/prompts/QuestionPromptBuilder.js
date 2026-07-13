import { PromptValidator } from "./PromptValidator.js";

const QUESTION_PROMPT_VERSION = "v1";

/**
 * QuestionPromptBuilder
 *
 * Generates structured prompt strings for AI-powered question generation.
 * Supports both initial batch generation and adaptive single-question generation.
 */
export class QuestionPromptBuilder {
  /**
   * Build a prompt to generate the initial batch of interview questions.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildInitialQuestionsPrompt(promptContext) {
    PromptValidator.validateInitialContext(promptContext);
    const { config } = promptContext;

    const topicsList = config.topics.length > 0
      ? config.topics.join(", ")
      : "general topics relevant to the role";

    return [
      `=== PROMPT VERSION: ${QUESTION_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are an expert technical interviewer conducting a structured interview.",
      "You must generate interview questions that are clear, professional, and appropriately challenging.",
      "",
      "=== CONTEXT ===",
      `You are interviewing a candidate for the role of ${config.jobRole}.`,
      `The candidate has ${config.experienceLevel} of experience.`,
      `The interview duration is ${config.duration} minutes.`,
      `The interview language is ${config.language}.`,
      "",
      "=== INTERVIEW CONFIGURATION ===",
      `Job Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Difficulty: ${config.difficulty}`,
      `Experience Level: ${config.experienceLevel}`,
      `Duration: ${config.duration} minutes`,
      `Language: ${config.language}`,
      `Interview Type: ${config.interviewType}`,
      "",
      "=== INSTRUCTIONS ===",
      "1. Generate questions that cover the specified topics.",
      "2. Ensure the difficulty matches the specified level.",
      "3. Tailor the complexity to the candidate's experience level.",
      "4. Distribute questions across the available topics evenly.",
      "5. Each question should be answerable within the interview duration.",
      "6. Start with easier questions and gradually increase difficulty.",
      "7. Include a mix of conceptual and practical questions.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a JSON array of question objects. Each object must have:",
      "",
      "```json",
      "[",
      "  {",
      '    "question": "The full question text",',
      '    "topic": "The topic this question covers",',
      '    "difficulty": "Easy | Medium | Hard",',
      '    "type": "text",',
      '    "expectedDuration": 120',
      "  }",
      "]",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON array. No additional text, explanations, or markdown outside the JSON.",
    ].join("\n");
  }

  /**
   * Build a prompt to generate the single next question adaptively based on context.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildNextQuestionPrompt(promptContext) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, state, history } = promptContext;

    const topicsList = config.topics.length > 0
      ? config.topics.join(", ")
      : "general topics relevant to the role";

    const coveredList = state.coveredTopics.length > 0
      ? state.coveredTopics.join(", ")
      : "none yet";

    const lastExchange = history.getLastExchange();
    const exchangeContext = lastExchange 
      ? `\n=== PREVIOUS EXCHANGE ===\nQuestion: ${lastExchange.question}\nCandidate's Answer: ${lastExchange.answer}\n`
      : "";

    return [
      `=== PROMPT VERSION: ${QUESTION_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are an expert technical interviewer conducting an adaptive interview.",
      "You must generate ONE next question based on the candidate's previous response and interview progress.",
      "",
      "=== CONTEXT ===",
      `Role: ${config.jobRole}`,
      `Experience Level: ${config.experienceLevel}`,
      `Expected Difficulty: ${config.difficulty}`,
      `Language: ${config.language}`,
      `Remaining Time: ${state.remainingTime} minutes`,
      exchangeContext,
      "=== PROGRESS & COVERAGE ===",
      `Required Topics: ${topicsList}`,
      `Already Covered: ${coveredList}`,
      `Current Question Number: ${state.currentQuestion}`,
      "",
      "=== INSTRUCTIONS ===",
      "1. Analyze the candidate's previous answer (if any) for depth and accuracy.",
      "2. If the answer was shallow or incorrect, ask a probing question on the same topic.",
      "3. If the answer was strong, move to an uncovered topic or appropriately adjust difficulty.",
      "4. Prioritize topics that have not been covered yet.",
      "5. Consider the remaining time — avoid overly broad questions if time is short.",
      "6. Maintain the specified difficulty level overall.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object representing the next question:",
      "",
      "```json",
      "{",
      '  "question": "The next question text",',
      '  "topic": "The topic this question covers",',
      '  "difficulty": "Easy | Medium | Hard",',
      '  "type": "text",',
      '  "expectedDuration": 120,',
      '  "reasoning": "Brief explanation of why this question was chosen"',
      "}",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON object. No additional text or explanations.",
    ].join("\n");
  }
}
