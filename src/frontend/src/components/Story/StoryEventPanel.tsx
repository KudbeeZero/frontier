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
import { useEffect } from "react";
import { useStoryStore } from "../../stores/storyStore";
import { speakText } from "../../utils/voiceNarration";

export function StoryEventPanel() {
  const { currentEvent, isVisible, selectChoice, dismiss } = useStoryStore();

  // Speak A.E.G.I.S. dialogue when a new event appears
  useEffect(() => {
    if (currentEvent && isVisible) {
      speakText(currentEvent.dialogue);
    }
  }, [currentEvent, isVisible]);

  if (!currentEvent) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out"
      style={{ transform: isVisible ? "translateY(0)" : "translateY(100%)" }}
    >
      <div className="mx-auto max-w-3xl px-4 pb-6">
        <div className="rounded-t-xl border border-cyan-500/50 bg-[#040d1a]/95 p-5 shadow-[0_0_40px_rgba(0,255,255,0.15)] backdrop-blur-md">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
                {currentEvent.speaker}
              </span>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="text-cyan-600 transition-colors hover:text-cyan-300"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="Close"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Dialogue */}
          <p className="mb-4 font-mono text-sm leading-relaxed text-cyan-100/90">
            {currentEvent.dialogue}
          </p>

          {/* Choices */}
          <div className="flex flex-col gap-2">
            {currentEvent.choices.map((choice) => (
              <button
                type="button"
                key={choice.id}
                onClick={() => selectChoice(choice)}
                className="group flex items-center gap-3 rounded border border-cyan-700/50 bg-cyan-950/40 px-4 py-2 text-left transition-all hover:border-cyan-400/80 hover:bg-cyan-900/40"
              >
                <span className="text-cyan-500 transition-colors group-hover:text-cyan-300">
                  &gt;
                </span>
                <span className="font-mono text-sm text-cyan-200 group-hover:text-white">
                  {choice.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
}
