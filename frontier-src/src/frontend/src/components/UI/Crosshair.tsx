import { useShipStore } from "../../stores/shipStore";

interface CrosshairProps {
  targetId: string | null;
  targetDistance: number;
}

export default function Crosshair({
  targetId,
  targetDistance,
}: CrosshairProps) {
  const isMining = useShipStore((s) => s.isMining);
  const inRange = targetId !== null && targetDistance < 50;
  const color = isMining
    ? "#FFB700"
    : inRange
      ? "#00E6FF"
      : "rgba(255,255,255,0.4)";

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative" style={{ width: 60, height: 60 }}>
        <svg width={60} height={60} viewBox="0 0 60 60" aria-hidden="true">
          <path
            d="M5,20 L5,5 L20,5"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
          <path
            d="M40,5 L55,5 L55,20"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
          <path
            d="M5,40 L5,55 L20,55"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
          <path
            d="M40,55 L55,55 L55,40"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
          />
          <circle cx={30} cy={30} r={1.5} fill={color} />
          {isMining && (
            <circle
              cx={30}
              cy={30}
              r={12}
              fill="none"
              stroke={color}
              strokeWidth={1}
              opacity={0.5}
              className="animate-ping"
            />
          )}
        </svg>
        {inRange && !isMining && (
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] font-mono whitespace-nowrap"
            style={{ color: "#00E6FF" }}
          >
            {Math.round(targetDistance)}m
          </div>
        )}
        {isMining && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] font-mono whitespace-nowrap text-amber-400">
            MINING...
          </div>
        )}
      </div>
    </div>
  );
}
