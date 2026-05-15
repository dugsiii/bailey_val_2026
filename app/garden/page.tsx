"use client";

import { useState, useEffect } from "react";
import { assetUrl } from "@/lib/asset-paths";

const BG_W = 1672;
const BG_H = 941;

const BAILEY = { file: "bailey_sandwich", frames: 6, fps: 2, size: 150, top: "53%", left: "66%" } as const;

const JESHUA_WATER_FRAMES = 6;
const JESHUA_WATER_FPS = 2;
const JESHUA_WATER_SIZE = 200;

const BLANKET_W = 350;
const BLANKET_H = Math.round(BLANKET_W * (1086 / 1448));
const BASKET_SIZE = 120;
const WATERING_CAN_W = 120;
const WATERING_CAN_H = Math.round(WATERING_CAN_W * (1024 / 1536));
const FLOWER_POTS_W = 180;
const FLOWER_POTS_H = Math.round(FLOWER_POTS_W * (1024 / 1536));

const BASKET_TEXT = `Dear Bailey,

You are so caring and attentive to others, I fear you often forget to take care of yourself. You pour so much of yourself into others, not stopping to think of yourself. You model the self sacrificial attitude of Christ so well. 

I pray that as you pour into others, that Christ sustains you and gives you rest.

Jeshua
`;

const WATERING_CAN_TEXT = `Dear Bailey,

Remember to keep watering the plants in your garden. Even when it feels like nothing is changing, all the love, patience, and care you put in is helping something beautiful grow.

One day, you'll look around and realize you've built a beautiful garden.

I'm so proud of you, always.

With love,
Jeshua`;

const FLOWER_POTS_TEXT = `Dear Bailey,

When life starts to feel overwhelming, I hope you remember to stop and smell the flowers. Life can move so fast, but you deserve to notice the little beautiful things too.

Don't forget to enjoy moments of peace, joy, and quietness.

Rooting for you,
Jeshua`;

const TYPEWRITER_SPEED = 30;

type OverlayImage = { src: string } | null;

function useOverlay(text: string) {
  const [open, setOpen] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) { setCharIndex(0); setReady(false); return; }
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open || charIndex >= text.length) return;
    const id = setTimeout(() => setCharIndex(i => i + 1), TYPEWRITER_SPEED);
    return () => clearTimeout(id);
  }, [open, charIndex, text]);

  const skip = () => setCharIndex(text.length);
  const done = charIndex >= text.length;
  return { open, setOpen, charIndex, ready, done, skip };
}

type OverlayState = ReturnType<typeof useOverlay>;

