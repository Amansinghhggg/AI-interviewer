import dotenv from "dotenv";
dotenv.config();

export const VoiceConfig = {
  provider: process.env.SPEECH_PROVIDER || "groq",
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_WHISPER_MODEL || "whisper-large-v3",
  timeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
  maxAudioSize: parseInt(process.env.MAX_AUDIO_SIZE, 10) || 10 * 1024 * 1024, // 10MB default
  supportedAudioTypes: process.env.SUPPORTED_AUDIO_TYPES 
    ? process.env.SUPPORTED_AUDIO_TYPES.split(",").map(t => t.trim()) 
    : ["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"],
  
  // TTS Settings
  tts: {
    provider: process.env.TTS_PROVIDER || 'edge',
    defaultVoice: process.env.DEFAULT_TTS_VOICE || 'en-US-AriaNeural',
    defaultRate: process.env.DEFAULT_TTS_RATE || 1,
    defaultFormat: process.env.DEFAULT_AUDIO_FORMAT || 'mp3',
    maxLength: parseInt(process.env.MAX_TTS_TEXT_LENGTH, 10) || 500,
    availableVoices: [
      'en-US-AriaNeural',
      'en-US-JennyNeural',
      'en-US-GuyNeural'
    ]
  }
};

function validateConfig() {
  const requiredFields = ["provider", "groqApiKey", "groqModel", "timeout", "maxAudioSize", "supportedAudioTypes"];
  
  for (const field of requiredFields) {
    if (!VoiceConfig[field] || (Array.isArray(VoiceConfig[field]) && VoiceConfig[field].length === 0)) {
      throw new Error(`[Voice Module] Configuration validation failed: ${field} is missing or empty`);
    }
  }

  // Specifically validate that it is a positive number
  if (isNaN(VoiceConfig.timeout) || VoiceConfig.timeout <= 0) {
    throw new Error("[Voice Module] Configuration validation failed: timeout must be a positive number");
  }

  if (isNaN(VoiceConfig.maxAudioSize) || VoiceConfig.maxAudioSize <= 0) {
    throw new Error("[Voice Module] Configuration validation failed: maxAudioSize must be a positive number");
  }
}

validateConfig();
