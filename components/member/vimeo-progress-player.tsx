"use client";

import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

let activeVimeoPlayer: Player | null = null;

export async function getCurrentVimeoTime() {
  if (!activeVimeoPlayer) return null;
  try {
    return await activeVimeoPlayer.getCurrentTime();
  } catch {
    return null;
  }
}

interface VimeoProgressPlayerProps {
  embedUrl: string;
  lessonId: string;
  initialPositionSeconds: number;
  initialPercent: number;
  initialCompleted: boolean;
  title: string;
  viewerName: string;
  viewerEmail: string;
}

export function VimeoProgressPlayer({ embedUrl, lessonId, initialPositionSeconds, initialPercent, initialCompleted, title, viewerName, viewerEmail }: VimeoProgressPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const latest = useRef({ lastPositionSeconds: initialPositionSeconds, durationSeconds: 0, percent: initialPercent, completed: initialCompleted });
  const lastSentAt = useRef(0);
  const [percent, setPercent] = useState(initialPercent);

  useEffect(() => {
    if (!iframeRef.current) return;
    const player = new Player(iframeRef.current);
    activeVimeoPlayer = player;
    let disposed = false;

    const sendProgress = async (force = false) => {
      if ((!force && (disposed || Date.now() - lastSentAt.current < 10000))) return;
      lastSentAt.current = Date.now();
      await fetch("/api/learning/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, ...latest.current }) }).catch(() => undefined);
    };

    player.on("loaded", () => {
      if (initialPositionSeconds > 5) void player.setCurrentTime(initialPositionSeconds).catch(() => undefined);
    });
    player.on("timeupdate", (data) => {
      const durationSeconds = Number(data.duration ?? 0);
      const lastPositionSeconds = Number(data.seconds ?? 0);
      const nextPercent = durationSeconds > 0 ? Math.min(100, (lastPositionSeconds / durationSeconds) * 100) : initialPercent;
      latest.current = { lastPositionSeconds, durationSeconds, percent: nextPercent, completed: latest.current.completed || nextPercent >= 95 };
      setPercent(nextPercent);
      void sendProgress();
    });
    player.on("ended", () => {
      latest.current = { ...latest.current, percent: 100, completed: true };
      setPercent(100);
      void sendProgress(true);
    });

    return () => {
      disposed = true;
      void sendProgress(true);
      if (activeVimeoPlayer === player) activeVimeoPlayer = null;
      player.destroy().catch(() => undefined);
    };
  }, [embedUrl, lessonId]);

  const maskedEmail = viewerEmail.replace(/^(.{3}).*(@.*)$/, "$1***$2");
  return (
    <section className="vimeo-player panel" aria-label="Player da aula">
      <div className="vimeo-frame"><iframe ref={iframeRef} src={embedUrl} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><span className="social-drm-watermark" aria-hidden="true"><strong>{viewerName}</strong><small>{maskedEmail}</small></span></div>
      <div className="player-progress-label">{percent >= 95 ? "Aula concluída" : `${Math.round(percent)}% concluída`}</div>
    </section>
  );
}
