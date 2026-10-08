# Sepang Pocket Grand Prix

A playable, original pixel-art racing game inspired by late-1990s handheld racers. It runs in a 320 × 288 canvas inside a responsive handheld console UI and is built with Next.js, React, TypeScript, and the Web Audio API.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Deploy the project directly to Vercel as a Next.js app.

## Controls

| Game Boy control | Keyboard | Action |
| --- | --- | --- |
| D-Pad left / right | Arrow keys | Steer |
| D-Pad up | Arrow Up | Accelerate |
| D-Pad down | Arrow Down | Brake |
| A | Z | Accelerate / confirm |
| B | X | Brake / back |
| START | Enter | Start / pause / resume |
| SELECT | Shift | Toggle generated audio |

Touch controls use the same actions. In the title menu, use up/down to choose an item and A or START to open it.

## Structure

- `game/engine`: race states, arcade physics, AI pace, collision and lap handling
- `game/track`: simplified Sepang racing line and sampled track geometry
- `game/rendering`: low-resolution road view, track map, sprites, menu and HUD
- `game/audio`: generated engine tone and retro sound effects
- `components/VirtualGameBoy.tsx`: keyboard, pointer and canvas loop integration
- `app`: Next.js page, metadata and responsive console styling

The game uses original code and drawn assets; it does not load a ROM or proprietary game files.
