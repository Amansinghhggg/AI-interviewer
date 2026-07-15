import { ValidationError } from "../errors/VoiceErrors.js";
import { VoiceConfig } from "../config/voice.config.js";

/**
 * Validates the uploaded audio file metadata
 * Assumes the file is already populated by multer
 */
export const validateAudio = (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      throw new ValidationError("No audio file provided");
    }

    if (!VoiceConfig.supportedAudioTypes.includes(file.mimetype)) {
      throw new ValidationError(`Unsupported audio type: ${file.mimetype}`);
    }

    if (file.size > VoiceConfig.maxAudioSize) {
      throw new ValidationError(`Audio file size exceeds the ${VoiceConfig.maxAudioSize} bytes limit`);
    }

    if (file.size === 0) {
      throw new ValidationError("Audio file is empty");
    }

    next();
  } catch (error) {
    next(error);
  }
};
