export type Button = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select";
export type GameMode = "title" | "controls" | "about" | "countdown" | "racing" | "paused" | "finish";

export interface Racer {
  name: string;
  color: string;
  progress: number;
  speed: number;
  lane: number;
  isPlayer?: boolean;
  lapStart: number;
  bestLap: number | null;
  lastLap: number | null;
}

export interface GameState {
  mode: GameMode;
  menuIndex: number;
  muted: boolean;
  player: Racer;
  opponents: Racer[];
  lateral: number;
  lateralVelocity: number;
  elapsed: number;
  raceStart: number;
  countdown: number;
  countdownLabel: string;
  lapsToRun: number;
  lap: number;
  checkpoint: number;
  collisionFlash: number;
  message: string;
  messageTime: number;
}

export const BUTTON_LABELS: Record<Button, string> = {
  up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT",
  a: "A", b: "B", start: "START", select: "SELECT",
};
