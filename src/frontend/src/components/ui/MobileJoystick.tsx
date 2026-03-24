import { useEffect, useRef, useState } from "react";
import { THRUST_RATE, useShipStore } from "../../stores/useShipStore";

export function MobileJoystick() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });

  const maxDistance = 60;

  // Keep positionRef in sync with position state
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const shipStore = useShipStore.getState();
      const thrustX = (positionRef.current.x / maxDistance) * THRUST_RATE * 16;
      const thrustY = (positionRef.current.y / maxDistance) * THRUST_RATE * 16;

      shipStore.applyThrust(thrustX, -thrustY);
    }, 16);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive) return;

    const touch = e.touches[0];
    let dx = touch.clientX - touchStartPos.current.x;
    let dy = touch.clientY - touchStartPos.current.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed bottom-8 left-8 pointer-events-auto md:hidden">
      <div
        ref={joystickRef}
        className="relative w-36 h-36 rounded-full border-2 border-primary/40 bg-black/40"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Joystick knob */}
        <div
          className="absolute w-16 h-16 rounded-full bg-primary/60 border-2 border-primary"
          style={{
            left: `calc(50% - 2rem + ${position.x}px)`,
            top: `calc(50% - 2rem + ${position.y}px)`,
            transition: isActive ? "none" : "all 0.2s ease-out",
          }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-primary/80 rounded-full" />
      </div>

      <div className="text-xs text-primary/60 text-center mt-2">MOVE</div>
    </div>
  );
}
