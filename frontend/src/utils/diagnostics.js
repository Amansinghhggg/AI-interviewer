/**
 * Diagnostics utility for structured runtime recovery events.
 * 
 * Supported events: 
 * - RecoveryStarted
 * - RecoverySucceeded
 * - RecoveryFailed
 * 
 * @param {string} event - The structured event name.
 * @param {object} metadata - e.g. { sessionId, attempt, error }
 */
export const runtimeDiagnostics = (event, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...metadata
  };

  // Safe error serialization
  if (logEntry.error instanceof Error) {
    logEntry.error = logEntry.error.message;
  }

  console.warn(`[DIAGNOSTICS] ${event}`, logEntry);
};
