import { BaseEvaluationProvider } from "./BaseEvaluationProvider.js";
import { EvaluationPromptBuilder } from "../../prompts/EvaluationPromptBuilder.js";
import { EvaluationResponseParser } from "../../parsers/EvaluationResponseParser.js";
import { EvaluationResponseValidator } from "../../validators/EvaluationResponseValidator.js";
import { createAIProvider } from "../AIProvider/index.js";
import { AIConfig } from "../AIProvider/config/ai.config.js";

/**
 * GroqEvaluationProvider
 *
 * Orchestrates the complete evaluation pipeline using the Groq AI provider.
 *
 * Pipeline:
 * EvaluationContext → PromptBuilder → AIProvider → Parser → Validator → Validated Object
 *
 * This class contains NO business logic. It only wires together existing
 * components and delegates to each one in sequence.
 */
export class GroqEvaluationProvider extends BaseEvaluationProvider {
  /**
   * Evaluate a candidate's interview performance.
   *
   * @param {import('../../prompts/EvaluationContext.js').EvaluationContext} context
   * @returns {Promise<Object>} A validated evaluation object matching InterviewResult schema.
   * @throws {ParsingError} If the AI response cannot be parsed as JSON.
   * @throws {ValidationError} If the parsed response doesn't match the schema.
   * @throws {Error} If the AI provider fails.
   */
  async evaluate(context) {
    const startTime = Date.now();
    const aiProvider = createAIProvider();
    const providerName = aiProvider.constructor.name;
    const modelName = AIConfig.groqModel || AIConfig.model || "unknown";

    this.#logStart(providerName, modelName, context);

    try {
      // Step 1: Build prompt from EvaluationContext
      const prompt = EvaluationPromptBuilder.buildEvaluationPrompt(context);
      this.#logStep("Prompt generated");

      // Step 2: Send to AI provider
      const generationStart = Date.now();
      const rawResponse = await aiProvider.generate(prompt);
      const generationMs = Date.now() - generationStart;
      this.#logStep(`AI response received (${generationMs}ms)`);

      // Step 3: Parse raw response into JSON
      const parsed = EvaluationResponseParser.parse(rawResponse);
      this.#logStep("Response parsed");

      // Step 4: Validate against InterviewResult schema
      const validated = EvaluationResponseValidator.validate(parsed);
      this.#logStep("Response validated");

      // Log success metrics
      this.#logMetrics({
        provider: providerName,
        model: modelName,
        generationMs,
        totalMs: Date.now() - startTime,
        status: "Success",
        questionCount: validated.questionEvaluations?.length || 0,
      });

      return validated;
    } catch (error) {
      // Log failure metrics — then let the error bubble up naturally
      this.#logMetrics({
        provider: providerName,
        model: modelName,
        generationMs: null,
        totalMs: Date.now() - startTime,
        status: `Failure (${error.name || "Error"})`,
        questionCount: 0,
      });

      throw error;
    }
  }

  // ── Private: Safe Logging ────────────────────────────────────────────

  /**
   * Log the start of an evaluation. Never logs prompts, answers, or API keys.
   */
  #logStart(providerName, modelName, context) {
    console.log("\n[EvaluationProvider] Starting evaluation");
    console.log(`  Provider: ${providerName}`);
    console.log(`  Model: ${modelName}`);
    console.log(
      `  Questions: ${context.transcript?.length || 0}`
    );
    console.log(
      `  Job Role: ${context.interviewConfig?.jobRole || "unknown"}`
    );
  }

  /**
   * Log a pipeline step.
   */
  #logStep(message) {
    console.log(`  → ${message}`);
  }

  /**
   * Log performance metrics. Never logs prompts, raw responses, or personal data.
   */
  #logMetrics({ provider, model, generationMs, totalMs, status, questionCount }) {
    console.log("\n[EvaluationProvider] Metrics:");
    console.log(
      JSON.stringify(
        {
          provider,
          model,
          status,
          generationMs,
          totalMs,
          questionCount,
          evaluatedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );
  }
}
