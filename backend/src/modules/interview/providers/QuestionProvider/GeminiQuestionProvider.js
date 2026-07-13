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
   * Generates a batch of interview questions using AI.
   * 
   * @param {import('../../services/InterviewConfig.js').InterviewConfig} config 
   * @returns {Promise<Array<Object>>} Validated Question objects.
   */
  async getQuestions(config) {
    const startTime = Date.now();
    
    // 1. Build context
    const promptContext = new PromptContext({ config });
    
    // 2. Generate prompt
    const prompt = QuestionPromptBuilder.buildInitialQuestionsPrompt(promptContext);
    
    // 3. Validate prompt config (handled implicitly in builder now, but we can be explicit or rely on it)
    PromptValidator.validateInitialContext(promptContext);
    
    // 4. Get the AI Provider dynamically based on ai.config.js
    const aiProvider = createAIProvider();
    
    let rawResponse;
    try {
      // 5. Generate raw AI response
      rawResponse = await aiProvider.generate(prompt);
    } catch (error) {
      this._logMetrics(Date.now() - startTime, 0, "Failure (AI Provider Error)");
      throw error;
    }
    
    try {
      // 6. Parse response
      const parsedJSON = QuestionResponseParser.parse(rawResponse);
      
      // 7. Validate response schema
      const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
      
      // 8. Log success and return
      this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success");
      return validatedQuestions;
      
    } catch (error) {
      this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`);
      throw error;
    }
  }

  /**
   * Logs performance and status metrics safely.
   */
  _logMetrics(durationMs, questionCount, status) {
    console.log(`[Metrics] Provider: GeminiQuestionProvider | Duration: ${durationMs}ms | Questions Generated: ${questionCount} | Status: ${status}`);
  }
}
