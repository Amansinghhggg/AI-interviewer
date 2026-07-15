import multer from "multer";
import { VoiceConfig } from "../config/voice.config.js";
import { ValidationError } from "../errors/VoiceErrors.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (VoiceConfig.supportedAudioTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Multer itself allows passing errors to the callback
    cb(new ValidationError(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: VoiceConfig.maxAudioSize,
  },
  fileFilter,
});
