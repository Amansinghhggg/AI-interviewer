export class SessionPersistenceService {
    async uploadSession(session, onProgress) {
        // Mock upload logic with progress
        let progress = 0;
        
        while (progress < 100) {
            await new Promise(resolve => setTimeout(resolve, 300));
            progress += 50;
            if (onProgress) {
                onProgress(progress);
            }
        }
        
        return { success: true, sessionId: session.sessionId };
    }
}
