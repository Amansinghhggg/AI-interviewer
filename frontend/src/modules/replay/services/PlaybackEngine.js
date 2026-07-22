import { REPLAY_STATES } from '../config/constants.js';

export class PlaybackEngine {
    constructor() {
        this.state = REPLAY_STATES.IDLE;
        this.currentTime = 0;
        this.playbackRate = 1.0;
        this.duration = 0;
        
        this.listeners = {
            statechange: [],
            timeupdate: [],
            ratechange: [],
            seeked: []
        };
    }

    init(duration) {
        this.duration = duration;
        this.currentTime = 0;
        this.updateState(REPLAY_STATES.READY);
    }

    play() {
        if (this.state === REPLAY_STATES.READY || this.state === REPLAY_STATES.PAUSED) {
            this.updateState(REPLAY_STATES.PLAYING);
        }
    }

    pause() {
        if (this.state === REPLAY_STATES.PLAYING) {
            this.updateState(REPLAY_STATES.PAUSED);
        }
    }

    seek(time) {
        let newTime = Math.max(0, Math.min(time, this.duration));
        this.currentTime = newTime;
        this.emit('seeked', this.currentTime);
        this.emit('timeupdate', this.currentTime);
    }

    jumpTo(time) {
        this.seek(time);
    }

    changeSpeed(rate) {
        this.playbackRate = rate;
        this.emit('ratechange', this.playbackRate);
    }

    updateTime(time) {
        this.currentTime = time;
        this.emit('timeupdate', this.currentTime);
        if (this.currentTime >= this.duration && this.duration > 0 && this.state !== REPLAY_STATES.ENDED) {
             this.updateState(REPLAY_STATES.ENDED);
        }
    }

    updateState(newState) {
        if (this.state !== newState) {
            this.state = newState;
            this.emit('statechange', this.state);
        }
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}
