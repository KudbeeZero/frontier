import { useGameStore } from "../../stores/gameStore";
import type { NotificationType } from "../../types/game";

const typeColors: Record<NotificationType, string> = {
  info: "border-cyan-500/50 text-cyan-300",
  warning: "border-amber-500/50 text-amber-300",
  success: "border-green-500/50 text-green-300",
  danger: "border-red-500/50 text-red-300",
};

export default function NotificationSystem() {
  const notifications = useGameStore((s) => s.notifications);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none z-20">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`hud-panel px-4 py-2 text-xs font-mono border-l-2 animate-in slide-in-from-top-2 ${typeColors[n.type]}`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
