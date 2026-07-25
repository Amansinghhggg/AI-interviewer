/**
 * Generic retry utility supporting configurable backoff, timeout, and conditional retries.
 *
 * @param {object} params
 * @param {Function} params.operation - Async function to execute.
 * @param {number} [params.maxRetries=3] - Maximum number of retries.
 * @param {number} [params.retryDelay=1000] - Base delay in ms (multiplied exponentially).
 * @param {Function} [params.shouldRetry] - Function(error) returning boolean. If false, fails immediately.
 * @param {Function} [params.onRetry] - Hook fired before a retry: (error, attempt).
 * @param {Function} [params.onSuccess] - Hook fired on success: (result, attempt).
 * @param {Function} [params.onFailure] - Hook fired on final failure: (error, attempt).
 * @returns {Promise<any>}
 */
export const withRetry = async ({
  operation,
  maxRetries = 3,
  retryDelay = 1000,
  shouldRetry = () => true, // default: retry everything
  onRetry,
  onSuccess,
  onFailure,
}) => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await operation();
      if (onSuccess) onSuccess(result, attempt);
      return result;
    } catch (error) {
      // Check if we should stop retrying (e.g., 400 Bad Request, Permission Denied)
      if (attempt >= maxRetries || !shouldRetry(error)) {
        if (onFailure) onFailure(error, attempt);
        throw error;
      }

      attempt++;
      if (onRetry) onRetry(error, attempt);

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
