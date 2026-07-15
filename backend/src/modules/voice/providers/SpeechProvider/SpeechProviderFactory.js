import { GroqSpeechProvider } from "./GroqSpeechProvider.js";
import { VoiceConfig } from "../../config/voice.config.js";

export class SpeechProviderFactory {
  static getProvider() {
    const providerName = VoiceConfig.provider.toLowerCase();
    
    switch (providerName) {
      case "groq":
        return new GroqSpeechProvider();
      default:
        console.warn(`[SpeechProviderFactory] Unknown provider '${providerName}', falling back to 'groq'`);
        return new GroqSpeechProvider();
    }
  }
}
