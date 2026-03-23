import { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

export function FPSCounter() {
  const showFPS = useSettingsStore((s) => s.showFPS);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!showFPS) return;
    let lastTime = performance.now();
    let frames = 0;
    let rafId: number;

    const measure = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [showFPS]);

  if (!showFPS) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 border border-cyan-400/20 px-2 py-1 rounded text-xs pointer-events-none z-50">
      <span className={fps < 50 ? "text-red-400" : "text-green-400"}>
        {fps} FPS
      </span>
    </div>
  );
}
