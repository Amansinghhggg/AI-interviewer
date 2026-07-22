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
        return this.timeline.filter(entry => 
            this.currentTime >= entry.startTime && this.currentTime <= entry.endTime
        );
    }
}
