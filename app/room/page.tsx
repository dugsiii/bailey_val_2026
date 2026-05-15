"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import { assetPath, assetUrl } from "@/lib/asset-paths";

type AppState = "overview" | "zooming" | "entering" | "letter" | "exiting" | "outside-zooming" | "outside";
type LetterState = "idle" | "hover" | "opening" | "open";

const HOVER_FRAMES = 4;
const HOVER_W = 750;
const HOVER_H = Math.round(HOVER_W * (550 / 610));

const OPEN_FRAMES = 5;
const OPEN_SIZE = 750;

const IDLE_W = 750;
const IDLE_H = Math.round(IDLE_W * (550 / 613));

const PRELOAD_IMAGES = [
  "/assets/sprites/room/background.png",
  "/assets/sprites/room/door_hover.png",
  "/assets/sprites/room/desk_background.png",
  "/assets/sprites/room/outside_background.png",
  "/assets/sprites/room/Letter.png",
  "/assets/sprites/room/Letter_hovor_animation.png",
  "/assets/sprites/room/Letter_open_animation.png",
  "/assets/sprites/room/Letter_opened.png",
];

export default function RoomPage() {
  const [appState, setAppState] = useState<AppState>("overview");
  const [letterState, setLetterState] = useState<LetterState>("idle");
  const [openFrame, setOpenFrame] = useState(0);
  const [hoverKey, setHoverKey] = useState(0);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [muteHover, setMuteHover] = useState(false);
  const [doorHover, setDoorHover] = useState(false);
  const [deskZoomed, setDeskZoomed] = useState(false);

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

  useEffect(() => {
    if (appState === "entering") {
      const raf = requestAnimationFrame(() => setDeskZoomed(true));
      return () => cancelAnimationFrame(raf);
    }
    if (appState === "exiting") setDeskZoomed(false);
    if (appState === "overview") setDeskZoomed(false);
  }, [appState]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(assetPath("/assets/room_bgmusic.ogg"));
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const handleStart = () => {
    audioRef.current?.play();
    setStarted(true);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted((m) => !m);
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
  };

  useEffect(() => {
    if (letterState !== "opening") return;
    const interval = setInterval(() => {
      setOpenFrame((prev) => {
        if (prev >= OPEN_FRAMES - 1) {
          clearInterval(interval);
          setLetterState("open");
          return prev;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [letterState]);

  const exitToOverview = () => {
    setLetterState("idle");
    setOpenFrame(0);
    setAppState("exiting");
  };

  const letterStyle: CSSProperties = letterState === "open"
    ? {
        width: 750,
        height: 750,
        backgroundImage: assetUrl("/assets/sprites/room/Letter_opened.png"),
        backgroundSize: "750px 750px",
        backgroundRepeat: "no-repeat",
      }
    : letterState === "opening"
    ? {
        width: OPEN_SIZE,
        height: OPEN_SIZE,
        backgroundImage: assetUrl("/assets/sprites/room/Letter_open_animation.png"),
        backgroundSize: `${OPEN_FRAMES * OPEN_SIZE}px ${OPEN_SIZE}px`,
        backgroundPosition: `-${openFrame * OPEN_SIZE}px 0`,
        backgroundRepeat: "no-repeat",
      }
    : letterState === "hover"
    ? {
        width: HOVER_W,
        height: HOVER_H,
        backgroundImage: assetUrl("/assets/sprites/room/Letter_hovor_animation.png"),
        backgroundSize: `${HOVER_FRAMES * HOVER_W}px ${HOVER_H}px`,
        backgroundRepeat: "no-repeat",
        animation: `letter-hover ${HOVER_FRAMES * 0.25}s steps(${HOVER_FRAMES}) infinite`,
      }
    : {
        width: IDLE_W,
        height: IDLE_H,
        backgroundImage: assetUrl("/assets/sprites/room/Letter.png"),
        backgroundSize: `${IDLE_W}px ${IDLE_H}px`,
        backgroundRepeat: "no-repeat",
      };

  if (appState === "entering" || appState === "letter" || appState === "exiting") {
    const deskScale = deskZoomed ? "scale(1.2)" : "scale(1)";

    return (
      <main
        className="relative w-screen h-screen overflow-hidden"
        style={{ cursor: "default" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: assetUrl("/assets/sprites/room/desk_background.png"),
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: deskScale,
            transformOrigin: "center center",
            transition: "transform 1.2s ease-in-out",
          }}
          onTransitionEnd={() => {
            if (appState === "entering" && deskZoomed) setAppState("letter");
            if (appState === "exiting" && !deskZoomed) setAppState("overview");
          }}
        />

        {appState === "letter" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <div
              key={letterState === "hover" ? hoverKey : letterState}
              style={{ ...letterStyle, pointerEvents: "auto" }}
              className="cursor-pointer"
              onMouseEnter={() => { if (letterState === "idle") { setHoverKey((k) => k + 1); setLetterState("hover"); } }}
              onMouseLeave={() => { if (letterState === "hover") setLetterState("idle"); }}
              onClick={() => { if (letterState === "idle" || letterState === "hover") setLetterState("opening"); }}
            />
          </div>
        )}

        {appState === "letter" && (
          <>
            <div className="absolute top-0 left-0 h-full cursor-pointer" style={{ width: "15%" }} onClick={exitToOverview} />
            <div className="absolute top-0 right-0 h-full cursor-pointer" style={{ width: "15%" }} onClick={exitToOverview} />
            <div className="absolute bottom-0 left-0 w-full cursor-pointer" style={{ height: "15%" }} onClick={exitToOverview} />
          </>
        )}

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

  if (appState === "outside") {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-black">
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: assetUrl("/assets/sprites/room/outside_background.png"),
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: doorHover || appState === "outside-zooming" ? assetUrl("/assets/sprites/room/door_hover.png") : assetUrl("/assets/sprites/room/background.png"),
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformOrigin: appState === "outside-zooming" ? "10% center" : "center center",
          transform: appState === "zooming" || appState === "outside-zooming" ? "scale(1.2)" : "scale(1)",
          transition: appState === "zooming" || appState === "outside-zooming" ? "transform 1.2s ease-in" : "none",
        }}
        onTransitionEnd={() => {
          if (appState === "zooming") setAppState("entering");
          if (appState === "outside-zooming") setAppState("outside");
        }}
      />
      <div
        className="absolute top-0 left-0 h-full cursor-pointer"
        style={{ width: "20%" }}
        onMouseEnter={() => setDoorHover(true)}
        onMouseLeave={() => setDoorHover(false)}
        onClick={() => { setDoorHover(false); setAppState("outside-zooming"); }}
      />
      <div
        className="absolute cursor-pointer"
        style={{
          top: "50%",
          left: "50%",
          width: 350,
          height: 350,
          transform: "translate(-50%, -50%)",
        }}
        onClick={() => setAppState("zooming")}
      />
      {!started && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ background: "rgba(100,100,100,0.45)" }}
          onClick={handleStart}
        >
          <p className="text-white text-2xl tracking-widest select-none" style={{ animation: "float 2.4s ease-in-out infinite" }}>
            click anywhere
          </p>
        </div>
      )}

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
