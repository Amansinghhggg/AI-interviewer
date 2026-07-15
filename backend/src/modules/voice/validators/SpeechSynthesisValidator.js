import { z } from "zod";
import { VoiceConfig } from "../config/voice.config.js";

const speechSynthesisSchema = z.object({
  text: z.string().min(1, "Text is required.").max(VoiceConfig.tts.maxLength, `Text exceeds maximum length of ${VoiceConfig.tts.maxLength} characters.`),
  voice: z.enum(VoiceConfig.tts.availableVoices).optional(),
  rate: z.number().min(0.5).max(2.0).optional()
});

export const SpeechSynthesisValidator = {
  validate: (data) => {
    try {
      return speechSynthesisSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const err = new Error(error.errors.map(e => e.message).join(", "));
        err.name = "ValidationError";
        throw err;
      }
      throw error;
    }
  }
};
