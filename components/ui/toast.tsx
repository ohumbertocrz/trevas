"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 3600); return () => window.clearTimeout(timer); }, []);
  if (!visible) return null;
  return <div className="app-toast" role="status"><Check size={17} /><span>{message}</span><button className="icon-button" type="button" onClick={() => setVisible(false)} aria-label="Fechar aviso"><X size={15} /></button></div>;
}
