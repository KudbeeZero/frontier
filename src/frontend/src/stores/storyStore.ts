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
