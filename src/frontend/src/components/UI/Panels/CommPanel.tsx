import { useStoryStore } from "../../../stores/storyStore";

export function CommPanel() {
  const currentEvent = useStoryStore((s) => s.currentEvent);

  return (
    <div className="space-y-3 font-mono text-xs">
      <div
        className="text-[10px] text-cyan-500/50 uppercase tracking-widest pb-2"
        style={{ borderBottom: "1px solid rgba(0,200,255,0.15)" }}
      >
        Transmission Log
      </div>

      {currentEvent ? (
        <div
          className="rounded p-3 space-y-1"
          style={{
            background: "rgba(0,200,255,0.05)",
            border: "1px solid rgba(0,200,255,0.2)",
          }}
        >
          <div className="text-cyan-400 uppercase tracking-widest text-[10px]">
            {currentEvent.speaker}
          </div>
          <div className="text-gray-300 leading-relaxed">
            {currentEvent.dialogue}
          </div>
        </div>
      ) : (
        <div className="text-center text-cyan-500/30 uppercase tracking-widest py-6">
          NO ACTIVE TRANSMISSIONS
        </div>
      )}

      <div
        className="text-cyan-500/30 uppercase tracking-widest text-[10px] pt-2"
        style={{ borderTop: "1px solid rgba(0,200,255,0.15)" }}
      >
        A.E.G.I.S. COMM RELAY · SECURE CHANNEL
      </div>
    </div>
  );
}
