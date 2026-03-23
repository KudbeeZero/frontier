import { useStoryStore } from "../../stores/storyStore";

const CHOICE_LABELS = ["A", "B", "C", "D"];

export function StoryPanel() {
  const { currentEvent, isVisible, selectChoice, dismiss } = useStoryStore();

  return (
    <>
      {/* Dark overlay behind panel */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 48,
          pointerEvents: "none",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 300ms ease-out",
        }}
      />

      {/* Slide-up panel — bottom 50% of screen */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50vh",
          zIndex: 49,
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease-out",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        <div
          style={{
            background: "rgba(4,13,26,0.95)",
            borderTop: "2px solid #00ffff",
            height: "100%",
            overflowY: "auto",
            padding: "16px 20px",
            boxSizing: "border-box",
            backdropFilter: "blur(12px)",
          }}
        >
          {currentEvent && (
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              {/* A.E.G.I.S. dialogue box */}
              <div
                style={{
                  background: "rgba(0,255,255,0.08)",
                  border: "1px solid #00ccff",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#00e5ff",
                      boxShadow: "0 0 8px #00e5ff",
                      flexShrink: 0,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "11px",
                      fontWeight: "bold",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#00e5ff",
                      textShadow: "0 0 8px rgba(0,229,255,0.7)",
                    }}
                  >
                    {currentEvent.speaker}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.9)",
                    margin: 0,
                  }}
                >
                  &ldquo;{currentEvent.dialogue}&rdquo;
                </p>
              </div>

              {/* Choices */}
              {currentEvent.choices.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {currentEvent.choices.map((choice, index) => (
                    <button
                      type="button"
                      key={choice.id}
                      onClick={() => selectChoice(choice)}
                      data-ocid={`story.choice.${index + 1}`}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        minHeight: "60px",
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(0,200,255,0.4)",
                        borderRadius: "5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition:
                          "border-color 150ms ease, background 150ms ease",
                        boxSizing: "border-box",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "#00ccff";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(0,200,255,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(0,200,255,0.4)";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(0,0,0,0.5)";
                      }}
                    >
                      {/* Letter badge */}
                      <span
                        style={{
                          flexShrink: 0,
                          width: "26px",
                          height: "26px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(0,200,255,0.5)",
                          borderRadius: "4px",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#00ccff",
                        }}
                      >
                        {CHOICE_LABELS[index] ?? index + 1}
                      </span>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#ffffff",
                            marginBottom: choice.effects ? "5px" : 0,
                          }}
                        >
                          {choice.text}
                        </div>
                        {choice.effects &&
                          Object.keys(choice.effects).length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                fontFamily: "monospace",
                                fontSize: "10px",
                              }}
                            >
                              {choice.effects.oxygen !== undefined && (
                                <span
                                  style={{
                                    color:
                                      choice.effects.oxygen > 0
                                        ? "#00ff88"
                                        : "#ff4444",
                                  }}
                                >
                                  {choice.effects.oxygen > 0 ? "+" : ""}
                                  {choice.effects.oxygen} O₂
                                </span>
                              )}
                              {choice.effects.hull !== undefined && (
                                <span
                                  style={{
                                    color:
                                      choice.effects.hull > 0
                                        ? "#00ff88"
                                        : "#ff4444",
                                  }}
                                >
                                  {choice.effects.hull > 0 ? "+" : ""}
                                  {choice.effects.hull} HULL
                                </span>
                              )}
                              {choice.effects.power !== undefined && (
                                <span
                                  style={{
                                    color:
                                      choice.effects.power > 0
                                        ? "#ffe066"
                                        : "#ff4444",
                                  }}
                                >
                                  {choice.effects.power > 0 ? "+" : ""}
                                  {choice.effects.power} PWR
                                </span>
                              )}
                              {choice.effects.fuel !== undefined && (
                                <span
                                  style={{
                                    color:
                                      choice.effects.fuel > 0
                                        ? "#00ccff"
                                        : "#ff4444",
                                  }}
                                >
                                  {choice.effects.fuel > 0 ? "+" : ""}
                                  {choice.effects.fuel} FUEL
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={dismiss}
                  data-ocid="story.close_button"
                  style={{
                    width: "100%",
                    padding: "14px",
                    minHeight: "60px",
                    background: "rgba(0,200,255,0.15)",
                    border: "1px solid #00ccff",
                    borderRadius: "5px",
                    color: "#00ccff",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
