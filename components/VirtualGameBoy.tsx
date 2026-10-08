"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { GameEngine } from "../game/engine/engine";
import type { Button } from "../game/types";
import { renderGame, positionOf } from "../game/rendering/renderer";

const KEY_TO_BUTTON: Record<string, Button> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  z: "a", Z: "a", x: "b", X: "b", Enter: "start", Shift: "select",
};

const CONTROL_HINTS: { button: Button; key: string }[] = [
  { button: "up", key: "↑" }, { button: "down", key: "↓" },
  { button: "left", key: "←" }, { button: "right", key: "→" },
  { button: "a", key: "Z" }, { button: "b", key: "X" },
  { button: "start", key: "ENTER" }, { button: "select", key: "SHIFT" },
];

export default function VirtualGameBoy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) engineRef.current = new GameEngine();
  const engine = engineRef.current;
  const [pressed, setPressed] = useState<Set<Button>>(() => new Set());

  const hold = useCallback((button: Button) => {
    engine.press(button);
    setPressed((current) => new Set(current).add(button));
  }, [engine]);

  const release = useCallback((button: Button) => {
    engine.release(button);
    setPressed((current) => {
      const next = new Set(current);
      next.delete(button);
      return next;
    });
  }, [engine]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const button = KEY_TO_BUTTON[event.key];
      if (!button) return;
      event.preventDefault();
      if (event.repeat) return;
      hold(button);
    };
    const keyUp = (event: KeyboardEvent) => {
      const button = KEY_TO_BUTTON[event.key];
      if (button) release(button);
    };
    const clear = () => {
      engine.releaseAll();
      setPressed(new Set());
    };
    window.addEventListener("keydown", keyDown, { passive: false });
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clear);

    let animation = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      engine.update(dt);
      const canvas = canvasRef.current;
      if (canvas) renderGame(canvas, engine.state, positionOf(engine.state), now / 1000);
      animation = window.requestAnimationFrame(frame);
    };
    animation = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clear);
      engine.releaseAll();
    };
  }, [engine, hold, release]);

  const pointerProps = (button: Button) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      hold(button);
    },
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      release(button);
    },
    onPointerCancel: () => release(button),
    onLostPointerCapture: () => release(button),
    onContextMenu: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
  });

  const button = (id: Button, label: string, className: string, keyHint?: string) => (
    <button
      type="button"
      aria-label={`${label}${keyHint ? `, keyboard ${keyHint}` : ""}`}
      className={`physical-control ${className}${pressed.has(id) ? " is-pressed" : ""}`}
      {...pointerProps(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="console-wrap">
      <div className="console-shell">
        <div className="shell-topline">
          <span className="power-dot" />
          <span>POWER</span>
          <span className="screen-spec">DOT MATRIX DISPLAY · STEREO SOUND</span>
        </div>

        <div className="bezel">
          <div className="screen-caption"><i /> SEPANG GRAND PRIX <i /></div>
          <div className="screen-window">
            <canvas ref={canvasRef} width={320} height={288} aria-label="Sepang Grand Prix game screen" />
          </div>
          <div className="screen-lower-line"><span>COLOR</span><span>POCKET RACING SYSTEM</span></div>
        </div>

        <div className="brand-line">
          <span className="brand-mark">POCKET</span>
          <span className="brand-name">GRAND PRIX</span>
          <span className="brand-edition">™</span>
        </div>

        <div className="controls-area">
          <div className="dpad" aria-label="Directional pad">
            <div className="dpad-cross">
              {button("up", "▲", "dpad-up", "Arrow Up")}
              {button("left", "◀", "dpad-left", "Arrow Left")}
              <div className="dpad-center"><span /></div>
              {button("right", "▶", "dpad-right", "Arrow Right")}
              {button("down", "▼", "dpad-down", "Arrow Down")}
            </div>
          </div>
          <div className="action-cluster" aria-label="Action buttons">
            <div className="action-button-wrap">
              {button("b", "B", "action-b", "X")}
              <span className="button-caption">BRAKE</span>
            </div>
            <div className="action-button-wrap action-a-wrap">
              {button("a", "A", "action-a", "Z")}
              <span className="button-caption">GO</span>
            </div>
          </div>
        </div>

        <div className="middle-controls">
          <div className="small-button-wrap">
            {button("select", "SELECT", "small-button select-button", "Shift")}
          </div>
          <div className="small-button-wrap">
            {button("start", "START", "small-button start-button", "Enter")}
          </div>
        </div>

        <div className="shell-bottom">
          <div className="speaker" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
          </div>
          <div className="shell-screw screw-left" />
          <div className="shell-screw screw-right" />
          <span className="model-tag">SGP-96</span>
        </div>
      </div>

      <div className="control-legend" aria-label="Keyboard controls">
        {CONTROL_HINTS.map(({ button: id, key }) => (
          <span key={id}><b>{id === "a" || id === "b" ? id.toUpperCase() : id.toUpperCase()}</b>{key}</span>
        ))}
      </div>
      <p className="play-note">D-Pad steer · A / ↑ accelerate · B / ↓ brake · START pause · SELECT sound</p>
    </div>
  );
}
