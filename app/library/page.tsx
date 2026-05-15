"use client";

import { useState, useEffect } from "react";
import { assetUrl } from "@/lib/asset-paths";

const BG_W = 1672;
const BG_H = 941;
const FRAME = 200;

const FPS = {
  baileyIdle:     2,
  baileyFlipping: 2,
  sleep:          1.5,
};

const cyclems = (fps: number, frames: number) => (frames / fps) * 1000;

const BAILEY_SEQUENCE = ["idle", "flipping", "flipping", "idle"] as const;
type BaileyAnim = typeof BAILEY_SEQUENCE[number];

const BAILEY_SPRITE: Record<BaileyAnim, { image: string; cycleMs: number }> = {
  idle: {
    image:   assetUrl("/assets/sprites/landing/library/bailey_idle.png"),
    cycleMs: cyclems(FPS.baileyIdle, 6),
  },
  flipping: {
    image:   assetUrl("/assets/sprites/landing/library/bailey_flipping.png"),
    cycleMs: cyclems(FPS.baileyFlipping, 6),
  },
};

const JESHUA_SIZE = 200;
const SLEEP_SIZE = 100;
const BOOK_FLOOR_SIZE = 125;
const BOOK_PICKUP_SIZE = 400;
const BOOK_OPEN_FRAMES = 6;
const BOOK_OPEN_FPS = 8;

