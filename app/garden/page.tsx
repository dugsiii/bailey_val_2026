"use client";

import { useState, useEffect } from "react";

const BG_W = 1672;
const BG_H = 941;

const BAILEY_SLEEP_FRAMES = 8;
const BAILEY_SLEEP_FPS = 2;
const BAILEY_SLEEP_SIZE = 270;

const JESHUA_WATER_FRAMES = 6;
const JESHUA_WATER_FPS = 2;
const JESHUA_WATER_SIZE = 200;

export default function GardenPage() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () =>
      setScale(Math.max(window.innerWidth / BG_W, window.innerHeight / BG_H));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [baileyFrame, setBaileyFrame] = useState(0);
  useEffect(() => {
    const ms = (1000 / BAILEY_SLEEP_FPS);
    const id = setInterval(() => setBaileyFrame(f => (f + 1) % BAILEY_SLEEP_FRAMES), ms);
    return () => clearInterval(id);
  }, []);

  const [jeshuaFrame, setJeshuaFrame] = useState(0);
  useEffect(() => {
    const ms = 1000 / JESHUA_WATER_FPS;
    const id = setInterval(() => setJeshuaFrame(f => (f + 1) % JESHUA_WATER_FRAMES), ms);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/sprites/landing/garden/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: BG_W,
          height: BG_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* jeshua — watering */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "31%",
            transform: "translate(-50%, -50%)",
            width: JESHUA_WATER_SIZE,
            height: JESHUA_WATER_SIZE,
            backgroundImage: "url('/assets/sprites/landing/garden/jeshua_water.png')",
            backgroundSize: `${JESHUA_WATER_SIZE * JESHUA_WATER_FRAMES}px ${JESHUA_WATER_SIZE}px`,
            backgroundPosition: `-${jeshuaFrame * JESHUA_WATER_SIZE}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* bailey — sleeping in garden */}
        <div
          style={{
            position: "absolute",
            top: "57%",
            left: "68%",
            transform: "translate(-50%, -50%)",
            width: BAILEY_SLEEP_SIZE,
            height: BAILEY_SLEEP_SIZE,
            backgroundImage: "url('/assets/sprites/landing/garden/bailey_sleep_idle.png')",
            backgroundSize: `${BAILEY_SLEEP_SIZE * BAILEY_SLEEP_FRAMES}px ${BAILEY_SLEEP_SIZE}px`,
            backgroundPosition: `-${baileyFrame * BAILEY_SLEEP_SIZE}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />
      </div>
    </main>
  );
}
