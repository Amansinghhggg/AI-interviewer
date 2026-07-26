import api from "./api";

const profileService = {
  /**
   * Upload or replace candidate resume
   * @param {File} file 
   * @param {Function} onUploadProgress 
   * @returns 
   */
  uploadResume: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("resume", file);
    
    const response = await api.post("/profile/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Get authenticated candidate's resume
   * @returns 
   */
  getMyResume: async () => {
    const response = await api.get("/profile/resume");
    return response.data;
  },

  /**
   * Get a specific candidate's resume (Employer only)
   * @param {string} interviewId
   * @param {string} candidateId 
   * @returns 
   */
  getCandidateResume: async (interviewId, candidateId) => {
    const response = await api.get(`/interviews/${interviewId}/candidates/${candidateId}/resume`);
    return response.data;
  },

  /**
   * Download a resume by triggering a blob fetch and saving it
   * @param {string} endpointUrl - The API endpoint to fetch the blob from
   * @param {string} filename - The filename to save as
   */
  downloadResume: async (endpointUrl, filename) => {
    const response = await api.get(endpointUrl, { responseType: "blob" });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};

export default profileService;
