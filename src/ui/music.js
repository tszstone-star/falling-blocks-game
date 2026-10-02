const LOOP_SECONDS = 24;
const STEP_SECONDS = LOOP_SECONDS / 64;
const MELODY = [293.66, 392, 440, 392, 329.63, 392, 493.88, 440, 392, 440, 587.33, 493.88, 440, 392, 329.63, 293.66];
const BASS = [146.83, 110, 123.47, 98, 146.83, 110, 123.47, 110];

export function createMusic(target = globalThis) {
  const scheduleInterval = target.setInterval?.bind(target) ?? setInterval;
  const cancelInterval = target.clearInterval?.bind(target) ?? clearInterval;
  const scheduleTimeout = target.setTimeout?.bind(target) ?? setTimeout;
  let context;
  let enabled = true;
  let run;

  function scheduleTone(active, frequency, when, duration, wave, volume) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, when);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.linearRampToValueAtTime(volume, when + 0.045);
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
      if (step % 4 === 0) {
        const note = MELODY[(step / 4) % MELODY.length];
        scheduleTone(active, note, Math.max(when, context.currentTime + 0.01), 0.34, 'sine', 0.15);
      }
      if (step % 8 === 0) {
        const note = BASS[(step / 8) % BASS.length];
        scheduleTone(active, note, Math.max(when, context.currentTime + 0.01), 0.65, 'triangle', 0.11);
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
      active.master.gain.setValueAtTime(0.2, context.currentTime);
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
