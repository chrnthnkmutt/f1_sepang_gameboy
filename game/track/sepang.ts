export interface Point { x: number; y: number }

// A compact racing line traced from the supplied Sepang map. The outer sweeper,
// long straight, T1/T2 complex, lower hairpins and final sector are all retained.
export const SEPANG_MAP_POINTS: Point[] = [
  { x: 18, y: 151 }, { x: 66, y: 151 }, { x: 125, y: 149 }, { x: 190, y: 147 },
  { x: 253, y: 145 }, { x: 280, y: 144 }, { x: 295, y: 148 }, { x: 311, y: 160 },
  { x: 323, y: 176 }, { x: 319, y: 184 }, { x: 306, y: 187 }, { x: 274, y: 185 },
  { x: 239, y: 184 }, { x: 214, y: 184 }, { x: 201, y: 190 }, { x: 197, y: 199 },
  { x: 204, y: 211 }, { x: 204, y: 229 }, { x: 190, y: 258 }, { x: 174, y: 245 },
  { x: 153, y: 226 }, { x: 135, y: 215 }, { x: 121, y: 212 }, { x: 106, y: 217 },
  { x: 89, y: 229 }, { x: 70, y: 236 }, { x: 52, y: 226 }, { x: 36, y: 210 },
  { x: 31, y: 199 }, { x: 39, y: 191 }, { x: 58, y: 186 }, { x: 82, y: 180 },
  { x: 110, y: 173 }, { x: 142, y: 165 }, { x: 174, y: 157 }, { x: 190, y: 151 },
  { x: 187, y: 140 }, { x: 178, y: 129 }, { x: 179, y: 111 }, { x: 188, y: 94 },
  { x: 205, y: 88 }, { x: 222, y: 84 }, { x: 238, y: 73 }, { x: 254, y: 73 },
  { x: 270, y: 81 }, { x: 285, y: 96 }, { x: 298, y: 114 }, { x: 307, y: 132 },
  { x: 295, y: 141 }, { x: 281, y: 144 }, { x: 264, y: 133 }, { x: 248, y: 119 },
  { x: 231, y: 101 }, { x: 212, y: 91 }, { x: 191, y: 87 }, { x: 177, y: 76 },
  { x: 169, y: 56 }, { x: 163, y: 28 }, { x: 157, y: 9 }, { x: 143, y: 18 },
  { x: 112, y: 31 }, { x: 78, y: 43 }, { x: 50, y: 55 }, { x: 31, y: 69 },
  { x: 20, y: 89 }, { x: 17, y: 109 }, { x: 17, y: 128 }, { x: 28, y: 142 },
  { x: 18, y: 151 },
];

// The drivable ribbon uses one continuous simplified lap with real Sepang
// landmarks; the full supplied contour is drawn in the minimap for recognition.
export const RACING_LINE: Point[] = [
  { x: 18, y: 151 }, { x: 83, y: 150 }, { x: 158, y: 148 }, { x: 253, y: 145 },
  { x: 282, y: 144 }, { x: 300, y: 150 }, { x: 317, y: 168 }, { x: 323, y: 178 },
  { x: 313, y: 185 }, { x: 279, y: 185 }, { x: 238, y: 184 }, { x: 211, y: 184 },
  { x: 199, y: 192 }, { x: 202, y: 206 }, { x: 204, y: 226 }, { x: 190, y: 258 },
  { x: 165, y: 236 }, { x: 138, y: 216 }, { x: 120, y: 212 }, { x: 104, y: 219 },
  { x: 82, y: 233 }, { x: 63, y: 232 }, { x: 43, y: 217 }, { x: 32, y: 201 },
  { x: 28, y: 187 }, { x: 18, y: 174 }, { x: 13, y: 160 }, { x: 17, y: 145 },
  { x: 17, y: 125 }, { x: 20, y: 99 }, { x: 31, y: 75 }, { x: 53, y: 57 },
  { x: 83, y: 44 }, { x: 119, y: 31 }, { x: 148, y: 16 }, { x: 158, y: 10 },
  { x: 164, y: 36 }, { x: 169, y: 62 }, { x: 180, y: 80 }, { x: 197, y: 88 },
  { x: 217, y: 84 }, { x: 237, y: 72 }, { x: 255, y: 73 }, { x: 274, y: 85 },
  { x: 291, y: 105 }, { x: 304, y: 127 }, { x: 309, y: 142 }, { x: 291, y: 145 },
  { x: 265, y: 146 }, { x: 220, y: 148 }, { x: 171, y: 150 }, { x: 119, y: 151 },
  { x: 67, y: 151 }, { x: 18, y: 151 },
];

function catmull(a: number, b: number, c: number, d: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}

export const TRACK_SAMPLES: Point[] = (() => {
  const samples: Point[] = [];
  for (let i = 0; i < RACING_LINE.length; i += 1) {
    const a = RACING_LINE[(i - 1 + RACING_LINE.length) % RACING_LINE.length];
    const b = RACING_LINE[i];
    const c = RACING_LINE[(i + 1) % RACING_LINE.length];
    const d = RACING_LINE[(i + 2) % RACING_LINE.length];
    for (let j = 0; j < 8; j += 1) {
      const t = j / 8;
      samples.push({ x: catmull(a.x, b.x, c.x, d.x, t), y: catmull(a.y, b.y, c.y, d.y, t) });
    }
  }
  return samples;
})();

export function pointAt(progress: number): Point {
  const wrapped = ((progress % 1) + 1) % 1;
  const index = wrapped * TRACK_SAMPLES.length;
  const current = Math.floor(index);
  const next = (current + 1) % TRACK_SAMPLES.length;
  const t = index - current;
  return {
    x: TRACK_SAMPLES[current].x + (TRACK_SAMPLES[next].x - TRACK_SAMPLES[current].x) * t,
    y: TRACK_SAMPLES[current].y + (TRACK_SAMPLES[next].y - TRACK_SAMPLES[current].y) * t,
  };
}

export function tangentAt(progress: number): number {
  const before = pointAt(progress - 0.003);
  const after = pointAt(progress + 0.003);
  return Math.atan2(after.y - before.y, after.x - before.x);
}

export function turnAt(progress: number): number {
  let difference = tangentAt(progress + 0.012) - tangentAt(progress - 0.012);
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return Math.max(-1, Math.min(1, difference * 1.2));
}
