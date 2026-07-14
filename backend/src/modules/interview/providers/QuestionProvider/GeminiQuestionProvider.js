import { BaseQuestionProvider } from "./BaseQuestionProvider.js";
import { PromptContext } from "../../prompts/PromptContext.js";
import { QuestionPromptBuilder } from "../../prompts/QuestionPromptBuilder.js";
import { PromptValidator } from "../../prompts/PromptValidator.js";
import { createAIProvider } from "../AIProvider/index.js";
import { QuestionResponseParser } from "../../parsers/QuestionResponseParser.js";
import { QuestionResponseValidator } from "../../validators/QuestionResponseValidator.js";

/**
 * GeminiQuestionProvider
 * 
 * Orchestrates the complete pipeline for generating interview questions
 * using the Gemini AI provider.
 * 
 * Pipeline:
 * config -> PromptContext -> Builder -> Validator -> AIProvider -> Parser -> Validator -> Question[]
 */
export class GeminiQuestionProvider extends BaseQuestionProvider {
  
  /**
   * Generates the first question for an AI interview.
   * 
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateFirstQuestion(config) {
    console.log("\nInterviewEngine\n→ GeminiQuestionProvider\n");
    const startTime = Date.now();
    const promptContext = new PromptContext({ config });
    
    // Phase 6 Debug Logging
    console.log("=== PROMPT CONTEXT (DEBUG) ===");
    console.log(JSON.stringify({
      companyName: config.companyName,
      jobRole: config.jobRole,
      topics: config.topics,
      description: config.description,
      experienceLevel: config.experienceLevel
    }, null, 2));
    
    const prompt = QuestionPromptBuilder.buildInitialQuestionsPrompt(promptContext);
    
    PromptValidator.validateInitialContext(promptContext);
    console.log("GeminiQuestionProvider\n→ Prompt Generated\n");
    
    const aiProvider = createAIProvider();
    
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`GeminiProvider\n→ Sending Request (Attempt ${attempt})\n`);
        const rawResponse = await aiProvider.generate(prompt);
        console.log("GeminiProvider\n→ Response Received\n");
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        console.log("QuestionResponseParser\n→ Parsed Successfully\n");
        
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        console.log("QuestionResponseValidator\n→ Validation Passed\n");
        
        // Domain Validation
        this._validateDomain(validatedQuestions);
        console.log("DomainValidator\n→ Domain Validation Passed\n");
        
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[Attempt ${attempt} Failed]: ${error.message}`);
        if (attempt === MAX_RETRIES) {
          this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`, aiProvider ? aiProvider.constructor.name : "Unknown");
          throw error;
        }
      }
    }
  }

  /**
   * Generates the next adaptive question based on the history.
   * 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateNextQuestion(promptContext) {
    console.log("\nInterviewEngine\n→ GeminiQuestionProvider\n");
    const startTime = Date.now();
    
    // Phase 6 Debug Logging
    console.log("=== PROMPT CONTEXT (DEBUG) ===");
    console.log(JSON.stringify({
      companyName: promptContext.config.companyName,
      jobRole: promptContext.config.jobRole,
      topics: promptContext.config.topics,
      description: promptContext.config.description,
      experienceLevel: promptContext.config.experienceLevel
    }, null, 2));

    const prompt = QuestionPromptBuilder.buildNextQuestionPrompt(promptContext);
    
    PromptValidator.validateAdaptiveContext(promptContext);
    console.log("GeminiQuestionProvider\n→ Prompt Generated\n");
    
    const aiProvider = createAIProvider();
    
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`GeminiProvider\n→ Sending Request (Attempt ${attempt})\n`);
        const rawResponse = await aiProvider.generate(prompt);
        console.log("GeminiProvider\n→ Response Received\n");
        
        const parsedJSON = QuestionResponseParser.parse(rawResponse);
        console.log("QuestionResponseParser\n→ Parsed Successfully\n");
        
        const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
        console.log("QuestionResponseValidator\n→ Validation Passed\n");
        
        // Domain Validation
        this._validateDomain(validatedQuestions);
        console.log("DomainValidator\n→ Domain Validation Passed\n");
        
        this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success", aiProvider.constructor.name);
        return validatedQuestions;
      } catch (error) {
        console.warn(`[Attempt ${attempt} Failed]: ${error.message}`);
        if (attempt === MAX_RETRIES) {
          this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`, aiProvider ? aiProvider.constructor.name : "Unknown");
          throw error;
        }
      }
    }
  }

  /**
   * Validates that the generated questions do not belong to prohibited domains.
   */
  _validateDomain(questions) {
    const forbiddenKeywords = ["consultancy", "it solution", "hr department", "sales strategy", "business strategy", "marketing strategy"];
    
    for (const q of questions) {
      const text = q.question.toLowerCase();
      for (const keyword of forbiddenKeywords) {
        if (text.includes(keyword)) {
          throw new Error(`Domain Validation Failed: Question contains prohibited keyword '${keyword}'`);
        }
      }
    }
  }

  /**
   * Logs performance and status metrics safely for debugging.
   */
  _logMetrics(durationMs, questionCount, status, providerName) {
    const generationMetadata = {
      provider: providerName,
      model: "gemini", // Hardcoded for this specific provider
      generatedAt: new Date().toISOString(),
      latencyMs: durationMs,
      status: status
    };
    console.log(`[Metrics] Provider: GeminiQuestionProvider | Questions Generated: ${questionCount}`);
    console.log(`[Generation Metadata] ${JSON.stringify(generationMetadata, null, 2)}`);
  }
}
