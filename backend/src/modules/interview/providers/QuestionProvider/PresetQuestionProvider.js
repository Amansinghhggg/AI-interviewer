import { BaseQuestionProvider } from "./BaseQuestionProvider.js";
import { GeminiQuestionProvider } from "./GeminiQuestionProvider.js";

/**
 * PresetQuestionProvider
 * 
 * Handles employer custom preset questions (EMPLOYER_PRESET mode)
 * and hybrid campaigns (HYBRID mode).
 * 
 * Mode behavior:
 * - EMPLOYER_PRESET: Serves preset questions in order. Ends interview when questions are exhausted.
 * - HYBRID: Serves preset questions first; once exhausted, seamlessly delegates to GeminiQuestionProvider
 *   to generate adaptive AI follow-up questions!
 */
export class PresetQuestionProvider extends BaseQuestionProvider {
  constructor() {
    super();
    this.geminiProvider = new GeminiQuestionProvider();
  }

  /**
   * Generates or retrieves the first question.
   */
  async generateFirstQuestion(config) {
    const presets = config.customQuestions || [];
    if (presets.length > 0) {
      console.log(`[PresetQuestionProvider] Serving first preset question from employer list (${presets.length} total)`);
      return [{
        question: presets[0].question,
        topic: presets[0].topic || "General",
        concept: presets[0].concept || "Custom",
        difficulty: presets[0].difficulty || "Medium",
        expectedDuration: presets[0].expectedDuration || 120,
        type: "text"
      }];
    }

    // Fallback if customQuestions is empty
    console.log("[PresetQuestionProvider] No preset questions provided, delegating to Gemini AI provider");
    return this.geminiProvider.generateFirstQuestion(config);
  }

  /**
   * Generates or retrieves the next question.
   */
  async generateNextQuestion(promptContext) {
    const { config, state } = promptContext;
    const presets = config.customQuestions || [];
    const currentIndex = (state.currentQuestion || 1) - 1;

    // 1. Mode: EMPLOYER_PRESET (Ask ONLY employer preset questions)
    if (config.questionMode === "EMPLOYER_PRESET") {
      if (currentIndex >= 0 && currentIndex < presets.length) {
        console.log(`[PresetQuestionProvider] Serving preset question ${currentIndex + 1}/${presets.length}`);
        return [{
          question: presets[currentIndex].question,
          topic: presets[currentIndex].topic || "General",
          concept: presets[currentIndex].concept || "Custom",
          difficulty: presets[currentIndex].difficulty || "Medium",
          expectedDuration: presets[currentIndex].expectedDuration || 120,
          type: "text"
        }];
      }
      console.log("[PresetQuestionProvider] All employer preset questions completed.");
      return []; // Returns empty array to signal session completion
    }

    // 2. Mode: HYBRID (Ask employer preset questions first, then switch to adaptive Gemini AI)
    if (config.questionMode === "HYBRID") {
      if (currentIndex >= 0 && currentIndex < presets.length) {
        console.log(`[PresetQuestionProvider] [Hybrid] Serving preset question ${currentIndex + 1}/${presets.length}`);
        return [{
          question: presets[currentIndex].question,
          topic: presets[currentIndex].topic || "General",
          concept: presets[currentIndex].concept || "Custom",
          difficulty: presets[currentIndex].difficulty || "Medium",
          expectedDuration: presets[currentIndex].expectedDuration || 120,
          type: "text"
        }];
      }
      console.log(`[PresetQuestionProvider] [Hybrid] Employer preset questions finished. Generating adaptive AI follow-up via Gemini`);
      return this.geminiProvider.generateNextQuestion(promptContext);
    }

    // Default Fallback
    return this.geminiProvider.generateNextQuestion(promptContext);
  }
}
