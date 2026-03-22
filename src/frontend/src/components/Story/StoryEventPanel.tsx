import React from "react";
import { useStoryStore } from "../../stores/storyStore";
import type { EventChoice, Phase1EventId } from "../../stores/storyStore";

function EffectTag({
  value,
  label,
  positiveColor,
  negativeColor,
}: {
  value: number;
  label: string;
  positiveColor: string;
  negativeColor: string;
}) {
  const isPositive = value > 0;
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded"
      style={{ color: isPositive ? positiveColor : negativeColor }}
    >
      {isPositive ? "▲" : "▼"} {Math.abs(value)} {label}
    </span>
  );
}

function ChoiceButton({
  choice,
  index,
  eventId,
  onChoose,
}: {
  choice: EventChoice;
  index: number;
  eventId: Phase1EventId;
  onChoose: (id: Phase1EventId, idx: number) => void;
}) {
  return (
    <button
      onClick={() => onChoose(eventId, index)}
      className="w-full text-left p-4 bg-gray-800 border border-cyan-500/30 hover:border-cyan-500 hover:bg-gray-700 rounded transition-all active:scale-[0.98] focus:outline-none focus:border-cyan-500"
      style={{ minHeight: "60px" }}
    >
      <p className="text-white font-medium text-sm mb-2">{choice.text}</p>
      {choice.effects && (
        <div className="flex flex-wrap gap-2">
          {choice.effects.oxygen !== undefined && (
            <EffectTag
              value={choice.effects.oxygen}
              label="O₂"
              positiveColor="#4ade80"
              negativeColor="#f87171"
            />
          )}
          {choice.effects.hull !== undefined && (
            <EffectTag
              value={choice.effects.hull}
              label="HULL"
              positiveColor="#4ade80"
              negativeColor="#f87171"
            />
          )}
          {choice.effects.power !== undefined && (
            <EffectTag
              value={choice.effects.power}
              label="PWR"
              positiveColor="#fbbf24"
              negativeColor="#f87171"
            />
          )}
          {choice.effects.fuel !== undefined && (
            <EffectTag
              value={choice.effects.fuel}
              label="FUEL"
              positiveColor="#22d3ee"
              negativeColor="#f87171"
            />
          )}
        </div>
      )}
    </button>
  );
}

export const StoryEventPanel: React.FC = () => {
  const { pendingEvent, makeChoice, dismissEvent } = useStoryStore();

  if (!pendingEvent) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-label="A.E.G.I.S. Message"
    >
      {/* Panel */}
      <div className="relative bg-gray-900 border-t-2 border-cyan-500 max-h-[60vh] overflow-y-auto">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/30">
            <span className="text-cyan-500 text-lg leading-none">▼</span>
            <h3 className="text-cyan-500 font-semibold text-sm tracking-[0.15em] font-mono">
              A.E.G.I.S. MESSAGE
            </h3>
          </div>

          {/* A.E.G.I.S. Dialogue */}
          <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 rounded">
            <p className="text-cyan-100 text-sm leading-relaxed font-mono">
              &ldquo;{pendingEvent.aegisDialogue}&rdquo;
            </p>
          </div>

          {/* Narrative */}
          <p className="text-gray-300 text-sm leading-relaxed">
            {pendingEvent.narrative}
          </p>

          {/* Choices */}
          {pendingEvent.choices.length > 0 ? (
            <div className="space-y-3 pt-1">
              {pendingEvent.choices.map((choice, index) => (
                <ChoiceButton
                  key={index}
                  choice={choice}
                  index={index}
                  eventId={pendingEvent.id}
                  onChoose={makeChoice}
                />
              ))}
            </div>
          ) : (
            <button
              onClick={dismissEvent}
              className="w-full p-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded transition-colors font-mono"
              style={{ minHeight: "60px" }}
            >
              Continue
            </button>
          )}

          {/* Dismiss hint */}
          <p className="text-center text-gray-600 text-xs pt-1 font-mono">
            TAP A CHOICE TO CONTINUE
          </p>
        </div>
      </div>
    </div>
  );
};
