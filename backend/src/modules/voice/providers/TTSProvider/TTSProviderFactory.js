import { EdgeTTSProvider } from "./EdgeTTSProvider.js";

const providers = {
  edge: EdgeTTSProvider,
  // future
  // openai: OpenAITTSProvider,
  // elevenlabs: ElevenLabsProvider
};

export class TTSProviderFactory {
  /**
   * Returns an instance of the configured TTS provider
   * @param {string} providerName 
   * @returns {BaseTTSProvider}
   */
  static getProvider(providerName) {
    const ProviderClass = providers[providerName];
    if (!ProviderClass) {
      throw new Error(`Unsupported TTS provider configured: ${providerName}`);
    }
    return new ProviderClass();
  }
}
