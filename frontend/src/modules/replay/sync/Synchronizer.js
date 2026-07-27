export class Synchronizer {
    constructor(timeline) {
        this.timeline = timeline || [];
        this.currentTime = 0;
    }

    sync(currentTime) {
        this.currentTime = currentTime;
    }

    getCurrentTime() {
        return this.currentTime;
    }

    getActiveTimelineEntries() {
        if (!this.timeline) return [];
        return this.timeline.filter(entry => {
            if (this.currentTime >= entry.startTime && this.currentTime <= entry.endTime) {
                // If we are exactly at the boundary where this entry ends and another of the same type begins,
                // we should yield to the newer entry.
                if (this.currentTime === entry.endTime) {
                    const hasNext = this.timeline.some(t => t.type === entry.type && t.startTime === this.currentTime && t !== entry);
                    if (hasNext) return false;
                }
                return true;
            }
            return false;
        });
    }
}
