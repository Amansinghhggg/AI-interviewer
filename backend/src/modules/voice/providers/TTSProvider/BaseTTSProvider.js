/**
 * Abstract Base Class for TTS Providers
 */
export class BaseTTSProvider {
  /**
   * Generates audio buffer from text.
   * @param {string} text - The text to synthesize
   * @param {object} options - Synthesis options { voice, rate }
   * @returns {Promise<{audio: Buffer, metadata: {provider: string, voice: string, format: string}}>}
   */
  async synthesize(text, options) {
    throw new Error("Method 'synthesize()' must be implemented.");
  }

  /**
   * Generates a streaming response for the audio (Reserved for future).
   * @param {string} text 
   * @param {object} options 
   */
  async synthesizeStream(text, options) {
    throw new Error("Streaming synthesis is not implemented.");
  }
}
