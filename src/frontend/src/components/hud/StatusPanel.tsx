export function StatusPanel() {
  const hull = 100;
  const power = 100;
  const oxygen = 100;

  const barColor = (v: number) =>
    v > 60 ? "#00ff88" : v > 30 ? "#ffb700" : "#ff3333";

  const Row = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span style={{ color: barColor(value) }} className="font-mono">
          {label}
        </span>
        <span className="text-cyan-400/70">{value}%</span>
      </div>
      <div className="h-1.5 bg-black/50 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: barColor(value),
            boxShadow: `0 0 6px ${barColor(value)}`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="hud-panel p-3 pointer-events-none min-w-[160px]">
      <div className="text-cyan-400 text-xs uppercase tracking-widest mb-3 text-glow-cyan">
        Status
      </div>
      <div className="space-y-2.5 text-xs">
        <Row label="HULL" value={hull} />
        <Row label="POWER" value={power} />
        <Row label="O&#8322;" value={oxygen} />
      </div>
    </div>
  );
}
