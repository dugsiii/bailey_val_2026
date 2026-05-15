"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { assetPath, assetUrl } from "@/lib/asset-paths";

const BG_W = 1672;
const BG_H = 941;
const FRAME = 180;
const SCREEN_PADDING = 16;

const clamp = (value: number, min: number, max: number) =>
  max < min ? (min + max) / 2 : Math.min(Math.max(value, min), max);

// Frames per second — change these to adjust animation speed
const PRELOAD_IMAGES = [
  "/assets/sprites/landing/LandingMenu_BG.png",
  "/assets/sprites/landing/Welcome.png",
  "/assets/sprites/landing/Click_to_Begin.png",
  "/assets/sprites/landing/Garden_sign.png",
  "/assets/sprites/landing/Garden_hover.png",
  "/assets/sprites/landing/Library_sign.png",
  "/assets/sprites/landing/Library_hover.png",
  "/assets/sprites/landing/bailey_log_idle.png",
  "/assets/sprites/landing/bailey_marshmallow_log.png",
  "/assets/sprites/landing/garden/bailey_sandwich.png",
  "/assets/sprites/landing/jeshua_idle_animation.png",
  "/assets/sprites/landing/jeshua_look_animation.png",
  "/assets/sprites/landing/campfire.png",
  "/assets/sprites/landing/smoke.png",
];

const FPS = {
  campfire:          1,
  smoke:             1,
  jchengIdle:        2,
  jchengLook:        2,
  baileyIdle:        2,
  baileyMarshmallow: 2,
  baileySandwich:    2,
};

const cyclems = (fps: number, frames: number) => (frames / fps) * 1000;

// — Bailey —
const BAILEY_SEQUENCE = ["idle", "idle", "idle", "marshmallow"] as const;
type BaileyAnim = typeof BAILEY_SEQUENCE[number];

const BAILEY_SPRITE: Record<BaileyAnim, { image: string; bgSize: string; frames: number; cycleMs: number }> = {
  idle: {
    image:   assetUrl("/assets/sprites/landing/bailey_log_idle.png"),
    bgSize:  `${FRAME * 6}px ${FRAME}px`,
    frames:  6,
    cycleMs: cyclems(FPS.baileyIdle, 6),
  },
  marshmallow: {
    image:   assetUrl("/assets/sprites/landing/bailey_marshmallow_log.png"),
    bgSize:  `${FRAME * 6}px ${FRAME}px`,
    frames:  6,
    cycleMs: cyclems(FPS.baileyMarshmallow, 6),
  },
};

const BAILEY_SANDWICH = {
  image:   assetUrl("/assets/sprites/landing/garden/bailey_sandwich.png"),
  bgSize:  `${FRAME * 6}px ${FRAME}px`,
  frames:  6,
  cycleMs: cyclems(FPS.baileySandwich, 6),
};

// — Jcheng —
const JCHENG_SEQUENCE = ["idle", "idle", "idle", "look"] as const;
type JchengAnim = typeof JCHENG_SEQUENCE[number];

const JCHENG_SPRITE: Record<JchengAnim, { image: string; bgSize: string; cycleMs: number }> = {
  idle: {
    image:   assetUrl("/assets/sprites/landing/jeshua_idle_animation.png"),
    bgSize:  `${FRAME * 6}px ${FRAME}px`,
    cycleMs: cyclems(FPS.jchengIdle, 6),
  },
  look: {
    image:   assetUrl("/assets/sprites/landing/jeshua_look_animation.png"),
    bgSize:  `${FRAME * 6}px ${FRAME}px`,
    cycleMs: cyclems(FPS.jchengLook, 6),
  },
};

