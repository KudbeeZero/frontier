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
};

interface StoryState {
  currentEvent: StoryEvent | null;
  isVisible: boolean;
  triggerEvent: (eventId: string) => void;
  selectChoice: (choice: StoryChoice) => void;
  dismiss: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  currentEvent: null,
  isVisible: false,
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

    // Navigate to next event or dismiss
    if (choice.nextEvent) {
      const next = STORY_EVENTS[choice.nextEvent];
      if (next) {
        set({ currentEvent: next, isVisible: true });
        return;
      }
    }
    set({ isVisible: false });
  },
  dismiss: () => set({ isVisible: false }),
}));
