/**
 * Score Interpretation Utility
 * 
 * Returns the human-readable label and UI color class for a given score out of 10.
 *
 * @param {number} score 
 * @returns {{ label: string, color: string }}
 */
export function getScoreInterpretation(score) {
  if (score == null) return { label: "Unknown", color: "text-dark-400" };
  
  if (score >= 9) return { label: "Exceptional", color: "text-emerald-400" };
  if (score >= 8) return { label: "Strong", color: "text-primary-400" };
  if (score >= 7) return { label: "Good", color: "text-blue-400" };
  if (score >= 6) return { label: "Average", color: "text-yellow-400" };
  
  return { label: "Needs Improvement", color: "text-red-400" };
}
