import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShipStore } from "./shipStore";

export type Phase1EventId =
  | "p1_systems_damaged"
  | "p1_oxygen_warning"
  | "p1_aegis_first_contact";

export interface EventChoice {
  text: string;
  consequence: string;
import { AEGIS_VOICE_ID, playVoiceLine } from "../services/elevenLabsService";
import { useShipStore } from "./shipStore";

export interface StoryChoice {
  id: string;
  text: string;
  nextEvent?: string;
  effects?: {
    oxygen?: number;
    hull?: number;
    power?: number;
    fuel?: number;
  };
}

export interface StoryEvent {
  id: Phase1EventId;
  aegisDialogue: string;
  narrative: string;
  choices: EventChoice[];
}

const PHASE1_EVENTS: StoryEvent[] = [
  {
    id: "p1_systems_damaged",
    aegisDialogue:
      "Commander. Damage assessment complete. Primary systems are offline. We are adrift.",
    narrative:
      "The ship lurches as another power relay fails. A.E.G.I.S. runs a rapid diagnostic — the news is not good.",
    choices: [
      {
        text: "Reroute power to life support",
        consequence: "Life support stabilized. Power reduced.",
        effects: { oxygen: 20, power: -15 },
      },
      {
        text: "Prioritize hull integrity",
        consequence: "Hull reinforced. Oxygen at risk.",
        effects: { hull: 15, oxygen: -10 },
      },
      {
        text: "Send distress signal",
        consequence: "Signal broadcast. Power drained.",
        effects: { power: -5 },
      },
    ],
  },
  {
    id: "p1_oxygen_warning",
    aegisDialogue:
      "Warning. Oxygen recycler efficiency dropping. Estimated breathable atmosphere: 4 hours.",
    narrative:
      "The air tastes stale. A.E.G.I.S. flags the recycler failure.",
    choices: [
      {
        text: "Emergency vent and recycle",
        consequence: "Oxygen partially restored.",
        effects: { oxygen: 15, hull: -5 },
      },
      {
        text: "Reduce activity to conserve",
        consequence: "Oxygen consumption slowed.",
        effects: { oxygen: 5 },
      },
    ],
  },
  {
    id: "p1_aegis_first_contact",
    aegisDialogue:
      "I have detected a signal. Origin: unknown. It is not natural. Commander… we are not alone out here.",
    narrative:
      "A.E.G.I.S. triangulates a faint repeating signal from deep space. Its pattern is deliberate. Artificial.",
    choices: [
      {
        text: "Investigate the signal",
        consequence: "Course set. Unknown ahead.",
        effects: { fuel: -10 },
      },
      {
        text: "Ignore — focus on repairs",
        consequence: "Signal fades. Safety first.",
        effects: { oxygen: 5, hull: 5 },
      },
    ],
  },
];

interface StoryState {
  triggeredEvents: Phase1EventId[];
  pendingEvent: StoryEvent | null;

  triggerEvent: (eventId: Phase1EventId) => void;
  makeChoice: (eventId: Phase1EventId, choiceIndex: number) => void;
  dismissEvent: () => void;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      triggeredEvents: [],
      pendingEvent: null,

      triggerEvent: (eventId) => {
        const s = get();
        if (s.triggeredEvents.includes(eventId)) return;
        if (s.pendingEvent) return;

        const eventDef = PHASE1_EVENTS.find((e) => e.id === eventId);
        if (!eventDef) return;

        set({
          triggeredEvents: [...s.triggeredEvents, eventId],
          pendingEvent: eventDef,
        });
      },

