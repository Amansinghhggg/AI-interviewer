import { ReplayTimelineBuilder } from '../timeline/ReplayTimelineBuilder.js';
import { PlaybackEngine } from './PlaybackEngine.js';
import { Synchronizer } from '../sync/Synchronizer.js';

export class ReplayEngine {
    constructor() {
        this.playbackEngine = new PlaybackEngine();
        this.timeline = [];
        this.synchronizer = new Synchronizer(this.timeline);
        this.session = null;
        this.recording = null;
    }

    loadSession(session) {
        this.session = session;
        this.recording = session.recording || { url: '', duration: session.duration || 0, mimeType: 'video/webm' };
        
        this.timeline = ReplayTimelineBuilder.build(session);
        this.synchronizer = new Synchronizer(this.timeline);
        
        this.playbackEngine.init(this.recording.duration);
        
        this.playbackEngine.on('timeupdate', (time) => {
            this.synchronizer.sync(time);
        });
    }

    getTimeline() {
        return this.timeline;
    }
    
    getSynchronizer() {
        return this.synchronizer;
    }

    getPlaybackEngine() {
        return this.playbackEngine;
    }
    
    getRecording() {
        return this.recording;
    }
}

export const replayEngine = new ReplayEngine();
