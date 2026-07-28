import CloudinaryService from "./CloudinaryService.js";

/**
 * InterviewRecordingService
 * Storage persistence abstraction isolating Cloudinary and media storage logic
 * from session management. Standardizes recording responses and skips uploads
 * for candidate MOCK interviews.
 */
class InterviewRecordingService {
  /**
   * Process and persist interview recording based on interview mode.
   * @param {Object} file - Express file object with buffer & originalname
   * @param {string} mode - "EMPLOYER" | "MOCK"
   * @param {Object} [options] - Additional options (folder, timeout)
   * @returns {Promise<Object>} Standardized recording response object
   */
  async processRecording(file, mode, options = {}) {
    if (mode === "MOCK") {
      return {
        success: true,
        status: "SKIPPED",
        recording: null,
        message: "Recording storage skipped for candidate mock interview.",
      };
    }

    if (!file || !file.buffer) {
      return {
        success: true,
        status: "NO_FILE",
        recording: null,
        message: "No recording file provided.",
      };
    }

    try {
      const uploadResult = await CloudinaryService.uploadRecording(
        file.buffer,
        file.originalname,
        options
      );

      return {
        success: true,
        status: "UPLOADED",
        recording: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          duration: uploadResult.duration || null,
        },
        message: "Recording uploaded successfully.",
      };
    } catch (error) {
      console.error("[InterviewRecordingService] Upload failed:", error);
      throw error;
    }
  }

  /**
   * Delete an existing recording.
   * @param {string} publicId 
   */
  async deleteRecording(publicId) {
    if (!publicId) return { success: true, status: "NO_ACTION" };
    try {
      await CloudinaryService.deleteRecording(publicId);
      return { success: true, status: "DELETED" };
    } catch (error) {
      console.error("[InterviewRecordingService] Delete failed:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new InterviewRecordingService();
