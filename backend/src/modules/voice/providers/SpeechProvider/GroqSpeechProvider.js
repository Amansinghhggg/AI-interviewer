import Groq from "groq-sdk";
import { BaseSpeechProvider } from "./BaseSpeechProvider.js";
import { VoiceConfig } from "../../config/voice.config.js";
import { ProviderError } from "../../errors/VoiceErrors.js";
import { toFile } from "groq-sdk";

export class GroqSpeechProvider extends BaseSpeechProvider {
  constructor() {
    super();
    if (!VoiceConfig.groqApiKey) {
      throw new ProviderError("GROQ_API_KEY is not configured", "GroqSpeechProvider");
    }
    this.groq = new Groq({ apiKey: VoiceConfig.groqApiKey });
    this.model = VoiceConfig.groqModel;
  }

  async transcribe(audio) {
    try {
      // groq-sdk needs a File-like object. toFile converts a buffer.
      // We pass the filename so it knows the format.
      const file = await toFile(audio.buffer, audio.originalname, { type: audio.mimetype });

      const transcription = await this.groq.audio.transcriptions.create(
        {
          file,
          model: this.model,
        },
        { timeout: VoiceConfig.timeout }
      );

      return transcription.text;
    } catch (error) {
      this.handleError(error);
    }
  }
}
