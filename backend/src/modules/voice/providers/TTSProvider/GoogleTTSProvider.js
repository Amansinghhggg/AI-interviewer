import { BaseTTSProvider } from "./BaseTTSProvider.js";
import * as googleTTS from "google-tts-api";

export class GoogleTTSProvider extends BaseTTSProvider {
  /**
   * Generates audio buffer from text using Google TTS API.
   * @param {string} text - The text to synthesize
   * @param {object} options - Synthesis options { voice, rate }
   * @returns {Promise<{audio: Buffer, metadata: {provider: string, voice: string, format: string}}>}
   */
  async synthesize(text, options = {}) {
    try {
      // Extract language code (e.g. 'en-US' or just 'en')
      const lang = options.voice ? options.voice.split('-').slice(0, 2).join('-') : 'en';

      // get all audio base64 parts (handles long texts > 200 chars)
      const results = await googleTTS.getAllAudioBase64(text, {
        lang: lang,
        slow: options.rate && options.rate < 1 ? true : false,
        host: 'https://translate.google.com',
        splitPunct: ',.?',
      });

      // Concatenate the audio buffers
      const buffers = results.map(res => Buffer.from(res.base64, 'base64'));
      const audioBuffer = Buffer.concat(buffers);

      return {
        audio: audioBuffer,
        metadata: {
          provider: "google",
          voice: lang,
          format: "mp3"
        }
      };
    } catch (error) {
      throw error;
    }
  }
}
