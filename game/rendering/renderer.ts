import type { GameState, Racer } from "../types";
import { pointAt, SEPANG_MAP_POINTS, tangentAt, turnAt } from "../track/sepang";

const W = 320;
const H = 288;
const INK = "#101c35";
const MINT = "#c8ee9e";
const SKY = "#8bd6dd";
const GRASS = "#55a875";
const ROAD = "#343c54";
const CREAM = "#fff1c2";

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h));
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size = 9, color = CREAM, align: CanvasTextAlign = "left"): void {
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = color;
  ctx.fillText(value, Math.round(x), Math.round(y));
}

function border(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "#375075"): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawHeader(ctx: CanvasRenderingContext2D, title: string, subtitle: string): void {
  rect(ctx, 0, 0, W, H, "#15233d");
  rect(ctx, 0, 0, W, 21, "#213958");
  text(ctx, "POCKET GRAND PRIX", 10, 6, 9, "#d9f5cb");
  text(ctx, "MALAYSIA  /  96", 309, 6, 8, "#ffca62", "right");
  rect(ctx, 0, 21, W, 1, "#96d7bc");
  text(ctx, title, W / 2, 34, 16, CREAM, "center");
  text(ctx, subtitle, W / 2, 55, 8, "#94cdd6", "center");
}

