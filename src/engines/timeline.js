import { clamp } from '../core/units.js';
import { createState } from '../core/state.js';

export class Timeline {
  constructor(duration, onFrame, onComplete = () => {}) {
    this.duration = duration; this.onFrame = onFrame; this.onComplete = onComplete;
    this.state = createState({ time: 0, playing: false, rate: 1 });
    this.raf = 0; this.last = null; this.completed = false;
    this.visibility = () => { if (typeof document !== 'undefined' && document.hidden) this.pause(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', this.visibility);
  }
  scheduleFrame(fn) {
    if (typeof globalThis.requestAnimationFrame === 'function') return globalThis.requestAnimationFrame(fn);
    return setTimeout(() => fn(Date.now()), 16);
  }
  cancelFrame(id) {
    if (typeof globalThis.cancelAnimationFrame === 'function') return globalThis.cancelAnimationFrame(id);
    clearTimeout(id);
  }
  tick = now => {
    if (!this.state.get().playing) return;
    const elapsed = this.last === null ? 0 : Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const time = clamp(this.state.get().time + elapsed * this.state.get().rate, 0, this.duration);
    this.state.set({ time });
    if (time >= this.duration) {
      this.pause(); this.onFrame(time);
      if (!this.completed) { this.completed = true; this.onComplete(); }
    } else { this.onFrame(time); this.raf = this.scheduleFrame(this.tick); }
  };
  play() {
    if (this.state.get().playing) return;
    if (this.state.get().time >= this.duration) this.reset();
    this.last = null; this.state.set({ playing: true }); this.raf = this.scheduleFrame(this.tick);
  }
  pause() { if (this.raf) { this.cancelFrame(this.raf); this.raf = 0; } this.state.set({ playing: false }); this.last = null; }
  seek(time) { this.pause(); this.state.set({ time: clamp(time, 0, this.duration) }); this.onFrame(this.state.get().time); }
  reset(duration = this.duration) { this.pause(); this.duration = duration; this.completed = false; this.state.set({ time: 0 }); this.onFrame(0); }
  rate(value) { this.state.set({ rate: clamp(value, 0.1, 4) }); }
  destroy() { this.pause(); if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.visibility); }
}
