import { PromptValidator } from "./PromptValidator.js";

const QUESTION_PROMPT_VERSION = "v2";

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
      "=== EMPLOYER INFORMATION ===",
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY - DO NOT USE FOR QUESTIONS)`,
      "",
      "=== INTERVIEW INFORMATION ===",
      `Job Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Difficulty: ${config.difficulty}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Duration: ${config.duration} minutes`,
      `Language: ${config.language}`,
      `Interview Type: ${config.interviewType}`,
      "",
      "=== PRIORITY & STRICT RULES ===",
      "Generate questions using this exact priority:",
      "Priority 1 (Highest): Topics",
      "Priority 2: Job Role",
      "Priority 3: Technical skills from Job Description",
      "Priority 4: Experience Level",
      "Priority 5 (Lowest): Company Name (NEVER override the role or topics)",
      "",
      "1. You MUST ignore the company name. Never infer technologies from the employer's business name.",
      "2. Generate questions ONLY from the configured job role and technologies.",
      "3. NEVER generate HR, management, consulting, sales, marketing, business, or company-related questions unless explicitly requested in the Topics.",
      "4. The job description should ONLY be used to extract required technical skills.",
      "5. Distribute questions evenly across ALL available topics.",
      "6. Avoid unnecessary conversational text or explanations. Ask the question directly.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a JSON array of question objects. Each object must have exactly the following structure (do NOT generate an id field):",
      "",
      "[",
      "  {",
      '    "question": "The full concise question text",',
      '    "topic": "The exact topic this question covers",',
      '    "concept": "The core specific concept tested (e.g. Virtual DOM, Closures)",',
      '    "difficulty": "Easy | Medium | Hard",',
      '    "type": "text",',
      '    "expectedDuration": 120',
      "  }",
      "]",
      "",
      "IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no ```json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().",
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
      
    const remainingList = state.remainingTopics.length > 0
      ? state.remainingTopics.join(", ")
      : "none";
      
    const conceptsList = state.coveredConcepts.length > 0
      ? state.coveredConcepts.join(", ")
      : "none yet";
      
    const difficultyHistoryStr = state.difficultyHistory.length > 0
      ? state.difficultyHistory.join(" -> ")
      : "None";
      
    const topicDistStr = Object.entries(state.topicDistribution || {})
      .map(([t, count]) => `${t}: ${count}`)
      .join(", ");

    let exchangeContext = "No previous exchanges.";
    if (history.exchanges && history.exchanges.length > 0) {
      exchangeContext = history.exchanges.map((ex, i) => 
        `Q${i + 1} (${ex.difficulty || "Unknown"} | ${ex.topic || "Unknown"} | Concept: ${ex.concept || "Unknown"}): ${ex.question}\nAnswer: ${ex.answer || "(No answer provided)"}`
      ).join("\n\n");
    }

    return [
      `=== PROMPT VERSION: ${QUESTION_PROMPT_VERSION} ===`,
      "=== SYSTEM ROLE ===",
      "You are an expert technical interviewer conducting an adaptive interview.",
      "You must generate EXACTLY ONE next question based on the candidate's previous responses and interview progress.",
      "",
      "=== EMPLOYER INFORMATION ===",
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY - DO NOT USE FOR QUESTIONS)`,
      "",
      "=== INTERVIEW CONTEXT ===",
      `Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Expected Baseline Difficulty: ${config.difficulty}`,
      `Language: ${config.language}`,
      `Remaining Time: ${state.remainingTime} minutes`,
      `Current Question Number: ${state.currentQuestion} out of ${state.maxQuestions}`,
      "",
      "=== PROGRESS & COVERAGE ===",
      `Required Topics: ${topicsList}`,
      `Topic Distribution (Asked count): ${topicDistStr}`,
      `Topics Already Covered: ${coveredList}`,
      `Remaining Topics to Cover: ${remainingList}`,
      `Specific Concepts Already Covered: ${conceptsList}`,
      `Difficulty Progression So Far: ${difficultyHistoryStr}`,
      "",
      "=== FULL CONVERSATION HISTORY ===",
      "Review the past exchanges to understand the candidate's proficiency and adapt accordingly.",
      exchangeContext,
      "",
      "=== STRICT DOMAIN RULES ===",
      "Generate questions using this exact priority:",
      "Priority 1: Topics | Priority 2: Job Role | Priority 3: Technical skills from Job Description",
      "",
      "1. You MUST ignore the company name. Never infer technologies from the employer's business name.",
      "2. NEVER generate HR, management, consulting, sales, marketing, business, or company-related questions.",
      "3. NEVER repeat the exact same question.",
      "4. NEVER ask about the exact same concept twice, UNLESS you are intentionally asking a significantly deeper follow-up question based on their previous answer.",
      "5. If a concept has already been mastered, move to another topic.",
      "6. Balance the topics: Prioritize topics with the lowest coverage before revisiting heavily covered topics.",
      "7. Progress naturally: Increase difficulty when the candidate performs well, but reduce it temporarily if they struggle. Avoid random jumps.",
      "8. Keep the question concise, highly relevant to the job role, and professional. Avoid unnecessary explanations.",
      "9. Ask exactly ONE question.",
      "",
      "=== OUTPUT FORMAT ===",
      "Return a single JSON object representing the next question (do NOT generate an id field):",
      "",
      "{",
      '  "question": "The concise next question text",',
      '  "topic": "The topic this question covers",',
      '  "concept": "The core specific concept tested (e.g. Virtual DOM, Closures)",',
      '  "difficulty": "Easy | Medium | Hard",',
      '  "type": "text",',
      '  "expectedDuration": 120,',
      '  "reasoning": "Brief explanation of why this question and difficulty were chosen"',
      "}",
      "",
      "IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no ```json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().",
    ].join("\n");
  }
}
