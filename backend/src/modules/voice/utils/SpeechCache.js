/**
 * Lightweight abstraction for caching synthesized speech.
 * Initial implementation simply returns null, preparing architecture for Redis/In-Memory later.
 */
export class SpeechCache {
  /**
   * Retrieve cached speech audio
   * @param {string} key 
   * @returns {Promise<Buffer | null>}
   */
  static async get(key) {
    return null; // Cache miss initially
  }

  /**
   * Save speech audio to cache
   * @param {string} key 
   * @param {Buffer} value 
   */
  static async set(key, value) {
    // No-op initially
  }
}
