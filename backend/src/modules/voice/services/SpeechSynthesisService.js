import { VoiceConfig } from "../config/voice.config.js";
import { TTSProviderFactory } from "../providers/TTSProvider/TTSProviderFactory.js";
import { SpeechSynthesisValidator } from "../validators/SpeechSynthesisValidator.js";
import { SpeechCache } from "../utils/SpeechCache.js";

export class SpeechSynthesisService {
  /**
   * Validates text, checks cache, and invokes the TTS provider.
   * @param {object} params { text, voice, rate }
   * @returns {Promise<{audio: Buffer, metadata: object}>}
   */
  static async synthesize({ text, voice, rate }) {
    // 1. Validate
    const validatedData = SpeechSynthesisValidator.validate({ text, voice, rate });

    // 2. Check Cache (Future-proofing)
    // Create a deterministic cache key based on text and voice
    const cacheKey = `tts:${validatedData.voice || VoiceConfig.tts.defaultVoice}:${Buffer.from(validatedData.text).toString('base64')}`;
    const cachedAudio = await SpeechCache.get(cacheKey);

    if (cachedAudio) {
      return {
        audio: cachedAudio,
        metadata: {
          provider: "cache",
          voice: validatedData.voice || VoiceConfig.tts.defaultVoice,
          format: VoiceConfig.tts.defaultFormat
        }
      };
    }

    // 3. Invoke Provider
    const provider = TTSProviderFactory.getProvider(VoiceConfig.tts.provider);
    const startTime = Date.now();
    let success = false;
    let dto = null;

    try {
      dto = await provider.synthesize(validatedData.text, {
        voice: validatedData.voice,
        rate: validatedData.rate
      });
      success = true;

      // Save to cache asynchronously
      SpeechCache.set(cacheKey, dto.audio).catch(err => console.error("Cache Set Error:", err));

      return dto;
    } finally {
      // 4. Collect latency and emit structured log
      const latency = Date.now() - startTime;
      console.log(JSON.stringify({
        event: "TTS_SYNTHESIS",
        provider: VoiceConfig.tts.provider,
        voice: validatedData.voice || VoiceConfig.tts.defaultVoice,
        audioFormat: dto?.metadata?.format || VoiceConfig.tts.defaultFormat,
        latencyMs: latency,
        characterCount: validatedData.text.length,
        success: success,
        timestamp: new Date().toISOString()
      }));
    }
  }
}
