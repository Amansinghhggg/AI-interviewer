/**
 * Merges a new speech transcript into an existing text value.
 * @param {string} existingText - The current text in the input
 * @param {string} transcript - The new transcribed text
 * @returns {string} The combined text
 */
export const mergeTranscript = (existingText, transcript) => {
  if (!existingText || existingText.trim() === "") {
    return transcript;
  }
  return `${existingText.trim()}\n\n${transcript}`;
};