export default function LandingPage() {
  const router = useRouter();
  const [baileyStep, setBaileyStep] = useState(0);
  const baileyAnim: BaileyAnim = BAILEY_SEQUENCE[baileyStep];
  const bailey = BAILEY_SPRITE[baileyAnim];

  const [baileyShowSandwich, setBaileyShowSandwich] = useState(false);
  const activeBailey = baileyShowSandwich ? BAILEY_SANDWICH : bailey;

  const [pressed, setPressed] = useState(false);
  const [started, setStarted] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("landing-started") === "true"
  );
  const [gardenHover, setGardenHover] = useState(false);
  const [gardenFrame, setGardenFrame] = useState(0);
  const [libraryHover, setLibraryHover] = useState(false);
  const [libraryFrame, setLibraryFrame] = useState(0);
  const [campfireFrame, setCampfireFrame] = useState(0);
  const [smokeFrame, setSmokeFrame] = useState(0);
  const [baileyFrame, setBaileyFrame] = useState(0);
  const [jchengFrame, setJchengFrame] = useState(0);

  const [jchengStep, setJchengStep] = useState(0);
  const jchengAnim: JchengAnim = JCHENG_SEQUENCE[jchengStep];
  const jcheng = JCHENG_SPRITE[jchengAnim];

  const [muted, setMuted] = useState(false);
  const [muteHover, setMuteHover] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(encodeURI(assetPath("/assets/sprites/landing/[Playlist] The Sounds of Summer 4.mp3")));
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (!started) return;
    sessionStorage.setItem("landing-started", "true");
    audioRef.current?.play().catch(() => {});
  }, [started]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(m => !m);
  };

  const muteButtonStyle: CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: muteHover ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
    border: "2px solid rgba(255,255,255,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 22,
    transition: "background 0.2s, transform 0.2s",
    transform: muteHover ? "scale(1.15)" : "scale(1)",
    zIndex: 999,
    userSelect: "none",
    opacity: started ? 1 : 0,
    pointerEvents: started ? "auto" : "none",
  };

  // scale to match background-size: cover on BG_W × BG_H
  useEffect(() => {
    const images = PRELOAD_IMAGES.map((src) => {
      const image = new Image();
      image.src = assetPath(src);
      image.decode?.().catch(() => {});
      return image;
    });

    return () => {
      images.forEach((image) => {
        image.src = "";
      });
    };
  }, []);

  const [viewport, setViewport] = useState({ width: BG_W, height: BG_H, scale: 1 });
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        scale: Math.max(width / BG_W, height / BG_H),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = viewport.scale;
  const visibleW = viewport.width / scale;
  const visibleH = viewport.height / scale;
  const visibleLeft = (BG_W - visibleW) / 2;
  const visibleRight = visibleLeft + visibleW;
  const visibleTop = (BG_H - visibleH) / 2;
  const visibleBottom = visibleTop + visibleH;

  useEffect(() => {
    const timer = setTimeout(
      () => setBaileyStep((s) => (s + 1) % BAILEY_SEQUENCE.length),
      bailey.cycleMs,
    );
    return () => clearTimeout(timer);
  }, [baileyStep, bailey.cycleMs]);

  useEffect(() => {
    const timer = setTimeout(
      () => setJchengStep((s) => (s + 1) % JCHENG_SEQUENCE.length),
      jcheng.cycleMs,
    );
    return () => clearTimeout(timer);
  }, [jchengStep, jcheng.cycleMs]);

  useEffect(() => {
    if (!gardenHover) { setGardenFrame(0); return; }
    const ms = cyclems(3, 6) / 6;
    const id = setInterval(() => setGardenFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, [gardenHover]);

  useEffect(() => {
    if (!libraryHover) { setLibraryFrame(0); return; }
    const ms = cyclems(3, 7) / 7;
    const id = setInterval(() => setLibraryFrame(f => (f + 1) % 7), ms);
    return () => clearInterval(id);
  }, [libraryHover]);

  useEffect(() => {
    const ms = cyclems(FPS.campfire, 6) / 6;
    const id = setInterval(() => setCampfireFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ms = cyclems(FPS.smoke, 6) / 6;
    const id = setInterval(() => setSmokeFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setBaileyFrame(0);
    const ms = activeBailey.cycleMs / activeBailey.frames;
    const id = setInterval(() => setBaileyFrame(f => (f + 1) % activeBailey.frames), ms);
    return () => clearInterval(id);
  }, [baileyStep, baileyShowSandwich, activeBailey.cycleMs, activeBailey.frames]);

  useEffect(() => {
    setJchengFrame(0);
    const ms = jcheng.cycleMs / 6;
    const id = setInterval(() => setJchengFrame(f => (f + 1) % 6), ms);
    return () => clearInterval(id);
  }, [jchengStep, jcheng.cycleMs]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* background — always full screen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: assetUrl("/assets/sprites/landing/LandingMenu_BG.png"),
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* scaled sprite container — matches background cover scaling */}
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
        {/* welcome banner */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: started ? "translateX(-50%) scale(1.08)" : "translateX(-50%) scale(1)",
            width: 600,
            height: Math.round(600 * 724 / 2172),
            backgroundImage: assetUrl("/assets/sprites/landing/Welcome.png"),
            backgroundSize: `600px ${Math.round(600 * 724 / 2172)}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            opacity: started ? 0 : 1,
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            pointerEvents: "none",
          }}
        />

        {/* click to begin */}
        <button
          style={{
            appearance: "none",
            border: "none",
            padding: 0,
            background: "none",
            position: "absolute",
            top: "30%",
            left: "50%",
            width: 500,
            height: 150,
            backgroundImage: assetUrl("/assets/sprites/landing/Click_to_Begin.png"),
            backgroundSize: "500px 150px",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            transform: started
              ? "translateX(-50%) scale(1.08)"
              : pressed
              ? "translateX(-50%) translateY(6px)"
              : "translateX(-50%) scale(1)",
            transition: started
              ? "opacity 0.8s ease-out, transform 0.8s ease-out"
              : "transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animation: pressed ? "none" : "breathe-scale 4s ease-in-out infinite",
            opacity: started ? 0 : 1,
            cursor: started ? "default" : "pointer",
            userSelect: "none",
            pointerEvents: started ? "none" : "auto",
          }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => { setPressed(false); setTimeout(() => setStarted(true), 120); }}
          onMouseLeave={() => setPressed(false)}
        />

        {/* ---- menu group — adjust MENU_LEFT / MENU_BOTTOM to reposition ---- */}
        {(() => {
          const MENU_LEFT = 24;   // px from left edge of BG
          const MENU_BOTTOM = BG_H * 0.5;
          const MENU_BUTTON_H = 60;
          const MENU_BUTTONS = 2;
          const MENU_H = MENU_BUTTON_H * MENU_BUTTONS;
          const MENU_VISUAL_W = FRAME;
          const MENU_VISUAL_TOP = -48;
          const MENU_VISUAL_BOTTOM = MENU_H + 72;
          const menuLeft = clamp(
            MENU_LEFT,
            visibleLeft + SCREEN_PADDING,
            visibleRight - SCREEN_PADDING - MENU_VISUAL_W,
          );
          const desiredTop = BG_H - MENU_BOTTOM - MENU_H;
          const minTop = visibleTop + SCREEN_PADDING - MENU_VISUAL_TOP;
          const maxTop = visibleBottom - SCREEN_PADDING - MENU_VISUAL_BOTTOM;
          const menuTop = clamp(desiredTop, minTop, maxTop);
          const menuBottom = BG_H - menuTop - MENU_H;
          return (
            <div
              style={{
                position: "absolute",
                left: menuLeft,
                bottom: menuBottom,
                opacity: started ? 1 : 0,
                transition: "opacity 1s ease-in",
                pointerEvents: started ? "auto" : "none",
              }}
            >
              {/* garden sign button — sized to visible art only */}
              {/* tweak GARDEN_* constants if click area needs adjusting */}
              {(() => {
                const GARDEN_W = 165;    // visible art width
                const GARDEN_H = 60;     // visible art height
                const GARDEN_CX = 0;     // transparent padding on left
                const GARDEN_CY = 48;    // transparent padding on top of frame
                return (
                  <button
                    style={{
                      appearance: "none",
                      border: "none",
                      padding: 0,
                      background: "none",
                      display: "block",
                      position: "relative",
                      width: GARDEN_W,
                      height: GARDEN_H,
                      overflow: "visible",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setGardenHover(true)}
                    onMouseLeave={() => setGardenHover(false)}
                    onClick={() => router.push("/garden")}
                  >
                    {/* visual — free to overflow the hit area */}
                    <div
                      style={{
                        position: "absolute",
                        top: -GARDEN_CY,
                        left: -GARDEN_CX,
                        width: FRAME,
                        height: FRAME,
                        backgroundImage: gardenHover
                          ? assetUrl("/assets/sprites/landing/Garden_hover.png")
                          : assetUrl("/assets/sprites/landing/Garden_sign.png"),
                        backgroundSize: gardenHover
                          ? `${FRAME * 6}px ${FRAME}px`
                          : `${FRAME}px ${FRAME}px`,
                        backgroundPosition: gardenHover ? `-${gardenFrame * FRAME}px 0` : "0 0",
                        backgroundRepeat: "no-repeat",
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                      }}
                    />
                  </button>
                );
              })()}
              {/* library sign button */}
              {(() => {
                const LIBRARY_W = 165;
                const LIBRARY_H = 60;
                const LIBRARY_CX = 0;
                const LIBRARY_CY = 48;
                return (
                  <button
                    style={{
                      appearance: "none",
                      border: "none",
                      padding: 0,
                      background: "none",
                      display: "block",
                      position: "relative",
                      width: LIBRARY_W,
                      height: LIBRARY_H,
                      overflow: "visible",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setLibraryHover(true)}
                    onMouseLeave={() => setLibraryHover(false)}
                    onClick={() => router.push("/library")}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -LIBRARY_CY,
                        left: -LIBRARY_CX,
                        width: FRAME,
                        height: FRAME,
                        backgroundImage: libraryHover
                          ? assetUrl("/assets/sprites/landing/Library_hover.png")
                          : assetUrl("/assets/sprites/landing/Library_sign.png"),
                        backgroundSize: libraryHover
                          ? `${FRAME * 7}px ${FRAME}px`
                          : `${FRAME}px ${FRAME}px`,
                        backgroundPosition: libraryHover ? `-${libraryFrame * FRAME}px 0` : "0 0",
                        backgroundRepeat: "no-repeat",
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                      }}
                    />
                  </button>
                );
              })()}
            </div>
          );
        })()}

        {/* smoke — above campfire */}
        <div
          style={{
            position: "absolute",
            top: "75%",
            left: "48%",
            transform: "translate(-50%, calc(-50% - 180px))",
            width: FRAME,
            height: FRAME,
            backgroundImage: assetUrl("/assets/sprites/landing/smoke.png"),
            backgroundSize: `${FRAME * 3}px ${FRAME * 2}px`,
            backgroundPosition: `-${(smokeFrame % 3) * FRAME}px -${Math.floor(smokeFrame / 3) * FRAME}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* campfire */}
        <div
          style={{
            position: "absolute",
            top: "70%",
            left: "48%",
            transform: "translate(-50%, -50%)",
            width: FRAME,
            height: FRAME,
            backgroundImage: assetUrl("/assets/sprites/landing/campfire.png"),
            backgroundSize: `${FRAME * 3}px ${FRAME * 2}px`,
            backgroundPosition: `-${(campfireFrame % 3) * FRAME}px -${Math.floor(campfireFrame / 3) * FRAME}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* jcheng — right of campfire */}
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "46%",
            transform: "translate(calc(-50% + 160px), -50%)",
            width: FRAME,
            height: FRAME,
            backgroundImage: jcheng.image,
            backgroundSize: jcheng.bgSize,
            backgroundPosition: `-${jchengFrame * FRAME}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />

        {/* bailey — left of campfire */}
        <div
          onClick={() => setBaileyShowSandwich(s => !s)}
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translate(calc(-50% - 160px), -50%)",
            width: FRAME,
            height: FRAME,
            backgroundImage: activeBailey.image,
            backgroundSize: activeBailey.bgSize,
            backgroundPosition: `-${baileyFrame * FRAME}px 0`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            cursor: "pointer",
          }}
        />
      </div>

      <div
        style={muteButtonStyle}
        onClick={toggleMute}
        onMouseEnter={() => setMuteHover(true)}
        onMouseLeave={() => setMuteHover(false)}
      >
        {muted ? "🔇" : "🔊"}
      </div>
    </main>
  );
}
