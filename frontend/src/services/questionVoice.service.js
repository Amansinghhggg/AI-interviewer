import { voiceService } from "./voice.service";

/**
 * QuestionVoiceService
 * Responsible for orchestrating and caching question audio.
 */
class QuestionVoiceService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieves audio for a question, generating it if necessary.
   * Uses sessionId + question.id for cache isolation.
   * @param {Object} question
   * @param {string} sessionId
   * @returns {Promise<Blob>}
   */
  async getQuestionAudio(question, sessionId) {
    if (!question || (!question.id && !question._id) || !question.question || !sessionId) {
      throw new Error("Invalid question or sessionId provided to QuestionVoiceService");
    }

    const questionId = question.id || question._id;
    const cacheKey = `${sessionId}_${questionId}`;

    if (this.cache.has(cacheKey)) {
      console.log(`[QuestionVoiceService] Cache Hit: ${cacheKey}`);
      // Analytics reserved: "Cache Hit"
      return this.cache.get(cacheKey);
    }

    console.log(`[QuestionVoiceService] Cache Miss: ${cacheKey}. Generating...`);
    // Analytics reserved: "Cache Miss"
    
    try {
      // Future: Could pass selected multilingual voice here. Using default for now.
      const response = await voiceService.speak(question.question);
      
      this.cache.set(cacheKey, response.blob);
      return response.blob;
    } catch (error) {
      // Analytics reserved: "Playback Error"
      console.error(`[QuestionVoiceService] Failed to generate audio for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Clears the memory cache. Should be called when the interview ends.
   */
  clearCache() {
    this.cache.clear();
    console.log("[QuestionVoiceService] Audio cache cleared.");
  }
}

export const questionVoiceService = new QuestionVoiceService();
