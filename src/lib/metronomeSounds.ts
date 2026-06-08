// Web Audio API Metronome

let audioContext: AudioContext | null = null;

// Initialize audio context (must be called after user interaction)
export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Play a single click sound
export function playClick(primary: boolean = true): void {
  try {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Different pitch for primary (downbeat) vs secondary beats
    osc.frequency.value = primary ? 880 : 660; // A5 for downbeat, E5 for others
    gain.gain.value = 0.3;
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
    osc.stop(now + 0.2);
    
    // Visual feedback via custom event
    window.dispatchEvent(new CustomEvent('metronome-click', { detail: { primary } }));
  } catch (e) {
    console.log('Audio not ready yet');
  }
}

// Schedule a sequence of clicks for continuous metronome
let currentInterval: number | null = null;
let currentBPM = 120;
let isPlaying = false;

export function startMetronome(bpm: number, onTick?: (primary: boolean) => void): void {
  stopMetronome();
  currentBPM = bpm;
  isPlaying = true;
  
  const intervalMs = (60 / bpm) * 1000;
  let beatCount = 0;
  
  // Play first beat immediately
  const isPrimary = beatCount % 4 === 0;
  playClick(isPrimary);
  if (onTick) onTick(isPrimary);
  beatCount++;
  
  currentInterval = window.setInterval(() => {
    if (!isPlaying) return;
    const isPrimaryBeat = beatCount % 4 === 0;
    playClick(isPrimaryBeat);
    if (onTick) onTick(isPrimaryBeat);
    beatCount++;
  }, intervalMs);
}

export function stopMetronome(): void {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  isPlaying = false;
}

export function isMetronomePlaying(): boolean {
  return isPlaying;
}

export function setMetronomeBPM(bpm: number): void {
  currentBPM = bpm;
  if (isPlaying) {
    startMetronome(bpm, undefined);
  }
}

export function getTempoSuggestion(difficulty: string, exerciseType: string): number {
  // Suggest tempo based on difficulty and exercise type
  const baseTempo: Record<string, number> = {
    beginner: 60,
    intermediate: 90,
    advanced: 120
  };
  
  const typeMultiplier: Record<string, number> = {
    warmup: 0.7,
    technique: 1,
    'sight-reading': 0.8,
    repertoire: 0.9,
    'ear-training': 0.85,
    theory: 1,
    'cool-down': 0.6
  };
  
  const base = baseTempo[difficulty] || 80;
  const multiplier = typeMultiplier[exerciseType] || 0.8;
  
  return Math.round(base * multiplier);
}