function Overlay({ state, text, images }: { state: OverlayState; text: string; images: OverlayImage[] }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10, opacity: state.ready ? 1 : 0, transition: "opacity 0.4s ease", cursor: "pointer",
      }}
      onClick={() => state.done ? state.setOpen(false) : state.skip()}
    >
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", maxWidth: "80vw", pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", opacity: state.done ? 1 : 0, transition: "opacity 0.6s ease" }}>
          {images.map((img, i) => (
            <div key={i} style={{
              width: "22vmin", height: "22vmin", borderRadius: 8,
              ...(img
                ? { backgroundImage: assetUrl(img.src), backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.25)" }),
            }} />
          ))}
        </div>
        <div style={{ width: "40vmin", color: "#f5f0e8", fontFamily: "Georgia, serif", fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-wrap", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
          {text.slice(0, state.charIndex)}
          {!state.done && <span style={{ opacity: 0.7, animation: "breathe 0.8s ease-in-out infinite" }}>|</span>}
        </div>
      </div>
    </div>
  );
}

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
    const id = setInterval(() => setBaileyFrame(f => (f + 1) % BAILEY.frames), 1000 / BAILEY.fps);
    return () => clearInterval(id);
  }, []);

  const [jeshuaFrame, setJeshuaFrame] = useState(0);
  useEffect(() => {
    const ms = 1000 / JESHUA_WATER_FPS;
    const id = setInterval(() => setJeshuaFrame(f => (f + 1) % JESHUA_WATER_FRAMES), ms);
    return () => clearInterval(id);
  }, []);

  const basket = useOverlay(BASKET_TEXT);
  const can = useOverlay(WATERING_CAN_TEXT);
  const pots = useOverlay(FLOWER_POTS_TEXT);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div style={{ position: "absolute", inset: 0, backgroundImage: assetUrl("/assets/sprites/landing/garden/background.png"), backgroundSize: "cover", backgroundPosition: "center" }} />

      <div style={{ position: "absolute", top: "50%", left: "50%", width: BG_W, height: BG_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
        {/* jeshua — watering */}
        <div style={{ position: "absolute", top: "60%", left: "31%", transform: "translate(-50%, -50%)", width: JESHUA_WATER_SIZE, height: JESHUA_WATER_SIZE, backgroundImage: assetUrl("/assets/sprites/landing/garden/jeshua_water.png"), backgroundSize: `${JESHUA_WATER_SIZE * JESHUA_WATER_FRAMES}px ${JESHUA_WATER_SIZE}px`, backgroundPosition: `-${jeshuaFrame * JESHUA_WATER_SIZE}px 0`, backgroundRepeat: "no-repeat", imageRendering: "pixelated" }} />

        {/* watering can */}
        <div style={{ position: "absolute", top: "52%", left: "80%", transform: "translate(-50%, -50%)", width: WATERING_CAN_W, height: WATERING_CAN_H, backgroundImage: assetUrl("/assets/sprites/landing/garden/watering_can.png"), backgroundSize: `${WATERING_CAN_W}px ${WATERING_CAN_H}px`, backgroundRepeat: "no-repeat", imageRendering: "pixelated", cursor: "pointer" }} onClick={() => can.setOpen(true)} />

        {/* flower pots */}
        <div style={{ position: "absolute", top: "43%", left: "35%", transform: "translate(-50%, -50%)", width: FLOWER_POTS_W, height: FLOWER_POTS_H, backgroundImage: assetUrl("/assets/sprites/landing/garden/flower_pots.png"), backgroundSize: `${FLOWER_POTS_W}px ${FLOWER_POTS_H}px`, backgroundRepeat: "no-repeat", imageRendering: "pixelated", cursor: "pointer" }} onClick={() => pots.setOpen(true)} />

        {/* picnic blanket — under bailey */}
        <div style={{ position: "absolute", top: "58%", left: "68%", transform: "translate(-50%, -50%)", width: BLANKET_W, height: BLANKET_H, backgroundImage: assetUrl("/assets/sprites/landing/garden/picnic_blanket.png"), backgroundSize: `${BLANKET_W}px ${BLANKET_H}px`, backgroundRepeat: "no-repeat", imageRendering: "pixelated" }} />

        {/* picnic basket */}
        <div style={{ position: "absolute", top: "55%", left: "55%", transform: "translate(-50%, -50%)", width: BASKET_SIZE, height: BASKET_SIZE, backgroundImage: assetUrl("/assets/sprites/landing/garden/picnic_basket.png"), backgroundSize: `${BASKET_SIZE}px ${BASKET_SIZE}px`, backgroundRepeat: "no-repeat", imageRendering: "pixelated", cursor: "pointer" }} onClick={() => basket.setOpen(true)} />

        {/* bailey */}
        <div style={{ position: "absolute", top: BAILEY.top, left: BAILEY.left, transform: "translate(-50%, -50%)", width: BAILEY.size, height: BAILEY.size, backgroundImage: assetUrl(`/assets/sprites/landing/garden/${BAILEY.file}.png`), backgroundSize: `${BAILEY.size * BAILEY.frames}px ${BAILEY.size}px`, backgroundPosition: `-${baileyFrame * BAILEY.size}px 0`, backgroundRepeat: "no-repeat", imageRendering: "pixelated" }} />
      </div>

      {basket.open && <Overlay state={basket} text={BASKET_TEXT} images={[{ src: "/assets/sprites/landing/garden/basket_image_1.png" }, { src: "/assets/sprites/landing/garden/basket_image_2.png" }]} />}
      {can.open && <Overlay state={can} text={WATERING_CAN_TEXT} images={[{ src: "/assets/sprites/landing/garden/watering_image_1.png" }, { src: "/assets/sprites/landing/garden/watering_image_2.png" }]} />}
      {pots.open && <Overlay state={pots} text={FLOWER_POTS_TEXT} images={[{ src: "/assets/sprites/landing/garden/flower_image_1.png" }, { src: "/assets/sprites/landing/garden/flower_image_2.png" }]} />}
    </main>
  );
}
