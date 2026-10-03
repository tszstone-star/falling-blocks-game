const LOOP_SECONDS = 24;
const STEP_SECONDS = LOOP_SECONDS / 64;
const MELODY = [392, 440, 493.88, 587.33, 493.88, 440, 392, 329.63, 392, 440, 493.88, 659.25, 587.33, 493.88, 440, 392];
const BASS = [98, 98, 146.83, 146.83, 82.41, 82.41, 130.81, 130.81];
const CHORDS = [
  [196, 246.94, 293.66, 369.99],
  [146.83, 185, 220, 277.18],
  [164.81, 196, 246.94, 293.66],
  [130.81, 164.81, 196, 246.94],
];

export function createMusic(target = globalThis) {
  const scheduleInterval = target.setInterval?.bind(target) ?? setInterval;
  const cancelInterval = target.clearInterval?.bind(target) ?? clearInterval;
  const scheduleTimeout = target.setTimeout?.bind(target) ?? setTimeout;
  let context;
  let enabled = true;
  let run;

  function scheduleTone(active, frequency, when, duration, wave, volume, attack = 0.04) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, when);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.linearRampToValueAtTime(volume, when + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(active.master);
    oscillator.onended = () => {
      active.nodes.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
    active.nodes.add(oscillator);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.02);
  }

  function scheduleKick(active, when) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(92, when);
    oscillator.frequency.exponentialRampToValueAtTime(46, when + 0.12);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.linearRampToValueAtTime(0.085, when + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + 0.18);
    oscillator.connect(envelope);
    envelope.connect(active.master);
    oscillator.onended = () => {
      active.nodes.delete(oscillator);
      oscillator.disconnect();
      envelope.disconnect();
    };
    active.nodes.add(oscillator);
    oscillator.start(when);
    oscillator.stop(when + 0.2);
  }

  function scheduleLookahead(active) {
    const horizon = context.currentTime + 0.6;
    while (active.nextStep < 64 || active.loopStart + LOOP_SECONDS <= horizon) {
      if (active.nextStep === 64) {
        active.loopStart += LOOP_SECONDS;
        active.nextStep = 0;
      }
      const step = active.nextStep++;
      const when = active.loopStart + step * STEP_SECONDS;
      if (when > horizon) {
        active.nextStep--;
        break;
      }
      const safeWhen = Math.max(when, context.currentTime + 0.01);
      const slot = step % 8;
      const bar = Math.floor(step / 8);
      if (step % 2 === 0) {
        scheduleTone(active, MELODY[(step / 2) % MELODY.length], safeWhen, 0.4, 'triangle', 0.16);
      }
      if (slot === 0 || slot === 4) {
        scheduleTone(active, BASS[(bar * 2 + slot / 4) % BASS.length], safeWhen, 0.68, 'sine', 0.12);
        scheduleKick(active, safeWhen);
      }
      if (slot === 0) {
        for (const frequency of CHORDS[bar % CHORDS.length]) {
          scheduleTone(active, frequency, safeWhen, 2.8, 'sine', 0.035, 0.18);
        }
      }
    }
  }

  async function start() {
    if (!enabled || run) return false;
    const AudioContextClass = target.AudioContext ?? target.webkitAudioContext;
    if (!AudioContextClass) return false;
    try {
      context ??= new AudioContextClass();
      const active = { master: context.createGain(), nodes: new Set(), loopStart: 0, nextStep: 0, timer: undefined };
      active.master.gain.setValueAtTime(0.3, context.currentTime);
      active.master.connect(context.destination);
      run = active;
      if (context.state === 'suspended') await context.resume();
      if (run !== active || !enabled) return false;
      active.loopStart = context.currentTime + 0.05;
      scheduleLookahead(active);
      active.timer = scheduleInterval(() => scheduleLookahead(active), 120);
      return true;
    } catch {
      stop();
      return false;
    }
  }

  function stop() {
    const active = run;
    if (!active) return;
    run = undefined;
    cancelInterval(active.timer);
    const now = context.currentTime;
    active.master.gain.cancelScheduledValues(now);
    active.master.gain.setValueAtTime(active.master.gain.value, now);
    active.master.gain.linearRampToValueAtTime(0, now + 0.16);
    for (const oscillator of active.nodes) {
      try { oscillator.stop(now + 0.17); } catch { /* The tone may already have stopped. */ }
    }
    scheduleTimeout(() => active.master.disconnect(), 220);
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) stop();
    return enabled;
  }

  return { start, stop, setEnabled, isEnabled: () => enabled, isPlaying: () => Boolean(run) };
}