      makeChoice: (eventId, choiceIndex) => {
        const eventDef = PHASE1_EVENTS.find((e) => e.id === eventId);
        if (!eventDef) return;

        const choice = eventDef.choices[choiceIndex];
        if (!choice) return;

        const effects = choice.effects ?? {};
        const ship = useShipStore.getState();

        if (effects.oxygen !== undefined) {
          const next = Math.max(0, Math.min(100, ship.oxygen + effects.oxygen));
          useShipStore.setState({ oxygen: next });
        }
        if (effects.hull !== undefined) {
          const next = Math.max(
            0,
            Math.min(ship.maxHull, ship.hull + effects.hull)
          );
          useShipStore.setState({ hull: next });
        }
        if (effects.power !== undefined) {
          const next = Math.max(0, Math.min(100, ship.power + effects.power));
          useShipStore.setState({ power: next });
        }
        if (effects.fuel !== undefined) {
          const next = Math.max(
            0,
            Math.min(ship.maxFuel, ship.fuel + effects.fuel)
          );
          useShipStore.setState({ fuel: next });
        }

        set({ pendingEvent: null });
      },

      dismissEvent: () => set({ pendingEvent: null }),
    }),
    {
      name: "frontier_story",
      partialize: (state) => ({ triggeredEvents: state.triggeredEvents }),
    }
  )
);
  id: string;
  speaker: string;
  dialogue: string;
  choices: StoryChoice[];
}

const STORY_EVENTS: Record<string, StoryEvent> = {
  // ── tutorial events ───────────────────────────────────────────────────────
  tutorial_welcome: {
    id: "tutorial_welcome",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Commander. I am A.E.G.I.S. — your Adaptive Electronic Guardian and Intelligence System. I will be your guide during this mission. Welcome to Frontier. Let me walk you through what you need to know.",
    choices: [{ id: "next", text: "Ready. Let's begin.", nextEvent: "tutorial_controls" }],
  },
  tutorial_controls: {
    id: "tutorial_controls",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Movement: use W/A/S/D to navigate. Your mouse controls your aim and camera direction. Hold SPACE for a speed boost. Press F to fire your weapons. Use Q and E to switch between orbital altitude lanes — lower lanes are safer, higher lanes are more dangerous.",
    choices: [{ id: "next", text: "Got it. What about combat?", nextEvent: "tutorial_combat" }],
  },
  tutorial_combat: {
    id: "tutorial_combat",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Switch to COMBAT mode using the top navigation bar. Ground targets will appear on the surface below. Keep your crosshair on a target for 0.5 seconds to lock on, then press F to fire. Destroy all targets in a level to advance. Higher levels have shielded targets and return fire — watch your hull integrity.",
    choices: [{ id: "next", text: "Understood. What about the HUD?", nextEvent: "tutorial_hud" }],
  },
  tutorial_hud: {
    id: "tutorial_hud",
    speaker: "A.E.G.I.S.",
    dialogue:
      "The bottom navigation bar gives you quick access to your systems: CARGO for resources, MAP for navigation, COMM for communications, STATS for your ship status, and MENU for the full panel hub. Your orbital level progress is shown on the left side in combat mode. Press ESC at any time to pause.",
    choices: [{ id: "next", text: "I'm ready, A.E.G.I.S.", nextEvent: "tutorial_complete" }],
  },
  tutorial_complete: {
    id: "tutorial_complete",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Excellent. You have everything you need to survive out here, Commander. Stay sharp, watch your resources, and trust your instincts. The frontier is unforgiving — but so are you. Good luck.",
    choices: [{ id: "begin", text: "Begin mission." }],
  },
  // ── original events ──────────────────────────────────────────────────────
  p1_systems_damaged: {
    id: "p1_systems_damaged",
    speaker: "A.E.G.I.S.",
    dialogue:
      "WARNING: Critical system failure detected. Hull integrity at 42%. Navigation offline. Commander, we need to assess the damage before it is too late.",
    choices: [
      {
        id: "scan",
        text: "Run a full diagnostic scan",
        nextEvent: "p1_scan_results",
      },
      {
        id: "repair",
        text: "Begin emergency repairs",
        nextEvent: "p1_repair_start",
        effects: { hull: 15, power: -10 },
      },
      {
        id: "ignore",
        text: "We push on. No time to stop.",
        nextEvent: undefined,
      },
    ],
  },
  p1_scan_results: {
    id: "p1_scan_results",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Scan complete. Three critical systems are offline: propulsion dampeners, the oxygen recycler, and long-range comms. I recommend prioritizing the recycler.",
    choices: [
      {
        id: "recycler",
        text: "Fix the oxygen recycler first",
        nextEvent: undefined,
        effects: { oxygen: 20, power: -15 },
      },
      {
        id: "propulsion",
        text: "Propulsion comes first",
        nextEvent: undefined,
        effects: { fuel: 20, power: -10 },
      },
      {
        id: "comms",
        text: "Restore comms — we need backup",
        nextEvent: undefined,
      },
    ],
  },
  p1_repair_start: {
    id: "p1_repair_start",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Emergency repair sequence initiated. I will need you to gather raw materials from the nearby asteroid cluster. Iron and Silicon should do the trick.",
    choices: [
      { id: "mine", text: "Head to the asteroid field", nextEvent: undefined },
      {
        id: "scavenge",
        text: "Check the derelict ships nearby",
        nextEvent: undefined,
      },
    ],
  },
  // ── story mode events ──────────────────────────────────────────────────
  depot_arrival: {
    id: "depot_arrival",
    speaker: "A.E.G.I.S.",
    dialogue: "Commander, this depot appears functional. We should resupply.",
    choices: [
      {
        id: "repair_hull",
        text: "Repair hull (+20 hull, -50 credits)",
        effects: { hull: 20 },
      },
      {
        id: "refuel",
        text: "Refuel (+30 fuel)",
        effects: { fuel: 30 },
      },
      {
        id: "leave",
        text: "Leave",
        effects: {},
      },
    ],
  },
  systems_critical: {
    id: "systems_critical",
    speaker: "A.E.G.I.S.",
    dialogue:
      "Warning. Multiple system failures detected. We need to act now, Commander.",
    choices: [
      {
        id: "fix_life_support",
        text: "Fix life support (+15 O\u2082, -10 PWR)",
        effects: { oxygen: 15, power: -10 },
      },
      {
        id: "repair_hull",
        text: "Repair hull (+20 hull)",
        effects: { hull: 20 },
      },
      {
        id: "balance_systems",
        text: "Balance systems (+5 all)",
        effects: { oxygen: 5, hull: 5, power: 5, fuel: 5 },
      },
    ],
  },
  strange_signal: {
    id: "strange_signal",
    speaker: "A.E.G.I.S.",
    dialogue:
      "I'm detecting an unusual transmission on a non-standard frequency. Commander, this could be important. The signal appears to originate from deep space — outside our current sector.",
    choices: [
      {
        id: "investigate",
        text: "Investigate the anomaly",
        effects: {},
      },
      {
        id: "report",
        text: "Report to command station",
        effects: {},
      },
      {
        id: "ignore",
        text: "Ignore it — stay on mission",
        effects: {},
      },
    ],
  },
};

