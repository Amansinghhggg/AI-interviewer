import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const voiceService = {
  /**
   * Upload an audio blob and get the transcription
   * @param {Blob} audioBlob 
   * @returns {Promise<{ transcript: string, metadata: object }>}
   */
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    // Defaulting to webm as that's what MediaRecorder typically outputs in Chrome/Firefox
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await apiClient.post("/voice/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check voice module health
   * @returns {Promise<any>}
   */
  health: async () => {
    const response = await apiClient.get("/voice/health");
    return response.data;
  },
};
