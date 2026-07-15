import SpeechService from "../services/SpeechService.js";
import { SpeechSynthesisService } from "../services/SpeechSynthesisService.js";
import { VoiceConfig } from "../config/voice.config.js";

export const transcribeAudio = async (req, res, next) => {
  try {
    const result = await SpeechService.transcribe(req.file);

    res.status(200).json({
      success: true,
      transcript: result.transcript,
    });
  } catch (error) {
    next(error);
  }
};

export const speakAudio = async (req, res, next) => {
  try {
    const { text, voice, rate } = req.body;
    const { audio, metadata } = await SpeechSynthesisService.synthesize({ text, voice, rate });

    let contentType = "audio/mpeg"; 
    if (metadata.format === "wav") contentType = "audio/wav";
    else if (metadata.format === "ogg") contentType = "audio/ogg";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audio.length);
    
    res.status(200).send(audio);
  } catch (error) {
    next(error);
  }
};

export const health = (req, res) => {
  res.status(200).json({
    provider: VoiceConfig.provider,
    model: VoiceConfig.groqModel,
    status: "OK",
  });
};
