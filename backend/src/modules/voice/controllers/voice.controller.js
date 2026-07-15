import SpeechService from "../services/SpeechService.js";
import { VoiceConfig } from "../config/voice.config.js";

/**
 * Handle audio transcription request
 */
export const transcribeAudio = async (req, res, next) => {
  try {
    // Validation is already handled by middleware and validators
    const result = await SpeechService.transcribe(req.file);

    res.status(200).json({
      success: true,
      transcript: result.transcript,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Health check endpoint for voice module
 */
export const health = (req, res) => {
  res.status(200).json({
    provider: VoiceConfig.provider,
    model: VoiceConfig.groqModel,
    status: "OK",
  });
};