export interface ObjectivePosition {
  x: number;
  y: number;
  z: number;
}

interface StoryState {
  currentEvent: StoryEvent | null;
  isVisible: boolean;
  completedEvents: string[];
  currentStage: number;
  isStoryMode: boolean;
  isTutorialMode: boolean;
  storyStartTime: number | null;
  nearDepot: boolean;
  /** Current navigation objective in world space (null = no target) */
  objectivePosition: ObjectivePosition | null;
  /** Short human-readable label shown next to the arrow */
  objectiveLabel: string;

  triggerEvent: (eventId: string) => void;
  selectChoice: (choice: StoryChoice) => void;
  dismiss: () => void;
  enterStoryMode: () => void;
  exitStoryMode: () => void;
  enterTutorialMode: () => void;
  exitTutorialMode: () => void;
  setNearDepot: (near: boolean) => void;
  markEventComplete: (eventId: string) => void;
  checkUnlocks: () => void;
  setObjective: (pos: ObjectivePosition | null, label?: string) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  currentEvent: null,
  isVisible: false,
  completedEvents: [],
  currentStage: 1,
  isStoryMode: false,
  isTutorialMode: false,
  storyStartTime: null,
  nearDepot: false,
  objectivePosition: null,
  objectiveLabel: "",

  triggerEvent: (eventId: string) => {
    const event = STORY_EVENTS[eventId];
    if (event) set({ currentEvent: event, isVisible: true });
  },

