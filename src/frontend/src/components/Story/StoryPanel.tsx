import { useStoryStore } from "../../stores/storyStore";

const CHOICE_LABELS = ["A", "B", "C", "D"];

export function StoryPanel() {
  const { currentEvent, isVisible, selectChoice, dismiss } = useStoryStore();

  if (!isVisible || !currentEvent) return null;

  const handleBackdropKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") dismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 px-4 pointer-events-none">
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={currentEvent.choices.length === 0 ? 0 : -1}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={currentEvent.choices.length === 0 ? dismiss : undefined}
        onKeyDown={
          currentEvent.choices.length === 0 ? handleBackdropKey : undefined
        }
        aria-label="Dismiss story panel"
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl pointer-events-auto">
        <div className="bg-gray-950/95 border-t-2 border-cyan-500 rounded-t-lg shadow-2xl shadow-cyan-500/20">
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-widest font-mono">
                {currentEvent.speaker}
              </h3>
            </div>

            {/* Dialogue */}
            <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 rounded">
              <p className="text-cyan-100 text-base leading-relaxed font-mono">
                &ldquo;{currentEvent.dialogue}&rdquo;
              </p>
            </div>

            {/* Choices */}
            {currentEvent.choices.length > 0 ? (
              <div className="space-y-3 pt-2">
                {currentEvent.choices.map((choice, index) => (
                  <button
                    type="button"
                    key={choice.id}
                    onClick={() => selectChoice(choice)}
                    className="w-full text-left p-4 bg-gray-900/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-gray-800/80 rounded transition-all active:scale-[0.98] group"
                    style={{ minHeight: "60px" }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Letter label */}
                      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center border border-cyan-500/60 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 rounded text-cyan-400 font-mono font-bold text-sm transition-all">
                        {CHOICE_LABELS[index] ?? index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm mb-1">
                          {choice.text}
                        </p>
                        {choice.effects && (
                          <div className="flex flex-wrap gap-3 text-xs font-mono">
                            {choice.effects.oxygen !== undefined && (
                              <span
                                className={
                                  choice.effects.oxygen > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {choice.effects.oxygen > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(choice.effects.oxygen)} O₂
                              </span>
                            )}
                            {choice.effects.hull !== undefined && (
                              <span
                                className={
                                  choice.effects.hull > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {choice.effects.hull > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(choice.effects.hull)} HULL
                              </span>
                            )}
                            {choice.effects.power !== undefined && (
                              <span
                                className={
                                  choice.effects.power > 0
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }
                              >
                                {choice.effects.power > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(choice.effects.power)} PWR
                              </span>
                            )}
                            {choice.effects.fuel !== undefined && (
                              <span
                                className={
                                  choice.effects.fuel > 0
                                    ? "text-cyan-400"
                                    : "text-red-400"
                                }
                              >
                                {choice.effects.fuel > 0 ? "▲" : "▼"}{" "}
                                {Math.abs(choice.effects.fuel)} FUEL
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="w-full p-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded transition-colors text-sm uppercase tracking-wide"
                style={{ minHeight: "60px" }}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
