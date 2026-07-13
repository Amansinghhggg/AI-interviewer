import { PromptValidator } from "./PromptValidator.js";

const EVALUATION_PROMPT_VERSION = "v1";

/**
 * EvaluationPromptBuilder
 *
 * Generates structured prompt strings for evaluating candidate answers.
 */
export class EvaluationPromptBuilder {
  /**
   * Build a prompt to evaluate a single answer.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildSingleAnswerPrompt(promptContext) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, history } = promptContext;
    const lastExchange = history.getLastExchange();

    if (!lastExchange) throw new Error("No previous exchange found for single answer evaluation");

    return [
      `=== PROMPT VERSION: ${EVALUATION_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are an expert technical evaluator assessing a candidate's interview answer.",
      "You must provide an objective, structured evaluation based on clear criteria.",
      "",
      "=== CONTEXT ===",
      `Role: ${config.jobRole}`,
      `Experience Level: ${config.experienceLevel}`,
      `Expected Difficulty: ${config.difficulty}`,
      `Language: ${config.language}`,
      "",
      "=== EVALUATION DATA ===",
      `Topic: ${lastExchange.topic}`,
      `Question Difficulty: ${lastExchange.difficulty}`,
      `Question: ${lastExchange.question}`,
      `Candidate's Answer: ${lastExchange.answer}`,
      "",
      "=== INSTRUCTIONS ===",
      "Evaluate the candidate's answer on the following criteria:",
      "",
      "1. **Technical Accuracy** (0-10): Is the answer factually correct and technically sound?",
      "2. **Depth of Knowledge** (0-10): Does the answer demonstrate deep understanding beyond surface-level knowledge?",
      "3. **Communication** (0-10): Is the answer clear, structured, and well-articulated?",
      "4. **Problem Solving** (0-10): Does the answer show analytical thinking and problem-solving ability?",
      "5. **Relevance** (0-10): Does the answer directly address the question asked?",
      "",
      "Also provide:",
      "- A list of strengths observed in the answer.",
      "- A list of weaknesses or gaps in the answer.",
      "- A brief recommendation on whether to probe deeper on this topic.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object:",
      "",
      "```json",
      "{",
      '  "technicalAccuracy": 8,',
      '  "depthOfKnowledge": 7,',
      '  "communication": 9,',
      '  "problemSolving": 6,',
      '  "relevance": 8,',
      '  "overallScore": 7.6,',
      '  "strengths": ["Clear explanation of core concepts", "Good use of examples"],',
      '  "weaknesses": ["Missed edge cases", "Did not discuss performance implications"],',
      '  "recommendation": "probe_deeper | move_on | increase_difficulty",',
      '  "reasoning": "Brief explanation of the evaluation"',
      "}",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON object. No additional text or explanations.",
    ].join("\n");
  }

  /**
   * Build a prompt to evaluate the entire interview at the end.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildOverallEvaluationPrompt(promptContext) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, history } = promptContext;

    const exchangeBlocks = history.exchanges.map((exchange, index) => [
      `--- Question ${index + 1} ---`,
      `Topic: ${exchange.topic}`,
      `Difficulty: ${exchange.difficulty}`,
      `Q: ${exchange.question}`,
      `A: ${exchange.answer}`,
    ].join("\n")).join("\n\n");

    return [
      `=== PROMPT VERSION: ${EVALUATION_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are a senior hiring evaluator reviewing a complete technical interview.",
      "You must provide a comprehensive, objective assessment of the candidate's overall performance.",
      "",
      "=== CONTEXT ===",
      `Role: ${config.jobRole}`,
      `Experience Level: ${config.experienceLevel}`,
      `Expected Difficulty: ${config.difficulty}`,
      `Interview Duration: ${config.duration} minutes`,
      `Language: ${config.language}`,
      `Total Questions: ${history.exchanges.length}`,
      "",
      "=== INTERVIEW TRANSCRIPT ===",
      exchangeBlocks,
      "",
      "=== INSTRUCTIONS ===",
      "Provide a holistic evaluation of the candidate across the entire interview.",
      "",
      "Evaluate on these dimensions:",
      "1. **Technical Accuracy** (0-10): Overall correctness across all answers.",
      "2. **Communication** (0-10): Clarity and structure of responses throughout.",
      "3. **Confidence** (0-10): How confidently did the candidate handle questions?",
      "4. **Problem Solving** (0-10): Analytical thinking demonstrated across answers.",
      "5. **Topic Coverage** (0-10): How well did the candidate cover the required topics?",
      "",
      "Also provide:",
      "- Top strengths observed across the interview.",
      "- Key weaknesses or areas for improvement.",
      "- A hiring recommendation with justification.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object:",
      "",
      "```json",
      "{",
      '  "technicalAccuracy": 8,',
      '  "communication": 7,',
      '  "confidence": 8,',
      '  "problemSolving": 7,',
      '  "topicCoverage": 9,',
      '  "overallScore": 7.8,',
      '  "strengths": ["Strong fundamentals", "Clear communication"],',
      '  "weaknesses": ["Limited system design knowledge", "Struggled with edge cases"],',
      '  "recommendation": "strong_hire | hire | lean_hire | lean_no_hire | no_hire",',
      '  "reasoning": "Detailed justification for the recommendation"',
      "}",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON object. No additional text or explanations.",
    ].join("\n");
  }
}
