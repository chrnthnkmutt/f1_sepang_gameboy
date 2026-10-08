import { RetroAudio } from "../audio/audio";
import type { Button, GameState, Racer } from "../types";
import { turnAt } from "../track/sepang";

const LAPS = 3;
const CAR_COLORS = ["#f14d43", "#ffc545", "#53c7ff", "#f4f1df", "#bd70ff"];

function makeRacer(name: string, color: string, progress: number, lane: number, isPlayer = false): Racer {
  return { name, color, progress, speed: 0, lane, isPlayer, lapStart: 0, bestLap: null, lastLap: null };
}

function initialState(): GameState {
  return {
    mode: "title", menuIndex: 0, muted: false,
    player: makeRacer("YOU", "#ec4354", 0, 0, true),
    opponents: [], lateral: 0, lateralVelocity: 0, elapsed: 0, raceStart: 0,
    countdown: 3, countdownLabel: "3", lapsToRun: LAPS, lap: 1, checkpoint: 0,
    collisionFlash: 0, message: "", messageTime: 0,
  };
}

export class GameEngine {
  readonly audio = new RetroAudio();
  state: GameState = initialState();
  private held = new Set<Button>();
  private countdownPhase = 0;
  private lastCheckpoint = 0;
  private collisionCooldown = 0;

  isHeld(button: Button): boolean { return this.held.has(button); }

  press(button: Button): void {
    if (this.held.has(button)) return;
    this.held.add(button);
    this.audio.unlock();
    this.onPress(button);
  }

  release(button: Button): void { this.held.delete(button); }
  releaseAll(): void { this.held.clear(); }

  private onPress(button: Button): void {
    const state = this.state;
    if (button === "select") {
      state.muted = this.audio.toggle();
      state.message = state.muted ? "SOUND OFF" : "SOUND ON";
      state.messageTime = 1.1;
      return;
    }

    if (state.mode === "title") {
      if (button === "up" || button === "down") {
        state.menuIndex = (state.menuIndex + (button === "down" ? 1 : 2)) % 3;
        this.audio.beep(520, 0.045);
      } else if (button === "a" || button === "start" || button === "right") {
        this.activateMenu();
      }
      return;
    }
    if (state.mode === "controls" || state.mode === "about") {
      if (button === "b" || button === "start" || button === "a") state.mode = "title";
      return;
    }
    if (state.mode === "countdown") {
      if (button === "b") this.state.mode = "title";
      return;
    }
    if (state.mode === "racing") {
      if (button === "start") {
        state.mode = "paused";
        this.audio.setEngine(state.player.speed, false);
        this.audio.beep(390, 0.08);
      }
      return;
    }
    if (state.mode === "paused") {
      if (button === "start" || button === "a") {
        state.mode = "racing";
        this.audio.beep(760, 0.08);
      } else if (button === "b") {
        state.mode = "title";
        this.audio.setEngine(0, false);
      }
      return;
    }
    if (state.mode === "finish") {
      if (button === "a") this.startRace();
      else if (button === "b" || button === "start") state.mode = "title";
    }
  }

  private activateMenu(): void {
    this.audio.beep(760, 0.08);
    if (this.state.menuIndex === 0) this.startRace();
    else if (this.state.menuIndex === 1) this.state.mode = "controls";
    else this.state.mode = "about";
  }

  private startRace(): void {
    const muted = this.state.muted;
    const state = initialState();
    state.mode = "countdown";
    state.muted = muted;
    this.audio.muted = muted;
    state.countdown = 3;
    state.countdownLabel = "3";
    state.player = makeRacer("YOU", "#ec4354", 0, 0, true);
    state.opponents = [
      makeRacer("M. TAN", CAR_COLORS[0], 0.012, -0.52),
      makeRacer("A. LIM", CAR_COLORS[1], 0.026, 0.53),
      makeRacer("K. LEE", CAR_COLORS[2], -0.012, -0.56),
      makeRacer("R. HADI", CAR_COLORS[3], -0.026, 0.55),
      makeRacer("S. WONG", CAR_COLORS[4], -0.041, 0.02),
    ];
    this.state = state;
    this.countdownPhase = 0;
    this.lastCheckpoint = 0;
    this.collisionCooldown = 0;
    this.audio.beep(560, 0.08);
  }

  position(): number {
    let ahead = 0;
    for (const opponent of this.state.opponents) if (opponent.progress > this.state.player.progress) ahead += 1;
    return ahead + 1;
  }

  update(deltaSeconds: number): void {
    const dt = Math.min(0.05, Math.max(0, deltaSeconds));
    const state = this.state;
    state.collisionFlash = Math.max(0, state.collisionFlash - dt);
    state.messageTime = Math.max(0, state.messageTime - dt);

    if (state.mode === "countdown") {
      this.countdownPhase += dt;
      const whole = Math.floor(this.countdownPhase);
      const labels = ["3", "2", "1", "GO!"];
      state.countdownLabel = labels[Math.min(3, whole)];
      state.countdown = Math.max(0, 3 - whole);
      if (whole < 3 && this.countdownPhase >= whole && Math.floor(this.countdownPhase - dt) < whole) {
        this.audio.beep(whole === 2 ? 920 : 650, 0.15);
      }
      if (this.countdownPhase >= 3.6) {
        state.mode = "racing";
        state.elapsed = 0;
        state.raceStart = performance.now() / 1000;
        state.player.lapStart = 0;
        for (const opponent of state.opponents) opponent.lapStart = 0;
        this.audio.beep(1150, 0.28, "sawtooth");
      }
      return;
    }

    if (state.mode !== "racing") return;
    state.elapsed += dt;
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);