export default function LibraryPage() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () =>
      setScale(Math.max(window.innerWidth / BG_W, window.innerHeight / BG_H));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [baileyStep, setBaileyStep] = useState(0);
  const bailey = BAILEY_SPRITE[BAILEY_SEQUENCE[baileyStep]];
  const [baileyFrame, setBaileyFrame] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setBaileyStep(s => (s + 1) % BAILEY_SEQUENCE.length),
      bailey.cycleMs,
    );
    return () => clearTimeout(id);
  }, [baileyStep, bailey.cycleMs]);

  useEffect(() => {
    setBaileyFrame(0);
    const ms = bailey.cycleMs / 6;
    const id = setInterval(() => setBaileyFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, [baileyStep, bailey.cycleMs]);

  const [sleepFrame, setSleepFrame] = useState(0);
  useEffect(() => {
    const ms = cyclems(FPS.sleep, 6) / 6;
    const id = setInterval(() => setSleepFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, []);

  type BookState = "floor" | "pickup" | "opening" | "open" | "display";
  const [bookState, setBookState] = useState<BookState>("floor");
  const [activeBook, setActiveBook] = useState<1 | 2 | 3>(1);
  const [openFrame, setOpenFrame] = useState(0);

  const pickUp = (book: 1 | 2 | 3) => { setActiveBook(book); setBookState("pickup"); };
  const putDown = () => { setBookState("floor"); setOpenFrame(0); };

  const BOOK_ASSETS = {
    1: {
      floor:   assetUrl("/assets/sprites/landing/library/book_1_floor.png"),
      pickup:  assetUrl("/assets/sprites/landing/library/book_1_pickup.png"),
      open:    assetUrl("/assets/sprites/landing/library/book_1_open.png"),
      display: assetUrl("/assets/sprites/landing/library/book_1_display.png"),
    },
    2: {
      floor:   assetUrl("/assets/sprites/landing/library/book_2_floor.png"),
      pickup:  assetUrl("/assets/sprites/landing/library/book_2_pickup.png"),
      open:    assetUrl("/assets/sprites/landing/library/book_2_open.png"),
      display: assetUrl("/assets/sprites/landing/library/book_2_display.png"),
    },
    3: {
      floor:   assetUrl("/assets/sprites/landing/library/book_3_floor.png"),
      pickup:  assetUrl("/assets/sprites/landing/library/book_3_pickup.png"),
      open:    assetUrl("/assets/sprites/landing/library/book_3_open.png"),
      display: assetUrl("/assets/sprites/landing/library/book_3_display.png"),
    },
  } as const;

  useEffect(() => {
    if (bookState !== "opening") return;
    const ms = 1000 / BOOK_OPEN_FPS;
    const id = setInterval(() => {
      setOpenFrame(f => {
        if (f >= BOOK_OPEN_FRAMES - 1) { clearInterval(id); setBookState("open"); return f; }
        return f + 1;
      });
    }, ms);
    return () => clearInterval(id);
  }, [bookState]);

  useEffect(() => {
    if (bookState !== "open") return;
    const id = setTimeout(() => setBookState("display"), 300);
    return () => clearTimeout(id);
  }, [bookState]);

  const [displayReady, setDisplayReady] = useState(false);
  useEffect(() => {
    if (bookState !== "display") { setDisplayReady(false); return; }
    const id = requestAnimationFrame(() => setDisplayReady(true));
    return () => cancelAnimationFrame(id);
  }, [bookState]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: assetUrl("/assets/sprites/landing/library/background.png"),
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* scaled sprite container */}
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
        {/* bailey — sitting in armchair */}
        <div
          style={{
            position: "absolute",
            top: "68%",
            left: "43%",
            transform: "translate(-50%, -50%)",
            width: FRAME,
            height: FRAME,
            backgroundImage: bailey.image,
            backgroundSize: `${FRAME * 6}px ${FRAME}px`,
            backgroundPosition: `-${baileyFrame * FRAME}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* jeshua — sleeping on bench */}
        <div
          style={{
            position: "absolute",
            top: "68%",
            left: "58%",
            transform: "translate(-50%, -50%)",
            width: JESHUA_SIZE,
            height: JESHUA_SIZE,
            backgroundImage: assetUrl("/assets/sprites/landing/library/jeshua.png"),
            backgroundSize: `${JESHUA_SIZE}px ${JESHUA_SIZE}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* sleep effect — above jeshua's head */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "60%",
            transform: "translate(-50%, -50%)",
            width: SLEEP_SIZE,
            height: SLEEP_SIZE,
            backgroundImage: assetUrl("/assets/sprites/landing/library/sleep_effect.png"),
            backgroundSize: `${SLEEP_SIZE * 6}px ${SLEEP_SIZE}px`,
            backgroundPosition: `-${sleepFrame * SLEEP_SIZE}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            pointerEvents: "none",
          }}
        />

        {/* books on floor */}
        {(bookState === "floor" || activeBook !== 1) && (
          <div
            style={{
              position: "absolute",
              top: "80%",
              left: "45%",
              transform: "translate(-50%, -50%)",
              width: BOOK_FLOOR_SIZE,
              height: BOOK_FLOOR_SIZE,
              backgroundImage: BOOK_ASSETS[1].floor,
              backgroundSize: `${BOOK_FLOOR_SIZE}px ${BOOK_FLOOR_SIZE}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              cursor: "pointer",
            }}
            onClick={() => pickUp(1)}
          />
        )}
        {(bookState === "floor" || activeBook !== 2) && (
          <div
            style={{
              position: "absolute",
              top: "85%",
              left: "35%",
              transform: "translate(-50%, -50%)",
              width: BOOK_FLOOR_SIZE,
              height: BOOK_FLOOR_SIZE,
              backgroundImage: BOOK_ASSETS[2].floor,
              backgroundSize: `${BOOK_FLOOR_SIZE}px ${BOOK_FLOOR_SIZE}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              cursor: "pointer",
            }}
            onClick={() => pickUp(2)}
          />
        )}
        {(bookState === "floor" || activeBook !== 3) && (
          <div
            style={{
              position: "absolute",
              top: "82%",
              left: "55%",
              transform: "translate(-50%, -50%)",
              width: BOOK_FLOOR_SIZE,
              height: BOOK_FLOOR_SIZE,
              backgroundImage: BOOK_ASSETS[3].floor,
              backgroundSize: `${BOOK_FLOOR_SIZE}px ${BOOK_FLOOR_SIZE}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              cursor: "pointer",
            }}
            onClick={() => pickUp(3)}
          />
        )}
      </div>

      {/* book overlay — pickup / opening / open */}
      {bookState !== "floor" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            cursor: bookState === "opening" ? "default" : "pointer",
            zIndex: 10,
          }}
          onClick={() => {
            if (bookState === "opening") return;
            putDown();
          }}
        >
          {bookState === "pickup" && (
            <div
              style={{
                width: BOOK_PICKUP_SIZE,
                height: BOOK_PICKUP_SIZE,
                backgroundImage: BOOK_ASSETS[activeBook].pickup,
                backgroundSize: `${BOOK_PICKUP_SIZE}px ${BOOK_PICKUP_SIZE}px`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                cursor: "pointer",
              }}
              onClick={e => { e.stopPropagation(); setOpenFrame(0); setBookState("opening"); }}
            />
          )}

          {(bookState === "opening" || bookState === "open") && (
            <div
              style={{
                width: BOOK_PICKUP_SIZE,
                height: BOOK_PICKUP_SIZE,
                backgroundImage: BOOK_ASSETS[activeBook].open,
                backgroundSize: `${BOOK_OPEN_FRAMES * BOOK_PICKUP_SIZE}px ${BOOK_PICKUP_SIZE}px`,
                backgroundPosition: `-${openFrame * BOOK_PICKUP_SIZE}px 0`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
              }}
            />
          )}

          {bookState === "display" && (
            <div
              style={{
                position: "relative",
                width: "100vmin",
                height: "75vmin",
                backgroundImage: BOOK_ASSETS[activeBook].display,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                opacity: displayReady ? 1 : 0,
                transition: "opacity 1s ease",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* left page — picture area */}
              <div
                style={{
                  position: "absolute",
                  top: "17%",
                  left: "14%",
                  width: "33%",
                  height: "65%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              />
              {/* right page — text area */}
              <div
                style={{
                  position: "absolute",
                  top: "17%",
                  left: "51%",
                  width: "35%",
                  height: "65%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  overflow: "hidden",
                  padding: "4px",
                }}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
