import { BaseTTSProvider } from "./BaseTTSProvider.js";
import { EdgeTTS } from "node-edge-tts";
import { VoiceConfig } from "../../config/voice.config.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

export class EdgeTTSProvider extends BaseTTSProvider {
  /**
   * Generates audio buffer from text using Edge TTS.
   * @param {string} text - The text to synthesize
   * @param {object} options - Synthesis options { voice, rate }
   * @returns {Promise<{audio: Buffer, metadata: {provider: string, voice: string, format: string}}>}
   */
  async synthesize(text, options = {}) {
    const voice = options.voice || VoiceConfig.tts.defaultVoice;
    const rate = options.rate ? `${options.rate > 1 ? '+' : ''}${(options.rate - 1) * 100}%` : 'default';

    const tempFilePath = path.join(os.tmpdir(), `edge-tts-${crypto.randomBytes(16).toString('hex')}.mp3`);

    try {
      const tts = new EdgeTTS({
        voice: voice,
        rate: rate,
        lang: voice.split('-').slice(0, 2).join('-') // e.g., 'en-US'
      });
      
      // ttsPromise writes to a file
      await tts.ttsPromise(text, tempFilePath);

      // Read the file into a buffer
      const audioBuffer = await fs.readFile(tempFilePath);

      return {
        audio: audioBuffer, // Already a Buffer
        metadata: {
          provider: "edge",
          voice: voice,
          format: "mp3" 
        }
      };
    } catch (error) {
      throw error;
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        // Ignore if file didn't exist
      }
    }
  }
}