  setObjective: (pos, label = "") =>
    set({ objectivePosition: pos, objectiveLabel: label }),

  selectChoice: (choice: StoryChoice) => {
    // Apply resource effects to ship
    const effects = choice.effects ?? {};
    const ship = useShipStore.getState();
    if (effects.oxygen) ship.updateOxygen(effects.oxygen);
    if (effects.hull) ship.updateHull(effects.hull);
    if (effects.power) ship.updatePower(effects.power);
    if (effects.fuel) ship.updateFuel(effects.fuel);

    // Mark the current event complete
    const currentId = get().currentEvent?.id;
    if (currentId) {
      get().markEventComplete(currentId);
    }

    // Handle strange_signal branch — update navigation objective
    if (currentId === "strange_signal") {
      if (choice.id === "investigate") {
        get().setObjective({ x: 1200, y: 200, z: -800 }, "ANOMALY");
        playVoiceLine(
          "Anomaly coordinates locked. Proceeding to investigate the signal source. Stay alert, Commander.",
          AEGIS_VOICE_ID,
        ).catch(() => {});
      } else if (choice.id === "report") {
        get().setObjective({ x: 0, y: 0, z: 0 }, "CMD STATION");
        playVoiceLine(
          "Plotting course to command station. Transmitting full signal analysis on arrival.",
          AEGIS_VOICE_ID,
        ).catch(() => {});
      } else if (choice.id === "ignore") {
        get().setObjective(null, "");
        playVoiceLine(
          "Understood. Signal logged for later review. Continuing current mission profile.",
          AEGIS_VOICE_ID,
        ).catch(() => {});
      }
      set({ isVisible: false });
      get().checkUnlocks();
      return;
    }

    // Handle tutorial_complete — end tutorial mode
    if (currentId === "tutorial_complete") {
      set({ isVisible: false });
      get().exitTutorialMode();
      return;
    }

    // Navigate to next event or dismiss
    if (choice.nextEvent) {
      const next = STORY_EVENTS[choice.nextEvent];
      if (next) {
        set({ currentEvent: next, isVisible: true });
        get().checkUnlocks();
        return;
      }
    }
    set({ isVisible: false });
    get().checkUnlocks();
  },

  dismiss: () => set({ isVisible: false }),

  enterStoryMode: () => {
    // Set initial objective to the Space Depot
    get().setObjective({ x: 500, y: 0, z: 500 }, "DEPOT");
    // Lazy import to avoid circular deps
    import("./cameraStore").then(({ useCameraStore }) => {
      useCameraStore.getState().setMode("freeRoam");
      useCameraStore.getState().setFreeRoamPos({ x: 420, y: 0, z: 420 });
    });
    set({ isStoryMode: true, storyStartTime: Date.now() });
  },

  exitStoryMode: () =>
    set({
      isStoryMode: false,
      storyStartTime: null,
      nearDepot: false,
      objectivePosition: null,
      objectiveLabel: "",
    }),

  enterTutorialMode: () => set({ isTutorialMode: true }),

  exitTutorialMode: () => set({ isTutorialMode: false }),

  setNearDepot: (near: boolean) => set({ nearDepot: near }),

  markEventComplete: (eventId: string) =>
    set((s) => ({
      completedEvents: s.completedEvents.includes(eventId)
        ? s.completedEvents
        : [...s.completedEvents, eventId],
    })),

  checkUnlocks: () => {
    const { completedEvents, isVisible } = get();
    if (
      completedEvents.includes("depot_arrival") &&
      completedEvents.includes("systems_critical") &&
      !completedEvents.includes("strange_signal") &&
      !isVisible
    ) {
      get().triggerEvent("strange_signal");
    }
  },
}));
