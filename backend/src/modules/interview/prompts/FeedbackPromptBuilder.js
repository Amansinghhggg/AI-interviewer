import { PromptValidator } from "./PromptValidator.js";

const FEEDBACK_PROMPT_VERSION = "v1";

/**
 * FeedbackPromptBuilder
 *
 * Generates structured prompt strings for producing candidate-facing feedback.
 */
export class FeedbackPromptBuilder {
  /**
   * Build a prompt to generate comprehensive candidate feedback.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @param {Object} [evaluationResult=null] - Optional evaluation scores to incorporate.
   * @returns {string} A structured prompt string.
   */
  static buildCandidateFeedbackPrompt(promptContext, evaluationResult = null) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, history } = promptContext;

    const exchangeBlocks = history.exchanges.map((exchange, index) => [
      `--- Question ${index + 1} ---`,
      `Topic: ${exchange.topic}`,
      `Difficulty: ${exchange.difficulty}`,
      `Q: ${exchange.question}`,
      `A: ${exchange.answer}`,
    ].join("\n")).join("\n\n");

    const evaluationSection = evaluationResult
      ? [
          "",
          "=== EVALUATION SCORES (for reference, do NOT expose raw scores to candidate) ===",
          `Overall Score: ${evaluationResult.overallScore}/10`,
          `Technical Accuracy: ${evaluationResult.technicalAccuracy}/10`,
          `Communication: ${evaluationResult.communication}/10`,
          "",
        ].join("\n")
      : "";

    return [
      `=== PROMPT VERSION: ${FEEDBACK_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are a supportive career mentor providing constructive feedback to a candidate after a technical interview.",
      "Your tone should be encouraging, specific, and actionable. Avoid harsh criticism.",
      "Focus on helping the candidate grow and improve.",
      "",
      "=== CONTEXT ===",
      `Role Applied For: ${config.jobRole}`,
      `Experience Level: ${config.experienceLevel}`,
      `Interview Difficulty: ${config.difficulty}`,
      `Topics Covered: ${config.topics.length > 0 ? config.topics.join(", ") : "various"}`,
      `Language: ${config.language}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS ===\n${config.instructions}\n(Take these instructions into account when evaluating the candidate)` : "",
      "",
      "=== INTERVIEW TRANSCRIPT ===",
      exchangeBlocks,
      evaluationSection,
      "=== INSTRUCTIONS ===",
      "Generate personalized, constructive feedback for the candidate.",
      "",
      "1. **Strengths**: Identify 2-4 specific things the candidate did well, citing actual answers.",
      "2. **Areas for Improvement**: Identify 2-4 specific areas where the candidate can improve, with concrete examples from their answers.",
      "3. **Suggestions**: Provide 3-5 actionable suggestions the candidate can follow to improve.",
      "4. **Learning Resources**: Recommend 3-5 specific resources (books, courses, documentation, practice platforms) relevant to the topics where the candidate struggled.",
      "",
      "Be specific — reference their actual answers, not generic advice.",
      "Be encouraging — frame weaknesses as growth opportunities.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object:",
      "",
      "```json",
      "{",
      '  "summary": "A 2-3 sentence overview of the candidate\'s performance",',
      '  "strengths": [',
      '    {',
      '      "title": "Strong React Fundamentals",',
      '      "detail": "Your explanation of the Virtual DOM showed deep understanding..."',
      "    }",
      "  ],",
      '  "areasForImprovement": [',
      "    {",
      '      "title": "System Design Depth",',
      '      "detail": "When asked about rate limiters, the answer could have included..."',
      "    }",
      "  ],",
      '  "suggestions": [',
      '    "Practice system design problems on platforms like Excalidraw or SystemDesignPrimer",',
      '    "Review common JavaScript patterns like the Module pattern and Observer pattern"',
      "  ],",
      '  "learningResources": [',
      "    {",
      '      "title": "JavaScript: The Good Parts",',
      '      "type": "book",',
      '      "url": "https://example.com",',
      '      "relevance": "Covers closures and prototypal inheritance in depth"',
      "    }",
      "  ]",
      "}",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON object. No additional text or explanations.",
    ].join("\n");
  }

  /**
   * Build a prompt to generate a quick, topic-specific tip after a single answer.
   *
   * @param {import('./PromptContext.js').PromptContext} promptContext
   * @returns {string} A structured prompt string.
   */
  static buildQuickTipPrompt(promptContext) {
    PromptValidator.validateAdaptiveContext(promptContext);
    const { config, history } = promptContext;
    const lastExchange = history.getLastExchange();

    if (!lastExchange) throw new Error("No previous exchange found for quick tip");

    return [
      `=== PROMPT VERSION: ${FEEDBACK_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are a concise interview coach giving a quick tip after a candidate's answer.",
      "Keep your feedback brief, specific, and immediately actionable.",
      "",
      "=== CONTEXT ===",
      `Role: ${config.jobRole}`,
      `Topic: ${lastExchange.topic}`,
      `Language: ${config.language}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS ===\n${config.instructions}\n(Take these instructions into account when evaluating the candidate)` : "",
      "",
      "=== EXCHANGE ===",
      `Question: ${lastExchange.question}`,
      `Answer: ${lastExchange.answer}`,
      "",
      "=== INSTRUCTIONS ===",
      "Provide a single, concise tip (1-3 sentences) that would immediately improve this answer.",
      "If the answer was excellent, acknowledge it and suggest one advanced angle to explore.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object:",
      "",
      "```json",
      "{",
      '  "tip": "Your concise tip here",',
      '  "strength": "One thing they did well",',
      '  "improvement": "One specific thing to improve"',
      "}",
      "```",
      "",
      "IMPORTANT: Return ONLY the JSON object. No additional text.",
    ].join("\n");
  }
}
