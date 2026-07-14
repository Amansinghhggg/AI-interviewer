import { AIConfig } from "./config/ai.config.js";
import { GeminiProvider } from "./GeminiProvider.js";

import { GroqProvider } from "./GroqProvider.js";

/**
 * Provider Registry
 * Maps configuration string to the Provider class.
 * Easily extensible for future providers (GLMProvider, ClaudeProvider, etc.)
 */
const providerRegistry = {
  gemini: GeminiProvider,
  groq: GroqProvider,
  // glm: GLMProvider,
  // openai: OpenAIProvider,
  // claude: ClaudeProvider
};

/**
 * createAIProvider
 *
 * Factory method to instantiate the requested AI provider based on configuration.
 * The rest of the application should only interact with the returned instance
 * via the `generate(prompt)` interface.
 *
 * @returns {import('./BaseAIProvider.js').BaseAIProvider}
 * @throws {Error} If the configured provider is not supported.
 */
export const createAIProvider = () => {
  const ProviderClass = providerRegistry[AIConfig.provider.toLowerCase()];
  
  if (!ProviderClass) {
    throw new Error(`AI Provider Factory Error: Unsupported provider '${AIConfig.provider}'`);
  }

  return new ProviderClass();
};
