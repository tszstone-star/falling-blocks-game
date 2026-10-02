const EFFECTS = {
  lock: [{ frequency: 196, duration: 0.055, wave: 'triangle', volume: 0.16 }],
  'line-clear': [
    { frequency: 523.25, duration: 0.075, wave: 'sine', volume: 0.19 },
    { frequency: 659.25, duration: 0.11, wave: 'sine', volume: 0.18 },
  ],
  tetris: [
    { frequency: 523.25, duration: 0.07, wave: 'sine', volume: 0.2 },
    { frequency: 659.25, duration: 0.07, wave: 'sine', volume: 0.2 },
    { frequency: 783.99, duration: 0.08, wave: 'sine', volume: 0.2 },
    { frequency: 1046.5, duration: 0.18, wave: 'sine', volume: 0.2 },
  ],
  'level-up': [
    { frequency: 392, duration: 0.08, wave: 'sine', volume: 0.18 },
    { frequency: 523.25, duration: 0.08, wave: 'sine', volume: 0.18 },
    { frequency: 659.25, duration: 0.16, wave: 'sine', volume: 0.18 },
  ],
  'game-over': [
    { frequency: 329.63, duration: 0.1, wave: 'sine', volume: 0.16 },
    { frequency: 246.94, duration: 0.13, wave: 'sine', volume: 0.15 },
    { frequency: 196, duration: 0.22, wave: 'sine', volume: 0.14 },
  ],
};

export function createSoundEffects(target = globalThis) {
  let context;
  let output;
  let enabled = true;
  let scheduledUntil = 0;

  function getContext() {
    const AudioContextClass = target.AudioContext ?? target.webkitAudioContext;
    if (!AudioContextClass) return undefined;
    try {
      context ??= new AudioContextClass();
      if (!output) {
        output = context.createGain();
        output.gain.setValueAtTime(0.12, context.currentTime);
        output.connect(context.destination);
      }
      return context;
    } catch {
      return undefined;
    }
  }

  async function unlock() {
    const active = getContext();
    if (!active) return false;
    try {
      if (active.state === 'suspended') await active.resume();
      return active.state !== 'closed';
    } catch {
      return false;
    }
  }

  function play(name) {
    const notes = EFFECTS[name];
    const active = enabled && getContext();
    if (!notes || !active) return false;
    if (active.state === 'suspended' && typeof active.resume === 'function') {
      Promise.resolve(active.resume()).catch(() => {});
    }
    try {
      let when = Math.max(active.currentTime + 0.01, scheduledUntil);
      for (const note of notes) {
        const oscillator = active.createOscillator();
        const envelope = active.createGain();
        oscillator.type = note.wave;
        oscillator.frequency.setValueAtTime(note.frequency, when);
        envelope.gain.setValueAtTime(0.0001, when);
        envelope.gain.linearRampToValueAtTime(note.volume, when + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, when + note.duration);
        oscillator.connect(envelope);
        envelope.connect(output);
        oscillator.start(when);
        oscillator.stop(when + note.duration + 0.015);
        when += note.duration * 0.72;
      }
      scheduledUntil = when;
      return true;
    } catch {
      return false;
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) scheduledUntil = 0;
    return enabled;
  }

  return { unlock, play, setEnabled, isEnabled: () => enabled };
}