function drawSepangIllustration(ctx: CanvasRenderingContext2D, x: number, y: number, scaleX: number, scaleY = scaleX): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  SEPANG_MAP_POINTS.forEach((point, index) => {
    const px = point.x;
    const py = point.y;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = "#15233d";
  ctx.lineWidth = 16;
  ctx.stroke();
  ctx.strokeStyle = "#a0dbb4";
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.strokeStyle = "#fff3cd";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, state: GameState): void {
  drawHeader(ctx, "SEPANG GRAND PRIX", "A POCKET-SIZE RACE THROUGH MALAYSIA");
  drawSepangIllustration(ctx, 80, 74, 0.5, 0.40);
  rect(ctx, 19, 188, 282, 1, "#375075");
  const items = ["START RACE", "CONTROLS", "ABOUT"];
  items.forEach((item, index) => {
    const y = 202 + index * 20;
    if (state.menuIndex === index) {
      rect(ctx, 63, y - 2, 194, 17, "#e14b60");
      text(ctx, "▶", 75, y + 1, 9, CREAM);
      text(ctx, item, 93, y, 10, CREAM);
    } else text(ctx, item, 93, y, 10, "#9eb5c0");
  });
  text(ctx, "↑↓ CHOOSE     A / START ENTER", 160, 267, 7, "#76929f", "center");
}

function drawControls(ctx: CanvasRenderingContext2D): void {
  drawHeader(ctx, "HOW TO DRIVE", "EVERYTHING YOU NEED IS ON THE HANDHELD");
  const rows = [
    ["D-PAD  ← →", "STEER THROUGH THE CORNERS"],
    ["D-PAD  ↑", "ACCELERATE"],
    ["D-PAD  ↓", "BRAKE"],
    ["A", "ACCELERATE"],
    ["B", "BRAKE / BACK"],
    ["START", "PAUSE / RESUME"],
    ["SELECT", "TOGGLE SOUND"],
  ];
  rows.forEach(([key, description], index) => {
    const y = 78 + index * 23;
    rect(ctx, 22, y, 70, 17, index % 2 ? "#263b56" : "#304765");
    text(ctx, key, 28, y + 4, 8, "#ffe082");
    text(ctx, description, 104, y + 4, 7, CREAM);
  });
  text(ctx, "3 LAPS  •  5 RIVALS  •  4 CHECKPOINTS", 160, 253, 7, "#9dd4c5", "center");
  text(ctx, "PRESS B TO RETURN", 160, 270, 8, "#91a8b6", "center");
}

function drawAbout(ctx: CanvasRenderingContext2D): void {
  drawHeader(ctx, "ABOUT THE RACE", "A SMALL TRIBUTE TO HANDHELD ARCADE RACERS");
  drawSepangIllustration(ctx, 73, 80, 0.53, 0.39);
  text(ctx, "SEPANG INTERNATIONAL CIRCUIT", 160, 190, 9, CREAM, "center");
  text(ctx, "KUALA LUMPUR  •  MALAYSIA", 160, 208, 8, "#8ec9c6", "center");
  text(ctx, "ORIGINAL PIXEL ART  /  ORIGINAL GAME", 160, 237, 7, "#9baebb", "center");
  text(ctx, "PRESS B TO RETURN", 160, 265, 8, "#91a8b6", "center");
}

function roadCenter(y: number, curve: number): number {
  const depth = Math.max(0, Math.min(1, (151 - y) / 96));
  return 160 - curve * 75 * depth * depth;
}

function roadWidth(y: number): number {
  const amount = Math.max(0, Math.min(1, (y - 57) / 100));
  return 22 + amount * 116;
}

function drawScenery(ctx: CanvasRenderingContext2D, time: number, curve: number): void {
  rect(ctx, 0, 22, W, 36, SKY);
  rect(ctx, 0, 58, W, 108, GRASS);
  rect(ctx, 0, 52, W, 7, "#76bd91");
  // Distant pixel hills and a few palm silhouettes.
  for (let i = 0; i < 8; i += 1) {
    const hx = ((i * 53 + 17) % 350) - 15;
    const hy = 48 + (i % 3) * 4;
    rect(ctx, hx, hy, 29, 10, i % 2 ? "#65ae93" : "#54a189");
    rect(ctx, hx + 5, hy - 4, 17, 5, i % 2 ? "#65ae93" : "#54a189");
  }
  const scroll = Math.floor(time * 38) % 29;
  for (let i = 0; i < 5; i += 1) {
    const y = 73 + i * 21 + scroll;
    if (y > 161) continue;
    const center = roadCenter(y, curve);
    const half = roadWidth(y);
    const spread = 32 + (y - 60) * 0.7;
    for (const side of [-1, 1]) {
      const x = center + side * (half + spread);
      rect(ctx, x - 2, y - 8, 4, 8, "#704d3a");
      rect(ctx, x - 6, y - 16, 12, 10, i % 2 ? "#236e64" : "#2a7e62");
      rect(ctx, x - 4, y - 20, 8, 5, "#318c70");
    }
  }
}

function drawRoad(ctx: CanvasRenderingContext2D, time: number, curve: number): void {
  // Fill perspective strips so the road bends with the circuit.
  ctx.beginPath();
  for (let y = 57; y <= 160; y += 4) {
    const center = roadCenter(y, curve);
    const edge = roadWidth(y);
    if (y === 57) ctx.moveTo(center - edge, y);
    else ctx.lineTo(center - edge, y);
  }
  for (let y = 160; y >= 57; y -= 4) {
    ctx.lineTo(roadCenter(y, curve) + roadWidth(y), y);
  }
  ctx.closePath();
  ctx.fillStyle = ROAD;
  ctx.fill();

  const stripe = Math.floor(time * 42) % 18;
  for (let y = 58; y < 160; y += 9) {
    const offsetY = (y + stripe) % 18;
    const actualY = y - offsetY + 9;
    if (actualY < 58 || actualY > 159) continue;
    const center = roadCenter(actualY, curve);
    const width = roadWidth(actualY);
    const block = 4 + (actualY - 58) * 0.055;
    rect(ctx, center - width / 2 - block, actualY, block, 5 + (actualY - 58) * 0.025, "#f0cf7d");
    rect(ctx, center + width / 2, actualY, block, 5 + (actualY - 58) * 0.025, "#f0cf7d");
    const band = Math.floor((actualY + stripe) / 8) % 2;
    if (band === 0) {
      rect(ctx, center - width / 2 - block, actualY, block, 2, "#d45459");
      rect(ctx, center + width / 2, actualY + 2, block, 2, "#d45459");
    }
  }
  // Broken center line.
  for (let y = 65; y < 157; y += 17) {
    const actualY = y + (stripe % 17);
    if (actualY > 158) continue;
    const center = roadCenter(actualY, curve);
    const dash = 2 + (actualY - 58) * 0.024;
    rect(ctx, center - dash / 2, actualY, dash, 5 + (actualY - 58) * 0.025, "#f5e3aa");
  }
  // A start gantry becomes visible on the final approach.
  const startDistance = (1 - ((time * 0.026 * 0.64) % 1));
  if (startDistance < 0.06) {
    const y = 58 + startDistance * 1500;
    if (y < 111) {
      const center = roadCenter(y, curve);
      rect(ctx, center - 42, y, 84, 3, "#e8edf0");
      rect(ctx, center - 39, y + 3, 78, 3, "#182640");
      for (let i = 0; i < 8; i += 1) rect(ctx, center - 37 + i * 10, y + 3, 5, 3, i % 2 ? "#f7f0da" : "#28334a");
    }
  }
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string, player = false): void {
  const width = 20 * scale;
  const height = 19 * scale;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);
  rect(ctx, -11, -3, 7, 5, INK);
  rect(ctx, 4, -3, 7, 5, INK);
  rect(ctx, -11, 10, 7, 5, INK);
  rect(ctx, 4, 10, 7, 5, INK);
  rect(ctx, -5, -9, 10, 22, color);
  rect(ctx, -8, -4, 16, 8, color);
  rect(ctx, -5, -8, 10, 4, player ? "#fff1ca" : "#c9e2e9");
  rect(ctx, -4, 1, 8, 5, "#29465d");
  rect(ctx, -8, 6, 16, 3, color);
  rect(ctx, -3, -12, 6, 4, color);
  rect(ctx, -8, 13, 16, 3, INK);
  if (player) {
    rect(ctx, -1, 4, 2, 7, "#ffe27d");
    rect(ctx, -7, -10, 3, 2, "#fb6d71");
    rect(ctx, 4, -10, 3, 2, "#fb6d71");
  }
  ctx.restore();
  void width; void height;
}

