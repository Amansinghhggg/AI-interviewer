export const saveInterview = (id, data) => {
  try {
    const key = `interviewState-${id}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save interview state:", error);
  }
};

export const restoreInterview = (id) => {
  try {
    const key = `interviewState-${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to restore interview state:", error);
    return null;
  }
};

export const clearInterview = (id) => {
  try {
    const key = `interviewState-${id}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear interview state:", error);
  }
};
