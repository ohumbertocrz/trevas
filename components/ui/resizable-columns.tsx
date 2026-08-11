"use client";

import { GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ResizableColumnsProps {
  children: React.ReactNode;
  contentClassName?: string;
  defaultSecondaryWidth: number;
  maxSecondaryWidth: number;
  minPrimaryWidth: number;
  minSecondaryWidth: number;
  storageKey: string;
}

export function ResizableColumns({
  children,
  contentClassName,
  defaultSecondaryWidth,
  maxSecondaryWidth,
  minPrimaryWidth,
  minSecondaryWidth,
  storageKey,
}: ResizableColumnsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [secondaryWidth, setSecondaryWidth] = useState(defaultSecondaryWidth);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = Number(stored);
    if (Number.isFinite(parsed) && parsed >= minSecondaryWidth && parsed <= maxSecondaryWidth) {
      setSecondaryWidth(parsed);
    }
  }, [maxSecondaryWidth, minSecondaryWidth, storageKey]);

  function updateWidth(clientX: number) {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const availableMaximum = Math.min(maxSecondaryWidth, bounds.width - minPrimaryWidth - 16);
    const nextWidth = Math.min(Math.max(bounds.right - clientX - 8, minSecondaryWidth), availableMaximum);
    if (availableMaximum >= minSecondaryWidth) setSecondaryWidth(nextWidth);
  }

  function commitWidth() {
    setDragging(false);
    window.localStorage.setItem(storageKey, String(Math.round(secondaryWidth)));
  }

  function nudgeWidth(delta: number) {
    const container = containerRef.current;
    if (!container) return;
    const availableMaximum = Math.min(maxSecondaryWidth, container.clientWidth - minPrimaryWidth - 16);
    const nextWidth = Math.min(Math.max(secondaryWidth + delta, minSecondaryWidth), availableMaximum);
    if (availableMaximum >= minSecondaryWidth) {
      setSecondaryWidth(nextWidth);
      window.localStorage.setItem(storageKey, String(Math.round(nextWidth)));
    }
  }

  return (
    <div
      className={`resizable-columns ${dragging ? "is-dragging" : ""}`}
      ref={containerRef}
      style={{ "--secondary-width": `${secondaryWidth}px` } as React.CSSProperties}
    >
      <div className={contentClassName}>{children}</div>
      <button
        className="column-resizer"
        type="button"
        role="separator"
        aria-label="Ajustar largura das colunas"
        aria-orientation="vertical"
        aria-valuemin={minSecondaryWidth}
        aria-valuemax={maxSecondaryWidth}
        aria-valuenow={Math.round(secondaryWidth)}
        title="Arraste para ajustar as colunas"
        onDoubleClick={() => {
          setSecondaryWidth(defaultSecondaryWidth);
          window.localStorage.setItem(storageKey, String(defaultSecondaryWidth));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); nudgeWidth(16); }
          if (event.key === "ArrowRight") { event.preventDefault(); nudgeWidth(-16); }
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) updateWidth(event.clientX);
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          commitWidth();
        }}
        onPointerCancel={() => setDragging(false)}
      >
        <GripVertical aria-hidden="true" />
      </button>
    </div>
  );
}
