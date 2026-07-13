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
    const startTime = Date.now();
    const promptContext = new PromptContext({ config });
    const prompt = QuestionPromptBuilder.buildInitialQuestionsPrompt(promptContext);
    
    PromptValidator.validateInitialContext(promptContext);
    
    const aiProvider = createAIProvider();
    
    let rawResponse;
    try {
      rawResponse = await aiProvider.generate(prompt);
    } catch (error) {
      this._logMetrics(Date.now() - startTime, 0, "Failure (AI Provider Error)");
      throw error;
    }
    
    try {
      const parsedJSON = QuestionResponseParser.parse(rawResponse);
      const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
      this._logMetrics(Date.now() - startTime, validatedQuestions.length, "Success");
      return validatedQuestions;
    } catch (error) {
      this._logMetrics(Date.now() - startTime, 0, `Failure (${error.name})`);
      throw error;
    }
  }

  /**
   * Generates the next adaptive question based on the history.
   * 
   * @param {import('../../prompts/PromptContext.js').PromptContext} promptContext 
   * @returns {Promise<Array<Object>>} Validated Question array (length 1).
   */
  async generateNextQuestion(promptContext) {
    const startTime = Date.now();
    const prompt = QuestionPromptBuilder.buildNextQuestionPrompt(promptContext);
    
    PromptValidator.validateAdaptiveContext(promptContext);
    
    const aiProvider = createAIProvider();
    
    let rawResponse;
    try {
      rawResponse = await aiProvider.generate(prompt);
    } catch (error) {
      this._logMetrics(Date.now() - startTime, 0, "Failure (AI Provider Error)");
      throw error;
    }
    
    try {
      const parsedJSON = QuestionResponseParser.parse(rawResponse);
      const validatedQuestions = QuestionResponseValidator.validate(parsedJSON);
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
