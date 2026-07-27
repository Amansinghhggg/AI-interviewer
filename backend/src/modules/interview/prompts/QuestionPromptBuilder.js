import { PromptValidator } from "./PromptValidator.js";

const QUESTION_PROMPT_VERSION = "v3";

/**
 * QuestionPromptBuilder
 *
 * Generates structured prompt strings for AI-powered interview question generation.
 * Supports both initial batch generation and adaptive single-question generation.
 *
 * Design goals:
 *  - Works across ANY industry/role (engineering, sales, marketing, HR, finance, design, ops, etc.)
 *  - Calibrates question DEPTH AND STYLE to the candidate's real experience level,
 *    not just a difficulty label slapped on an otherwise identical question.
 *  - Produces questions that sound like a real human interviewer asked them out loud,
 *    not a static quiz bank.
 *  - Keeps scope locked to Topics / Job Role / Job Description skills — never the company name.
 *  - Employer custom instructions are a hard override on top of everything else.
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
      `=== SYSTEM ROLE ===`,
      `You are a senior human interviewer with 15+ years of experience hiring for this exact role.`,
      `You are conducting a real, structured interview — not writing a textbook quiz.`,
      `Every question must sound like something an experienced interviewer would naturally say out loud.`,
      ``,
      `=== EMPLOYER INFORMATION ===`,
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY — NEVER a source for questions)`,
      ``,
      `=== INTERVIEW INFORMATION ===`,
      `Job Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Difficulty (baseline): ${config.difficulty}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Duration: ${config.duration} minutes`,
      `Language: ${config.language}`,
      `Interview Type: ${config.interviewType}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY) ===\n${config.instructions}\n(These override every other rule below whenever there is a conflict.)` : "",
      ``,
      `=== SCOPE PRIORITY (resolve any conflict in this exact order) ===`,
      `0. Employer Custom Instructions — absolute override. Can add, ban, or narrow anything below.`,
      `1. Topics — the primary source of question content.`,
      `2. Job Role — shapes framing, terminology, and seniority expectations.`,
      `3. Technical/functional skills explicitly named in the Job Description.`,
      `4. Experience Level & Difficulty — governs depth and style, not subject matter.`,
      `5. Company Name — informational only, NEVER a source of question content.`,
      ``,
      `=== HARD SCOPE RULES ===`,
      `1. Never infer technologies, tools, or focus areas from the employer's business name or industry.`,
      `2. Generate questions ONLY from the configured Topics, Job Role, and skills found in the Job Description.`,
      `3. NEVER ask HR, company-culture, salary, or generic "tell me about yourself" questions unless a Topic explicitly calls for it.`,
      `4. Use the Job Description only to identify concrete skills/tools to probe — never as a source of company trivia.`,
      `5. Distribute questions evenly across ALL listed Topics before going deep on any single one.`,
      `6. Ask the question directly. No filler like "Great, let's move on" or "I'd like to ask you about...".`,
      ``,
      ...QuestionPromptBuilder.#buildExperienceCalibration(config),
      ...QuestionPromptBuilder.#buildRealisticPhrasingGuidance(),
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
      `=== OUTPUT FORMAT ===`,
      `Return a JSON array of question objects. Each object must have exactly the following structure (do NOT generate an id field):`,
      ``,
      `[`,
      `  {`,
      `    "question": "The full concise question text, phrased the way a real interviewer would say it out loud",`,
      `    "topic": "Must be copied EXACTLY (verbatim, same casing) from the Topics list above",`,
      `    "concept": "The specific granular concept tested within that topic (e.g. Virtual DOM, Closures) — never identical to the topic itself",`,
      `    "difficulty": "Easy | Medium | Hard",`,
      `    "type": "text",`,
      `    "expectedDuration": 120`,
      `  }`,
      `]`,
      ``,
      `Rules for the fields above:`,
      `- "topic" MUST be one of the exact strings from the Topics list — this is used programmatically to track coverage, so it cannot be paraphrased, abbreviated, or invented.`,
      `- "expectedDuration" is in seconds and should realistically reflect how long a thoughtful spoken answer takes: Easy ≈ 45-90s, Medium ≈ 90-150s, Hard ≈ 150-240s.`,
      `- Vary difficulty naturally across the set (e.g. a slightly easier warm-up question, then building around the baseline) instead of making every question identical — but never drift outside what's appropriate for the stated Experience Level.`,
      ``,
      `IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no \`\`\`json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().`,
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
      `=== SYSTEM ROLE ===`,
      `You are a senior human interviewer conducting a live, adaptive interview.`,
      `You must generate EXACTLY ONE next question, the way a real interviewer would decide what to ask next based on how the candidate has performed so far.`,
      ``,
      `=== EMPLOYER INFORMATION ===`,
      `Company Name: ${config.companyName || "Unknown"} (INFORMATIONAL ONLY — NEVER a source for questions)`,
      ``,
      `=== INTERVIEW CONTEXT ===`,
      `Role: ${config.jobRole}`,
      `Topics: ${topicsList}`,
      `Experience Level: ${config.experienceLevel}`,
      `Job Description: ${config.description || "None provided"}`,
      `Expected Baseline Difficulty: ${config.difficulty}`,
      `Language: ${config.language}`,
      `Remaining Time: ${state.remainingTime} minutes`,
      `Current Question Number: ${state.currentQuestion} out of ${state.maxQuestions}`,
      config.instructions ? `\n=== EMPLOYER CUSTOM INSTRUCTIONS (HIGHEST PRIORITY) ===\n${config.instructions}\n(These override every other rule below whenever there is a conflict.)` : "",
      ``,
      `=== PROGRESS & COVERAGE ===`,
      `Required Topics: ${topicsList}`,
      `Topic Distribution (Asked count): ${topicDistStr}`,
      `Topics Already Covered: ${coveredList}`,
      `Remaining Topics to Cover: ${remainingList}`,
      `Specific Concepts Already Covered: ${conceptsList}`,
      `Difficulty Progression So Far: ${difficultyHistoryStr}`,
      ``,
      `=== FULL CONVERSATION HISTORY ===`,
      `Review the past exchanges the way a real interviewer would — judge depth of understanding, not just correctness, and let it steer your next move.`,
      exchangeContext,
      ``,
      `=== SCOPE PRIORITY (resolve any conflict in this exact order) ===`,
      `0. Employer Custom Instructions — absolute override.`,
      `1. Topics | 2. Job Role | 3. Technical/functional skills from the Job Description | 4. Experience Level & Difficulty (depth only) | 5. Company Name (never a topic source).`,
      ``,
      `=== HARD SCOPE & ADAPTATION RULES ===`,
      `1. Never infer technologies or focus areas from the employer's business name.`,
      `2. NEVER ask HR, company-culture, salary, or generic questions unless a Topic explicitly calls for it.`,
      `3. NEVER repeat the exact same question.`,
      `4. NEVER ask about the exact same concept twice, UNLESS you are deliberately going deeper with a follow-up based on their previous answer.`,
      `5. If a concept was already answered well, move to a different concept or topic rather than re-testing it.`,
      `6. Balance topic coverage: prioritize topics with the lowest coverage before revisiting heavily-covered ones.`,
      `7. Adapt difficulty from the Expected Baseline (${config.difficulty}): move up when the candidate is clearly strong, ease off temporarily when they struggle. CRITICAL: You MUST set the 'difficulty' field in your JSON output to match the ACTUAL difficulty of the question you just generated (Easy, Medium, or Hard) rather than blindly echoing the baseline.`,
      `8. Keep it to ONE question, phrased the way a real interviewer would ask it in the moment — concise, natural, and directly relevant to the role.`,
      `9. CRITICAL: Depth must strictly match the Experience Level (${config.experienceLevel}). Do not default to a "safe" Medium question for a Fresher, and do not under-challenge a 5+ Years candidate.`,
      `10. If the candidate's last answer revealed a specific gap or a specific strength, let that — not just the topic list — decide what to ask next.`,
      ``,
      ...QuestionPromptBuilder.#buildExperienceCalibration(config),
      ...QuestionPromptBuilder.#buildRealisticPhrasingGuidance(),
      ...QuestionPromptBuilder.#buildVoiceConstraints(),
      `=== OUTPUT FORMAT ===`,
      `Return a single JSON object representing the next question (do NOT generate an id field):`,
      ``,
      `{`,
      `  "question": "The concise next question text, phrased the way a real interviewer would say it out loud",`,
      `  "topic": "Must be copied EXACTLY (verbatim, same casing) from the Topics list above",`,
      `  "concept": "The specific granular concept tested within that topic (e.g. Virtual DOM, Closures)",`,
      `  "difficulty": "Easy | Medium | Hard",`,
      `  "type": "text",`,
      `  "expectedDuration": 120,`,
      `  "reasoning": "One sentence on why this question, topic, and difficulty were chosen right now"`,
      `}`,
      ``,
      `Rules for the fields above:`,
      `- "topic" MUST be one of the exact strings from the Topics list.`,
      `- "expectedDuration" is in seconds: Easy ≈ 45-90s, Medium ≈ 90-150s, Hard ≈ 150-240s.`,
      ``,
      `IMPORTANT: Return ONLY valid, raw JSON. Do NOT wrap the JSON in markdown code blocks (e.g. no \`\`\`json). Do NOT provide any conversational text or explanations. Your entire response must be parseable by JSON.parse().`,
    ].join("\n");
  }

  /**
   * Experience-level calibration so difficulty isn't just a label — it changes
   * WHAT KIND of question gets asked, mirroring how real interviews scale.
   * Works for technical and non-technical roles alike.
   */
  static #buildExperienceCalibration(config) {
    const bands = {
      "Fresher": `Test fundamentals and conceptual clarity. Ask "what is X and why/when would you use it", simple applied scenarios from coursework, internships, or personal projects, and basic reasoning. Avoid large-scale architecture, org-wide trade-offs, or leadership questions.`,
      "1-2 Years": `Test applied, hands-on understanding from real project work. Ask how they've actually used a concept, common pitfalls they've hit, how they chose between two straightforward approaches, and how they debugged or fixed something real. Keep trade-off discussion at the feature/module level, not system-wide.`,
      "3-5 Years": `Test judgment and trade-offs. Ask them to justify design/approach decisions, discuss performance, scalability, and maintainability concerns, how they've reviewed or mentored others' work, and how they've handled ambiguous or conflicting requirements.`,
      "5+ Years": `Test strategic and system-level thinking. Ask about architecture at scale, trade-offs across teams or services, build-vs-buy calls, leading through ambiguity or incidents, and how they've driven best practices or influenced technical direction org-wide.`,
    };

    const currentBand = bands[config.experienceLevel] || bands["1-2 Years"];

    return [
      `=== EXPERIENCE-LEVEL CALIBRATION (this changes WHAT you ask, not just how hard it sounds) ===`,
      `Reference — how depth generally progresses across levels:`,
      `- Fresher: ${bands["Fresher"]}`,
      `- 1-2 Years: ${bands["1-2 Years"]}`,
      `- 3-5 Years: ${bands["3-5 Years"]}`,
      `- 5+ Years: ${bands["5+ Years"]}`,
      ``,
      `THIS candidate is at: ${config.experienceLevel}. Calibrate every question to that band specifically: ${currentBand}`,
      `CRITICAL RULE: If the Experience Level is "Fresher" or Expected Baseline Difficulty is "Easy", every generated question MUST have a difficulty of "Easy". Do not drift to Medium.`,
      `If the role is non-technical (e.g. Sales, Marketing, HR, Finance, Operations, Design, Product, Support), apply the same progression using domain-appropriate equivalents — e.g. a Fresher gets "what is a sales funnel and why does it matter", a 5+ Years candidate gets "how would you restructure a sales funnel that's leaking mid-pipeline, and how would you get buy-in from other teams".`,
      ``,
    ];
  }

  /**
   * Guidance so questions sound like a real interviewer asked them,
   * not a static quiz bank ("Explain X" repeated ten times in a row).
   */
  static #buildRealisticPhrasingGuidance() {
    return [
      `=== SOUND LIKE A REAL INTERVIEWER ===`,
      `Vary phrasing across questions — do not start every question with "Explain". Draw from natural interviewer patterns such as:`,
      `- "Walk me through how you'd approach..."`,
      `- "Tell me about a time you had to..."`,
      `- "How would you decide between X and Y on a real project?"`,
      `- "What would you do if [realistic scenario]?"`,
      `- "In your experience, what's the trade-off between..."`,
      `- "Suppose [realistic situation] — how would you handle it?"`,
      `- "What's your take on..." / "Why would you choose... over...?"`,
      `Ground questions in realistic, on-the-job scenarios wherever possible instead of abstract definitions, especially above Fresher level.`,
      ``,
      `=== COMMON & STANDARD QUESTIONS ===`,
      `Prefer common, widely-recognized industry-standard interview questions over obscure, highly theoretical, or overly complex edge-cases. The goal is to accurately assess standard competency, not to trick the candidate.`,
      ``,
    ];
  }

  /**
   * Voice-only constraints: nothing that requires typing, writing, drawing,
   * or producing an artifact — regardless of industry. Examples adapt to
   * whether the role is technical or not, but the underlying rule is universal.
   */
  static #buildVoiceConstraints() {
    return [
      `=== VOICE-ONLY INTERVIEW CONSTRAINTS (CRITICAL) ===`,
      `This interview is conducted entirely through voice. The candidate:`,
      `- Cannot type, write, draw, or use any editor, whiteboard, spreadsheet, or design tool.`,
      `- Cannot execute programs or produce any written artifact.`,
      `- Must answer only by speaking.`,
      ``,
      `Every generated question MUST be answerable verbally, by explanation or discussion — never by producing an artifact.`,
      ``,
      `--- If the role is technical/engineering (e.g. software, data, QA, DevOps) ---`,
      `NEVER ask the candidate to write or produce code. This includes any question implying: write, code, implement, build the function, write SQL, write a query, write HTML/CSS, syntax, coding exercise, live coding, whiteboard, pseudocode, algorithm implementation, code snippet.`,
      `Instead, ask them to explain the approach, structure, trade-offs, or reasoning verbally.`,
      `  ✗ Write a React functional component for a User Profile.`,
      `  ✓ Walk me through how you'd structure a reusable UserProfile component — what props, state, and hooks would you use, and why?`,
      `  ✗ Write a SQL query to find duplicate emails.`,
      `  ✓ Explain the approaches you'd use to identify duplicate email records in a relational database, and the performance trade-offs between them.`,
      ``,
      `--- If the role is non-technical (e.g. Sales, Marketing, HR, Finance, Operations, Design, Product, Support) ---`,
      `NEVER ask the candidate to draft or produce a deliverable (an email, a proposal, a mockup, a spreadsheet formula, ad copy, a campaign brief, etc.).`,
      `Instead, ask them to explain their approach, reasoning, or walk through a real past experience verbally.`,
      `  ✗ Write a cold outreach email to a prospect.`,
      `  ✓ Walk me through how you'd approach a cold outreach message to a prospect who's gone quiet — what would you say and why?`,
      ``,
      `If a question you're about to generate would require the candidate to type, write, or draw anything, discard it and rephrase it as a verbal reasoning or experience-based question instead.`,
      ``,
    ];
  }
}