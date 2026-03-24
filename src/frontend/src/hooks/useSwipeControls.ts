import { useEffect } from "react";
import { useLaneStore } from "../stores/laneStore";

export function useSwipeControls() {
  const { changeLane, setAimAngle } = useLaneStore();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      // Map horizontal drag to aim angle continuously (-90 to +90)
      const angle = (dx / window.innerWidth) * 180;
      setAimAngle(angle);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - startTime;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      // Fast vertical swipe = lane change
      if (Math.abs(dy) > Math.abs(dx) * 1.5 && speed > 0.3) {
        if (dy < -30) changeLane("up");
        else if (dy > 30) changeLane("down");
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [changeLane, setAimAngle]);
}
