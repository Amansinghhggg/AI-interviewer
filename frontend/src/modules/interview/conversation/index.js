/**
 * Interview Conversation Module — Public API
 *
 * Domain module for the conversational interview model.
 * Independent from UI components.
 */

// States
export { CONVERSATION_STATES, CONVERSATION_STATUS_MESSAGES } from './conversationStates';
export { TRANSCRIPT_STATES } from './transcriptStates';

// Models
export { createConversationTurn } from './models/ConversationTurn';

// Hooks
export { useConversationState } from './hooks/useConversationState';