    const accelerating = this.isHeld("a") || this.isHeld("up");
    const braking = this.isHeld("b") || this.isHeld("down");
    const steering = (this.isHeld("right") ? 1 : 0) - (this.isHeld("left") ? 1 : 0);
    const player = state.player;
    if (accelerating) player.speed += 172 * dt;
    else player.speed -= 38 * dt;
    if (braking) player.speed -= 245 * dt;
    player.speed = Math.max(0, Math.min(280, player.speed));

    state.lateralVelocity += steering * (1.7 + player.speed / 205) * dt;
    state.lateralVelocity *= Math.pow(0.11, dt);
    state.lateral += state.lateralVelocity * dt * 2.1;
    state.lateral = Math.max(-1.6, Math.min(1.6, state.lateral));

    const turn = Math.abs(turnAt(player.progress));
    const maxSpeedOnBend = 270 - turn * 65;
    if (player.speed > maxSpeedOnBend) player.speed -= (player.speed - maxSpeedOnBend) * dt * 0.9;
    if (Math.abs(state.lateral) > 0.92) {
      player.speed = Math.max(38, player.speed - 125 * dt);
      state.lateralVelocity -= Math.sign(state.lateral) * 0.25 * dt;
      if (state.messageTime <= 0.1) {
        state.message = "RUNOFF!";
        state.messageTime = 0.3;
      }
    }
    state.lateral *= Math.pow(0.997, dt * 60);

    const oldLap = Math.floor(player.progress);
    player.progress += (player.speed / 280) * 0.026 * dt;
    if (Math.floor(player.progress) > oldLap) {
      player.lastLap = state.elapsed - player.lapStart;
      player.bestLap = player.bestLap === null ? player.lastLap : Math.min(player.bestLap, player.lastLap);
      player.lapStart = state.elapsed;
      this.audio.beep(1040, 0.18, "triangle");
      state.message = "LAP COMPLETE";
      state.messageTime = 1.3;
      state.lap = Math.floor(player.progress) + 1;
      if (Math.floor(player.progress) >= state.lapsToRun) {
        state.mode = "finish";
        this.audio.setEngine(0, false);
        this.audio.beep(1320, 0.45, "triangle");
        return;
      }
    }

    const checkpoint = Math.floor((player.progress % 1) * 4);
    if (checkpoint !== this.lastCheckpoint) {
      this.lastCheckpoint = checkpoint;
      state.checkpoint = checkpoint + 1;
      this.audio.beep(740, 0.055, "triangle");
    }

    this.updateOpponents(dt);
    this.resolveCollisions(dt);
    this.audio.setEngine(player.speed, true);
  }

  private updateOpponents(dt: number): void {
    const playerProgress = this.state.player.progress;
    for (let i = 0; i < this.state.opponents.length; i += 1) {
      const opponent = this.state.opponents[i];
      const bend = Math.abs(turnAt(opponent.progress));
      const variation = Math.sin(opponent.progress * 31 + i * 4.1) * 4;
      const target = 178 + (i % 3) * 11 + variation - bend * 27;
      opponent.speed += Math.max(-80, Math.min(80, target - opponent.speed)) * dt * 1.25;
      const wasLap = Math.floor(opponent.progress);
      opponent.progress += (opponent.speed / 280) * 0.026 * dt;
      if (Math.floor(opponent.progress) > wasLap) {
        opponent.lastLap = this.state.elapsed - opponent.lapStart;
        opponent.bestLap = opponent.bestLap === null ? opponent.lastLap : Math.min(opponent.bestLap, opponent.lastLap);
        opponent.lapStart = this.state.elapsed;
      }
      // The pack settles into a slightly varied pace, while preserving its start order.
      if (opponent.progress - playerProgress > 2.9) opponent.progress -= 0.002;
    }
  }

  private resolveCollisions(dt: number): void {
    if (this.collisionCooldown > 0) return;
    const state = this.state;
    for (const opponent of state.opponents) {
      const distance = opponent.progress - state.player.progress;
      if (Math.abs(distance) < 0.012 && Math.abs(state.lateral - opponent.lane) < 0.46) {
        state.player.speed = Math.max(35, state.player.speed * 0.58);
        state.lateralVelocity += (state.lateral >= opponent.lane ? 1 : -1) * 1.8;
        opponent.speed = Math.max(80, opponent.speed * 0.78);
        state.collisionFlash = 0.38;
        state.message = "CONTACT!";
        state.messageTime = 0.8;
        this.collisionCooldown = Math.max(0.4, dt * 8);
        this.audio.beep(170, 0.11, "square");
        break;
      }
    }
  }
}