function drawTraffic(ctx: CanvasRenderingContext2D, state: GameState, curve: number): void {
  const centerAt = (y: number) => roadCenter(y, curve);
  for (const opponent of state.opponents) {
    const ahead = ((opponent.progress - state.player.progress) % 1 + 1) % 1;
    if (ahead > 0.30) continue;
    const proximity = 1 - ahead / 0.30;
    const y = 65 + proximity * 80;
    const halfRoad = roadWidth(y);
    const laneX = centerAt(y) + opponent.lane * Math.min(halfRoad * 0.58, 46);
    drawCar(ctx, laneX, y, 0.44 + proximity * 0.54, opponent.color);
  }
}

function drawTrackMap(ctx: CanvasRenderingContext2D, state: GameState, blink: number): void {
  const x = 7; const y = 185; const w = 190; const h = 96;
  rect(ctx, x, y, w, h, "#0d1930");
  border(ctx, x, y, w, h, "#47617a");
  text(ctx, "SEPANG  /  5.543 KM", x + 6, y + 5, 7, "#b8dcae");
  const mapW = 132; const mapH = h - 27;
  const mapX = x + (w - mapW) / 2; const mapY = y + 19;
  const mapPoint = (point: { x: number; y: number }) => ({
    x: mapX + (point.x / 330) * mapW,
    y: mapY + (point.y / 270) * mapH,
  });
  ctx.beginPath();
  SEPANG_MAP_POINTS.forEach((point, index) => {
    const p = mapPoint(point);
    if (index === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = "#35435a";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.strokeStyle = "#c9e6c3";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#76d1cd";
  ctx.lineWidth = 1;
  ctx.stroke();
  const startFinish = mapPoint({ x: 18, y: 151 });
  ctx.strokeStyle = "#fff4d1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startFinish.x, startFinish.y - 3);
  ctx.lineTo(startFinish.x, startFinish.y + 3);
  ctx.stroke();
  text(ctx, "S/F", startFinish.x + 3, startFinish.y - 8, 5, "#ffe082");
  for (let i = 1; i < 4; i += 1) {
    const checkpoint = mapPoint(pointAt(i / 4));
    rect(ctx, checkpoint.x - 1, checkpoint.y - 1, 2, 2, "#ffd169");
  }
  for (const opponent of state.opponents) {
    const p = mapPoint(pointAt(opponent.progress));
    rect(ctx, p.x - 1, p.y - 1, 3, 3, opponent.color);
  }
  const player = mapPoint(pointAt(state.player.progress));
  const angle = tangentAt(state.player.progress);
  const nx = -Math.sin(angle) * state.lateral * 3;
  const ny = Math.cos(angle) * state.lateral * 3;
  rect(ctx, player.x + nx - 2, player.y + ny - 2, 5, 5, blink % 0.5 < 0.25 ? "#ffdf72" : "#e94e62");
}

function fmtTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  const hundredths = Math.floor((time % 1) * 100).toString().padStart(2, "0");
  return `${minutes}:${seconds}.${hundredths}`;
}

function drawRaceHud(ctx: CanvasRenderingContext2D, state: GameState, position: number): void {
  rect(ctx, 0, 172, W, 116, "#13223b");
  rect(ctx, 0, 172, W, 2, "#a3d8c0");
  drawTrackMap(ctx, state, state.elapsed);
  const x = 204;
  rect(ctx, x, 185, 109, 96, "#263954");
  border(ctx, x, 185, 109, 96, "#47617a");
  text(ctx, "SPEED", x + 7, 191, 7, "#91bcc4");
  text(ctx, `${Math.round(state.player.speed)} km/h`, x + 7, 202, 13, CREAM);
  text(ctx, "LAP", x + 7, 222, 7, "#91bcc4");
  text(ctx, `${Math.min(state.lap, state.lapsToRun)} / ${state.lapsToRun}`, x + 7, 232, 11, CREAM);
  text(ctx, "POS", x + 62, 222, 7, "#91bcc4");
  text(ctx, `${position} / 6`, x + 62, 232, 11, "#ffcf68");
  text(ctx, "LAP TIME", x + 7, 250, 7, "#91bcc4");
  text(ctx, fmtTime(state.elapsed - state.player.lapStart), x + 7, 260, 9, CREAM);
  const best = state.player.bestLap === null ? "--:--.--" : fmtTime(state.player.bestLap);
  text(ctx, `BEST ${best}`, x + 7, 272, 6, "#ffdc7a");
  text(ctx, `CP ${state.checkpoint}/4`, x + 101, 272, 6, "#b5e6b0", "right");
}

function drawRace(ctx: CanvasRenderingContext2D, state: GameState, position: number, time: number): void {
  const curve = turnAt(state.player.progress);
  drawScenery(ctx, time, curve);
  drawRoad(ctx, time, curve);
  drawTraffic(ctx, state, curve);
  const playerX = roadCenter(150, curve) - state.lateral * 73;
  drawCar(ctx, playerX, 148, 1.16, state.player.color, true);
  rect(ctx, 0, 22, W, 16, "#15233dbb");
  text(ctx, "SEPANG INTERNATIONAL", 7, 26, 7, CREAM);
  text(ctx, `LAP ${Math.min(state.lap, state.lapsToRun)}/${state.lapsToRun} · ${fmtTime(state.elapsed)}`, 313, 26, 7, "#ffdc7a", "right");
  if (state.messageTime > 0) {
    const message = state.message;
    const boxWidth = Math.max(76, message.length * 7 + 18);
    rect(ctx, 160 - boxWidth / 2, 88, boxWidth, 18, "#e44e63");
    text(ctx, message, 160, 92, 8, CREAM, "center");
  }
  if (state.collisionFlash > 0) {
    rect(ctx, 0, 0, W, 4, "#ff6f6b");
  }
  drawRaceHud(ctx, state, position);
}

function drawOverlay(ctx: CanvasRenderingContext2D, title: string, lines: string[], footer: string): void {
  const height = lines.length >= 4 ? 144 : 118;
  const top = (H - height) / 2;
  rect(ctx, 45, top, 230, height, "#15233d");
  rect(ctx, 48, top + 3, 224, height - 6, "#263b56");
  border(ctx, 45, top, 230, height, "#f2d37e");
  text(ctx, title, 160, top + 14, 16, CREAM, "center");
  lines.forEach((line, index) => text(ctx, line, 160, top + 45 + index * 16, 8, "#b9d8ce", "center"));
  if (footer) text(ctx, footer, 160, top + height - 18, 8, "#ffcf68", "center");
}

function drawFinish(ctx: CanvasRenderingContext2D, state: GameState, position: number, time: number): void {
  drawRace(ctx, state, position, time);
  rect(ctx, 0, 22, W, 266, "#0e193b99");
  const positionLabel = ["1ST", "2ND", "3RD", "4TH", "5TH", "6TH"][position - 1] ?? `${position}TH`;
  drawOverlay(ctx, "RACE FINISHED", [
    `FINISH POSITION  ${positionLabel}`,
    `RACE TIME  ${fmtTime(state.elapsed)}`,
    `BEST LAP  ${state.player.bestLap ? fmtTime(state.player.bestLap) : "--:--.--"}`,
    `LAPS COMPLETED  ${state.lapsToRun}`,
  ], "A  RETRY     B / START  MENU");
}

export function renderGame(canvas: HTMLCanvasElement, state: GameState, position: number, time: number): void {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  if (state.mode === "title") drawTitle(ctx, state);
  else if (state.mode === "controls") drawControls(ctx);
  else if (state.mode === "about") drawAbout(ctx);
  else if (state.mode === "countdown") {
    drawRace(ctx, state, position, time);
    const label = state.countdownLabel;
    drawOverlay(ctx, label, ["STARTING GRID", "SEPANG  •  3 LAPS", "A / ↑ ACCELERATE   B / ↓ BRAKE"], "");
  } else if (state.mode === "racing") drawRace(ctx, state, position, time);
  else if (state.mode === "paused") {
    drawRace(ctx, state, position, time);
    drawOverlay(ctx, "PAUSED", ["PRESS START TO RESUME", "B RETURNS TO MENU"], "");
  } else drawFinish(ctx, state, position, time);
}

export function positionOf(state: GameState): number {
  let position = 1;
  for (const opponent of state.opponents) if (opponent.progress > state.player.progress) position += 1;
  return position;
}

export function leader(racers: Racer[]): Racer | null {
  return racers.reduce<Racer | null>((best, racer) => (!best || racer.progress > best.progress ? racer : best), null);
}
