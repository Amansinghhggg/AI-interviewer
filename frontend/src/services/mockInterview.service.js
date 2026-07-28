import api from "./api";

/**
 * mockInterviewService
 * Frontend service layer abstracting all candidate mock interview API communications.
 * Pages communicate strictly with this service layer rather than invoking inline Axios calls.
 */
class MockInterviewService {
  /**
   * Create a new mock interview for candidate practice.
   * @param {Object} data 
   * @returns {Promise<Object>} API response data
   */
  async createMockInterview(data) {
    const response = await api.post("/mock-interviews", data);
    return response.data;
  }

  /**
   * Get candidate's mock evaluation history with pagination support.
   * @param {Object} [params] { page, limit }
   * @returns {Promise<Object>} API response data with evaluations & pagination
   */
  async getHistory({ page = 1, limit = 10 } = {}) {
    const response = await api.get("/mock-interviews/history", {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get candidate's incomplete / resumeable mock interviews.
   * @returns {Promise<Object>} API response data with resumeable array
   */
  async getResumeableMocks() {
    const response = await api.get("/mock-interviews/resumeable");
    return response.data;
  }

  /**
   * Get candidate's detailed evaluation DTO by result ID.
   * @param {string} resultId 
   * @returns {Promise<Object>} API response data
   */
  async getEvaluation(resultId) {
    const response = await api.get(`/mock-interviews/evaluations/${resultId}`);
    return response.data;
  }

  /**
   * Delete a candidate's mock interview.
   * @param {string} id 
   * @returns {Promise<Object>} API response data
   */
  async deleteMock(id) {
    const response = await api.delete(`/mock-interviews/${id}`);
    return response.data;
  }
}

export default new MockInterviewService();
