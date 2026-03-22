import { useEffect, useRef } from "react";

export function CockpitView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sweepXRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SWEEP_DURATION = 4;
    let lastTime = performance.now();

    // Viewport oval bounds that match the cockpit image
    const getVP = (w: number, h: number) => ({
      left: w * 0.22,
      right: w * 0.78,
      top: h * 0.08,
      bottom: h * 0.72,
    });

    const drawCrosshair = (w: number, h: number) => {
      const ox = w / 2;
      const oy = h * 0.4;
      ctx.strokeStyle = "rgba(0, 255, 255, 0.35)";
      ctx.lineWidth = 1;

      for (const [ax, ay, bx, by] of [
        [ox - 30, oy, ox - 10, oy],
        [ox + 10, oy, ox + 30, oy],
        [ox, oy - 30, ox, oy - 10],
        [ox, oy + 10, ox, oy + 30],
      ] as [number, number, number, number][]) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Small center dot
      ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(ox, oy, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSweep = (w: number, h: number) => {
      const { left, right, top, bottom } = getVP(w, h);
      const vpWidth = right - left;

      const sweepX = left + sweepXRef.current * vpWidth;
      if (sweepX < left || sweepX > right) return;

      const grad = ctx.createLinearGradient(sweepX - 30, top, sweepX + 6, top);
      grad.addColorStop(0, "rgba(0,255,255,0)");
      grad.addColorStop(0.7, "rgba(0,255,255,0.12)");
      grad.addColorStop(1, "rgba(0,255,255,0.28)");

      ctx.fillStyle = grad;
      ctx.fillRect(sweepX - 30, top, 36, bottom - top);

      ctx.strokeStyle = "rgba(0,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepX, top);
      ctx.lineTo(sweepX, bottom);
      ctx.stroke();
    };

    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      sweepXRef.current = (sweepXRef.current + delta / SWEEP_DURATION) % 1;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      drawCrosshair(w, h);
      drawSweep(w, h);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Glass shimmer behind the oval viewport */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 9,
          background:
            "radial-gradient(ellipse 55% 55% at 50% 40%, rgba(100,180,255,0.06) 0%, rgba(80,160,255,0.10) 55%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Cockpit PNG — rendered as a normal transparent overlay.
          The PNG has an alpha-transparent viewport oval so the 3D scene
          shows through naturally. No blend mode needed. */}
      <img
        src="/assets/uploads/BE9FB45D-BD44-496F-8D21-511D5E824EFE-1.png"
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={
          {
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 10,
            userSelect: "none",
          } as React.CSSProperties
        }
        draggable={false}
      />

      {/* Frosted glass edge vignette — adds subtle depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background:
            "radial-gradient(ellipse 62% 58% at 50% 40%, transparent 72%, rgba(8,14,24,0.35) 88%, rgba(5,10,18,0.65) 100%)",
        }}
      />

      {/* Canvas: crosshair + sweep animation on top */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 11 }}
      />
    </div>
  );
}
