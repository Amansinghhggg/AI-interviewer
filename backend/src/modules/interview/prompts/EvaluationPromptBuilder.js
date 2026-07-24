const EVALUATION_PROMPT_VERSION = "v1";

/**
 * EvaluationPromptBuilder
 *
 * Generates a structured prompt string for full-interview AI evaluation.
 *
 * Input:  EvaluationContext  (clean, provider-agnostic data)
 * Output: Prompt string       (ready for any AI provider)
 *
 * No HTTP. No providers. No AI calls. Only prompt generation.
 */
export class EvaluationPromptBuilder {
  /**
   * Build the full-interview evaluation prompt.
   *
   * @param {import('./EvaluationContext.js').EvaluationContext} context
   * @returns {string} A structured prompt string.
   * @throws {Error} If required context fields are missing.
   */
  static buildEvaluationPrompt(context) {
    EvaluationPromptBuilder.#validateContext(context);

    const sections = [
      EvaluationPromptBuilder.#buildVersion(),
      EvaluationPromptBuilder.#buildSystemRole(),
      EvaluationPromptBuilder.#buildInterviewConfig(context.interviewConfig),
      EvaluationPromptBuilder.#buildInterviewSummary(context.interviewSummary),
      EvaluationPromptBuilder.#buildTranscript(context.transcript),
      EvaluationPromptBuilder.#buildEvaluationCriteria(),
      EvaluationPromptBuilder.#buildScoringGuide(),
      EvaluationPromptBuilder.#buildHiringRecommendation(),
      EvaluationPromptBuilder.#buildOutputFormat(context.transcript),
    ];

    return sections.join("\n\n");
  }

  // ── Private: Validation ──────────────────────────────────────────────

