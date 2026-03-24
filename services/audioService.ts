// Simple synth for UI sounds using Web Audio API
// This avoids needing external MP3 files and keeps the app lightweight

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

export const playSound = (type: 'click' | 'success' | 'error' | 'send' | 'notification' | 'win' | 'pop') => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        // Short high pitched tick
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case 'pop':
        // Soft bubble pop (for likes)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'success':
        // Pleasant ascending major chord
        const successOsc = ctx.createOscillator();
        const successGain = ctx.createGain();
        successOsc.connect(successGain);
        successGain.connect(ctx.destination);
        
        // Note 1
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);

        // Note 2
        successOsc.type = 'sine';
        successOsc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        successGain.gain.setValueAtTime(0.1, now + 0.1);
        successGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        successOsc.start(now + 0.1);
        successOsc.stop(now + 0.4);
        break;

      case 'error':
        // Low buzzing sawtooth
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'send':
        // Swoosh up
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'notification':
        // Two tone bell
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now); // A5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.setValueAtTime(0.1, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);

        // Second tone logic would need another oscillator, kept simple here or simulated by frequency jump
        setTimeout(() => {
           const osc2 = ctx.createOscillator();
           const gain2 = ctx.createGain();
           osc2.connect(gain2);
           gain2.connect(ctx.destination);
           osc2.type = 'sine';
           osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
           gain2.gain.setValueAtTime(0.1, ctx.currentTime);
           gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
           osc2.start(ctx.currentTime);
           osc2.stop(ctx.currentTime + 0.4);
        }, 150);
        break;

      case 'win':
        // Fanfare-ish
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.1);
        oscillator.frequency.setValueAtTime(783.99, now + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        oscillator.start(now);
        oscillator.stop(now + 1.0);
        break;
    }
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};