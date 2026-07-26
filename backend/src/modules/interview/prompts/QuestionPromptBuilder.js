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
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS ===\n${config.instructions}\n(You MUST adhere to these custom instructions provided by the employer)` : "",
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
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
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
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS ===\n${config.instructions}\n(You MUST adhere to these custom instructions provided by the employer)` : "",
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
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
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

  static #buildVoiceConstraints() {
    return [
      "=== VOICE-ONLY INTERVIEW CONSTRAINTS (CRITICAL) ===",
      "This interview is conducted entirely through voice.",
      "The candidate:",
      "- Cannot type.",
      "- Cannot write code.",
      "- Cannot draw diagrams.",
      "- Cannot use a whiteboard.",
      "- Cannot use an IDE or code editor.",
      "- Cannot execute programs.",
      "- Must answer only by speaking.",
      "",
      "Every generated question MUST be answerable verbally.",
      "",
      "--- Allowed Question Types ---",
      "Generate only questions that evaluate understanding through spoken explanations, including:",
      "- Explaining concepts",
      "- Comparing technologies",
      "- Architecture discussions",
      "- System design (high level)",
      "- Debugging approaches",
      "- Performance optimization strategies",
      "- Trade-off discussions",
      "- Real-world scenarios",
      "- Behavioral questions",
      "- Experience-based questions",
      "- Best practices",
      "- Design decisions",
      "- Problem-solving approaches",
      "- API design discussions",
      "- Database design reasoning",
      "- Security considerations",
      "- Scalability discussions",
      "",
      "Examples of VALID questions:",
      "✓ Explain how React's Virtual DOM works.",
      "✓ Compare SQL and MongoDB. When would you choose each?",
      "✓ How would you optimize a slow Express API?",
      "✓ Explain how JWT authentication works.",
      "✓ How would you design a notification service?",
      "✓ Walk me through your approach to building an e-commerce backend.",
      "✓ Explain the difference between Redis and RabbitMQ.",
      "✓ Suppose an API suddenly becomes very slow. How would you investigate it?",
      "",
      "--- Forbidden Question Types ---",
      "NEVER generate questions requiring the candidate to write or produce code.",
      "This includes any question containing or implying words such as: write, code, implement, create a component, build the function, write SQL, write a query, complete the code, fill in the code, write HTML, write CSS, syntax, coding exercise, live coding, whiteboard, pseudocode, algorithm implementation, code snippet, function implementation.",
      "",
      "Examples of INVALID questions:",
      "✗ Write a React functional component for a User Profile.",
      "✗ Implement merge sort.",
      "✗ Write an Express middleware.",
      "✗ Create a MongoDB schema.",
      "✗ Write a SQL query to fetch duplicate users.",
      "✗ Implement JWT authentication.",
      "✗ Write the code for a debounce function.",
      "",
      "--- If a coding question is about to be generated ---",
      "Transform it into a verbal reasoning question.",
      "Instead of: ❌ Write a React UserProfile component.",
      "Generate: ✅ Explain how you would structure a reusable UserProfile component. What props, state, and hooks would you use, and why?",
      "Instead of: ❌ Write an Express authentication middleware.",
      "Generate: ✅ Explain how an Express authentication middleware works. Describe the request lifecycle and the checks you would perform.",
      "Instead of: ❌ Write a SQL query to find duplicate emails.",
      "Generate: ✅ Explain different approaches you could use to identify duplicate email records in a relational database and discuss their performance implications.",
      "",
      "This constraint is mandatory. If a generated question requires typing, writing code, syntax, or pseudocode, discard it and generate a different voice-compatible question instead.",
      "",
    ];
  }
}
