/**
 * useConversationState Hook
 *
 * Derives a single CONVERSATION_STATES value from existing hook outputs.
 * This is the single source of truth for component rendering —
 * components check conversationState instead of scattered boolean flags.
 *
 * Also derives the transcript state for CandidateTranscript.
 *
 * Input:  { isGenerating, voiceState, isInterviewFinished, submitting }
 * Output: { conversationState, statusMessage, transcriptState }
 */

import { useMemo } from 'react';
import { CONVERSATION_STATES, CONVERSATION_STATUS_MESSAGES } from '../conversationStates';
import { TRANSCRIPT_STATES } from '../transcriptStates';
import { VOICE_STATES } from '../../../../hooks/useQuestionVoice';

/**
 * @param {object} params
 * @param {boolean} params.isGenerating - From useInterview (waiting for Gemini)
 * @param {string} params.voiceState - From useQuestionVoice (VOICE_STATES value)
 * @param {boolean} params.isInterviewFinished - From useInterview
 * @param {boolean} params.submitting - From useInterview (submitting interview)
 * @returns {{ conversationState: string, statusMessage: string, transcriptState: string }}
 */
export const useConversationState = ({ isGenerating, voiceState, isInterviewFinished, submitting, isTranscribing }) => {
  const conversationState = useMemo(() => {
    // Transcribing voice to text
    if (isTranscribing) {
      return CONVERSATION_STATES.ANALYZING;
    }

    // Any backend processing is seen as "THINKING" to the user
    if (submitting || isGenerating || voiceState === VOICE_STATES.GENERATING) {
      return CONVERSATION_STATES.THINKING;
    }

    // Voice error
    if (voiceState === VOICE_STATES.ERROR) {
      return CONVERSATION_STATES.ERROR;
    }

    // AI is speaking the question
    if (voiceState === VOICE_STATES.PLAYING) {
      return CONVERSATION_STATES.SPEAKING;
    }

    // AI finished speaking — candidate's turn
    if (voiceState === VOICE_STATES.READY || voiceState === VOICE_STATES.PAUSED) {
      return CONVERSATION_STATES.LISTENING;
    }

    // Default — waiting / idle
    return CONVERSATION_STATES.WAITING;
  }, [isGenerating, voiceState, isInterviewFinished, submitting, isTranscribing]);

  // Derive transcript state from conversation state
  const transcriptState = useMemo(() => {
    switch (conversationState) {
      case CONVERSATION_STATES.LISTENING:
        return TRANSCRIPT_STATES.LISTENING;
      case CONVERSATION_STATES.ANALYZING:
      case CONVERSATION_STATES.THINKING:
        return TRANSCRIPT_STATES.PROCESSING;
      case CONVERSATION_STATES.SPEAKING:
        return TRANSCRIPT_STATES.COMPLETED;
      default:
        return TRANSCRIPT_STATES.IDLE;
    }
  }, [conversationState]);

  const statusMessage = CONVERSATION_STATUS_MESSAGES[conversationState] || '';

  return {
    conversationState,
    statusMessage,
    transcriptState,
  };
};
