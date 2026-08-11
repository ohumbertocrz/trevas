"use client";

import { GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const defaults = [40, 27, 33] as const;

export function ResizablePanelGrid({ children, storageKey }: { children: React.ReactNode; storageKey: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number[]>([...defaults]);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as number[];
      if (parsed.length === 3 && parsed.every((value) => Number.isFinite(value) && value >= 18)) setColumns(parsed);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function resizeAt(separator: number, clientX: number) {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    const position = ((clientX - bounds.left) / bounds.width) * 100;
    const next = [...columns];
    const pairTotal = columns[separator] + columns[separator + 1];
    const pairStart = columns.slice(0, separator).reduce((sum, value) => sum + value, 0);
    const first = Math.min(Math.max(position - pairStart, 18), pairTotal - 18);
    next[separator] = first;
    next[separator + 1] = pairTotal - first;
    setColumns(next);
  }

  function commit(next = columns) {
    setDragging(null);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function nudge(separator: number, delta: number) {
    const next = [...columns];
    if (next[separator] + delta < 18 || next[separator + 1] - delta < 18) return;
    next[separator] += delta;
    next[separator + 1] -= delta;
    setColumns(next);
    commit(next);
  }

  function reset() {
    const next = [...defaults];
    setColumns(next);
    commit(next);
  }

  return (
    <div
      className={`triple-resizable ${dragging !== null ? "is-dragging" : ""}`}
      ref={containerRef}
      style={{
        "--column-one": `${columns[0]}fr`,
        "--column-two": `${columns[1]}fr`,
        "--column-three": `${columns[2]}fr`,
      } as React.CSSProperties}
    >
      <div className="admin-grid">{children}</div>
      {[0, 1].map((separator) => {
        const offset = columns.slice(0, separator + 1).reduce((sum, value) => sum + value, 0);
        return (
          <button
            key={separator}
            className="triple-resizer"
            style={{ left: `calc(${offset}% - ${separator === 0 ? 8 : 4}px)` }}
            type="button"
            role="separator"
            aria-label={`Ajustar colunas ${separator + 1} e ${separator + 2}`}
            aria-orientation="vertical"
            title="Arraste para ajustar os painéis"
            onDoubleClick={reset}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); nudge(separator, -1.5); }
              if (event.key === "ArrowRight") { event.preventDefault(); nudge(separator, 1.5); }
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(separator);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) resizeAt(separator, event.clientX);
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              commit();
            }}
            onPointerCancel={() => setDragging(null)}
          ><GripVertical aria-hidden="true" /></button>
        );
      })}
    </div>
  );
}
