"use client";

import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

interface VimeoProgressPlayerProps {
  embedUrl: string;
  lessonId: string;
  initialPositionSeconds: number;
  initialPercent: number;
  initialCompleted: boolean;
  title: string;
}

export function VimeoProgressPlayer({ embedUrl, lessonId, initialPositionSeconds, initialPercent, initialCompleted, title }: VimeoProgressPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const latest = useRef({ lastPositionSeconds: initialPositionSeconds, durationSeconds: 0, percent: initialPercent, completed: initialCompleted });
  const lastSentAt = useRef(0);
  const [percent, setPercent] = useState(initialPercent);

  useEffect(() => {
    if (!iframeRef.current) return;
    const player = new Player(iframeRef.current);
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
      player.destroy().catch(() => undefined);
    };
  }, [initialPercent, initialPositionSeconds, lessonId]);

  return (
    <section className="vimeo-player panel" aria-label="Player da aula">
      <div className="vimeo-frame"><iframe ref={iframeRef} src={embedUrl} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>
      <div className="player-progress-label">{percent >= 95 ? "Aula concluída" : `${Math.round(percent)}% concluída`}</div>
    </section>
  );
}
