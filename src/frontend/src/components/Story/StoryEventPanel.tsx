import { useStoryStore } from "../../stores/storyStore";

export function StoryEventPanel() {
  const { currentEvent, isVisible, selectChoice, dismiss } = useStoryStore();

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
}
