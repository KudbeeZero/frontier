import { create } from "zustand";
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
  id: string;
  speaker: string;
  dialogue: string;
  choices: StoryChoice[];
}

const STORY_EVENTS: Record<string, StoryEvent> = {
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
        text: "Restore comms -- we need backup",
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
      "I'm detecting an unusual transmission... Commander, this could be important.",
    choices: [
      {
        id: "investigate",
        text: "Investigate",
        effects: {},
      },
      {
        id: "ignore",
        text: "Ignore",
        effects: {},
      },
    ],
  },
};

interface StoryState {
  currentEvent: StoryEvent | null;
  isVisible: boolean;
  completedEvents: string[];
  currentStage: number;
  isStoryMode: boolean;
  storyStartTime: number | null;
  nearDepot: boolean;

  triggerEvent: (eventId: string) => void;
  selectChoice: (choice: StoryChoice) => void;
  dismiss: () => void;
  enterStoryMode: () => void;
  exitStoryMode: () => void;
  setNearDepot: (near: boolean) => void;
  markEventComplete: (eventId: string) => void;
  checkUnlocks: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  currentEvent: null,
  isVisible: false,
  completedEvents: [],
  currentStage: 1,
  isStoryMode: false,
  storyStartTime: null,
  nearDepot: false,

  triggerEvent: (eventId: string) => {
    const event = STORY_EVENTS[eventId];
    if (event) set({ currentEvent: event, isVisible: true });
  },

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
    // Lazy import to avoid circular deps
    import("./cameraStore").then(({ useCameraStore }) => {
      useCameraStore.getState().setMode("freeRoam");
      useCameraStore.getState().setFreeRoamPos({ x: 420, y: 0, z: 420 });
    });
    set({ isStoryMode: true, storyStartTime: Date.now() });
  },

  exitStoryMode: () =>
    set({ isStoryMode: false, storyStartTime: null, nearDepot: false }),

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