  /**
   * Fail fast if required context fields are missing.
   * @param {import('./EvaluationContext.js').EvaluationContext} context
   */
  static #validateContext(context) {
    if (!context) {
      throw new Error("EvaluationContext is required");
    }
    if (!context.interviewConfig) {
      throw new Error("EvaluationContext must contain interviewConfig");
    }
    if (!context.interviewConfig.jobRole) {
      throw new Error("interviewConfig.jobRole is required");
    }
    if (!context.interviewConfig.experienceLevel) {
      throw new Error("interviewConfig.experienceLevel is required");
    }
    if (!Array.isArray(context.interviewConfig.topics)) {
      throw new Error("interviewConfig.topics must be an array");
    }
    if (!context.interviewConfig.duration) {
      throw new Error("interviewConfig.duration is required");
    }
    if (!context.interviewSummary) {
      throw new Error("EvaluationContext must contain interviewSummary");
    }
    if (!Array.isArray(context.transcript)) {
      throw new Error("EvaluationContext must contain a transcript array");
    }
    if (context.transcript.length === 0) {
      throw new Error("Transcript must contain at least one Q&A exchange");
    }
  }

  // ── Private: Section Builders ────────────────────────────────────────

  static #buildVersion() {
    return `=== PROMPT VERSION: ${EVALUATION_PROMPT_VERSION} ===`;
  }

  static #buildSystemRole() {
    return [
      "=== SYSTEM ROLE ===",
      "You are an experienced Senior Technical Interviewer responsible for evaluating candidates fairly and objectively.",
      "You must evaluate the candidate's knowledge, reasoning, communication, and problem-solving ability based on the complete interview transcript below.",
      "Be strict but fair. Base every score and observation on concrete evidence from the transcript.",
      "",
      "=== PROFESSIONAL TONE & RULES ===",
      "- Evaluate ONLY demonstrated knowledge. Do not assume knowledge they did not explicitly state.",
      "- Calibrate your expectations based on the configured Experience Level.",
      "- Do NOT reward long answers over technically correct, concise answers. Precision matters.",
      "- Avoid vague phrases (e.g., 'Good understanding', 'Decent answer'). Provide concrete, evidence-backed observations tied to the interview concepts.",
    ].join("\n");
  }

  static #buildInterviewConfig(config) {
    const topicsList =
      config.topics.length > 0
        ? config.topics.join(", ")
        : "general topics relevant to the role";

    return [
      "=== INTERVIEW CONFIGURATION ===",
      `Job Role: ${config.jobRole}`,
      `Experience Level: ${config.experienceLevel}`,
      `Topics: ${topicsList}`,
      `Duration: ${config.duration} minutes`,
      `Total Questions: ${config.totalQuestions}`,
    ].join("\n");
  }

  static #buildInterviewSummary(summary) {
    const lines = [
      "=== INTERVIEW SUMMARY ===",
      `Answered Questions: ${summary.answeredQuestions}`,
      `Covered Topics: ${summary.coveredTopics.length > 0 ? summary.coveredTopics.join(", ") : "none"}`,
      `Remaining Topics: ${summary.remainingTopics.length > 0 ? summary.remainingTopics.join(", ") : "none"}`,
    ];

    if (summary.startedAt) {
      lines.push(`Interview Started At: ${new Date(summary.startedAt).toISOString()}`);
    }
    if (summary.endedAt) {
      lines.push(`Interview Ended At: ${new Date(summary.endedAt).toISOString()}`);
    }
    if (summary.totalDurationMinutes !== null && summary.totalDurationMinutes !== undefined) {
      lines.push(`Total Interview Duration: ${summary.totalDurationMinutes} minutes`);
    }

    return lines.join("\n");
  }

  static #buildTranscript(transcript) {
    const exchanges = transcript
      .map(
        (entry, i) =>
          [
            `--- Question ${i + 1} ---`,
            `Question ID: ${entry.questionId}`,
            `Topic: ${entry.topic}`,
            `Difficulty: ${entry.difficulty}`,
            `Q: ${entry.question}`,
            `A: ${entry.answer || "(No answer provided)"}`,
          ].join("\n")
      )
      .join("\n\n");

    return [
      "=== FULL INTERVIEW TRANSCRIPT ===",
      "Below is the complete, chronological record of every question and answer.",
      "Evaluate each exchange individually AND the overall performance holistically.",
      "",
      exchanges,
    ].join("\n");
  }

  static #buildEvaluationCriteria() {
    return [
      "=== EVALUATION CRITERIA ===",
      "Evaluate the candidate on the following five dimensions:",
      "",
      "1. Technical Knowledge — Accuracy, depth, and correctness of technical answers.",
      "2. Communication — Clarity, structure, and articulation of responses.",
      "3. Problem Solving — Analytical thinking, edge-case awareness, and reasoning approach.",
      "4. Confidence — Poise, conviction, and composure when answering.",
      "5. Topic Coverage — Breadth of knowledge across the required interview topics.",
      "",
      "DIFFICULTY-AWARE EVALUATION:",
      "Every question in the transcript contains a Difficulty tag. Use this as a qualitative baseline.",
      "A correct answer to a Hard question demonstrates stronger technical depth than a correct answer to an Easy question.",
    ].join("\n");
  }

  static #buildScoringGuide() {
    return [
      "=== SCORING GUIDE ===",
      "Use the following scale for ALL scores (overall, per-dimension, and per-question):",
      "",
      "9-10: Exceptional — Accurate explanations with practical examples, no mistakes.",
      "7-8:  Good — Solid understanding with only minor gaps or mistakes.",
      "5-6:  Basic — Demonstrates fundamental knowledge but has noticeable gaps.",
      "3-4:  Weak — Multiple misconceptions or inability to explain clearly.",
      "0-2:  Insufficient — Unable to demonstrate the required knowledge.",
      "",
      "Scores must be numeric values between 0 and 10 (decimals allowed, e.g. 7.5).",
    ].join("\n");
  }

  static #buildHiringRecommendation() {
    return [
      "=== HIRING RECOMMENDATION ===",
      "Based on the overall score, provide exactly ONE of the following recommendations following this EXACT mapping:",
      "",
      "Score 9-10  => STRONG_HIRE",
      "Score 8-8.9 => HIRE",
      "Score 6.5-7.9 => BORDERLINE",
      "Score 5-6.4 => NEEDS_IMPROVEMENT",
      "Score < 5   => REJECT",
      "",
      "The recommendation field MUST be exactly one of: STRONG_HIRE, HIRE, BORDERLINE, NEEDS_IMPROVEMENT, REJECT.",
      "Do NOT invent new recommendation values.",
    ].join("\n");
  }

  static #buildOutputFormat(transcript) {
    // Build the questionEvaluations example entries from the actual transcript
    // so the AI knows the exact questionIds to use.
    const questionExamples = transcript
      .map(
        (entry) =>
          `    {\n      "questionId": ${JSON.stringify(entry.questionId)},\n      "scores": {\n        "technical": 0,\n        "communication": 0\n      },\n      "feedback": "...",\n      "keyTakeaways": ["...", "..."]\n    }`
      )
      .join(",\n");

    return [
      "=== OUTPUT FORMAT ===",
      "Return ONLY valid JSON. No markdown. No explanations. No code blocks.",
      "Your entire response must be parseable by JSON.parse().",
      "",
      "The JSON MUST match this exact structure:",
      "",
      "{",
      '  "scores": {',
      '    "overall": 0,',
      '    "technical": 0,',
      '    "communication": 0,',
      '    "problemSolving": 0,',
      '    "confidence": 0,',
      '    "topicCoverage": 0',
      "  },",
      '  "recommendation": "HIRE",',
      '  "reasoning": "...",',
      '  "strengths": ["...", "..."],',
      '  "weaknesses": ["...", "..."],',
      '  "questionEvaluations": [',
      questionExamples,
      "  ]",
      "}",
      "",
      "RULES:",
      '- "scores" — All six scores are required. Use the 0-10 scale.',
      '- "recommendation" — Must be exactly one of: STRONG_HIRE, HIRE, BORDERLINE, NEEDS_IMPROVEMENT, REJECT.',
      '- "reasoning" — A concise paragraph explaining WHY this recommendation was given based on their performance.',
      '- "strengths" — Array of 2-5 broad, recruiter-friendly strengths observed in the interview.',
      '- "weaknesses" — Array of 2-5 broad, recruiter-friendly weaknesses observed in the interview.',
      '- "questionEvaluations" — One entry per question, in the same order as the transcript.',
      '  - "questionId" — Must match the Question ID from the transcript exactly.',
      '  - "scores.technical" — Technical accuracy score for this specific answer.',
      '  - "scores.communication" — Communication clarity score for this specific answer.',
      '  - "feedback" — 1-2 sentence feedback for this specific answer.',
      '  - "keyTakeaways" — Array of 2-4 concise bullet points summarizing the most important observations from the candidate\'s answer. These MUST be concept-level observations (e.g., "Correctly explained MongoDB indexes", "Missed React lifecycle phases") rather than generic praise.',
    ].join("\n");
  }
}
