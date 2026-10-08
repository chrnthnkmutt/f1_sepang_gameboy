export class RetroAudio {
  private context: AudioContext | null = null;
  private engineOscillator: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  muted = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const AudioContextConstructor = window.AudioContext;
      if (!AudioContextConstructor) return null;
      this.context = new AudioContextConstructor();
    }
    return this.context;
  }

  unlock(): void {
    const context = this.getContext();
    if (context?.state === "suspended") void context.resume();
  }

  beep(frequency = 700, duration = 0.08, type: OscillatorType = "square"): void {
    if (this.muted) return;
    const context = this.getContext();
    if (!context) return;
    this.unlock();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  setEngine(speed: number, active: boolean): void {
    if (this.muted) active = false;
    const context = this.getContext();
    if (!context) return;
    if (active && !this.engineOscillator) {
      this.unlock();
      this.engineOscillator = context.createOscillator();
      this.engineGain = context.createGain();
      this.engineOscillator.type = "sawtooth";
      this.engineGain.gain.value = 0;
      this.engineOscillator.connect(this.engineGain).connect(context.destination);
      this.engineOscillator.start();
    }
    if (!this.engineOscillator || !this.engineGain) return;
    const now = context.currentTime;
    this.engineOscillator.frequency.setTargetAtTime(75 + speed * 1.35, now, 0.06);
    this.engineGain.gain.setTargetAtTime(active ? 0.013 + speed * 0.00009 : 0, now, 0.08);
    // Keep a single quiet oscillator alive between laps; this avoids rebuilding
    // audio nodes on every pause and keeps the generated engine sound lightweight.
  }

  toggle(): boolean {
    this.muted = !this.muted;
    if (this.muted) this.setEngine(0, false);
    else this.beep(840, 0.06);
    return this.muted;
  }
}
