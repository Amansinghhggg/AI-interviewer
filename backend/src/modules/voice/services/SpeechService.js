import { SpeechProviderFactory } from "../providers/SpeechProvider/index.js";
import { SpeechResponseValidator } from "../validators/SpeechResponseValidator.js";

class SpeechService {
  /**
   * Transcribe the audio file and return a structured DTO
   * @param {Object} audioFile - The multer file object
   * @returns {Promise<Object>} The response DTO
   */
  async transcribe(audioFile) {
    let startTime = Date.now();
    const provider = SpeechProviderFactory.getProvider();
    const model = provider.model || "unknown";
    const sizeKB = (audioFile.size / 1024).toFixed(2);
    let attempt = 1;
    let maxAttempts = 2;

    while (attempt <= maxAttempts) {
      try {
        // 1. Delegate transcription to the configured provider
        const rawTranscript = await provider.transcribe(audioFile);

        // 2. Validate response
        const transcript = SpeechResponseValidator.validate(rawTranscript);

        const latencyMs = Date.now() - startTime;

        // 3. Log success with specific format
        console.log(
`[Speech]
Provider : ${provider.constructor.name.replace("SpeechProvider", "")}
Model    : ${model}
Mime     : ${audioFile.mimetype}
Size     : ${sizeKB} KB
Latency  : ${latencyMs} ms
Status   : Success\n`
        );

        // 4. Return DTO
        return {
          transcript,
          metadata: {
            provider: provider.constructor.name,
            model,
            latencyMs,
          },
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;

        // Determine if error is recoverable (e.g. ProviderError with 502/503/504)
        // For simplicity, we retry ProviderErrors (not validation errors)
        const isRecoverable = error.name === "ProviderError";

        if (isRecoverable && attempt < maxAttempts) {
          console.warn(`[SpeechService] Provider failed on attempt ${attempt}. Retrying...`);
          attempt++;
          // reset start time for the retry latency or keep it total? The prompt says "Latency" in the log, keeping total is fine or we reset. Let's reset.
          startTime = Date.now();
          continue;
        }

        console.error(
`[Speech]
Provider : ${provider.constructor.name.replace("SpeechProvider", "")}
Model    : ${model}
Mime     : ${audioFile.mimetype}
Size     : ${sizeKB} KB
Latency  : ${latencyMs} ms
Status   : Failure (${error.message})\n`
        );
        throw error;
      }
    }
  }
}

export default new SpeechService();
