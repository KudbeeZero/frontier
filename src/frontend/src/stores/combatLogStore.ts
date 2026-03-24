import { create } from "zustand";

export interface CombatLogEntry {
  id: number;
  time: string;
  msg: string;
  level: "info" | "warn" | "alert";
}

let _entryId = 0;

function timestamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

interface CombatLogState {
  entries: CombatLogEntry[];
  addEntry: (msg: string, level?: CombatLogEntry["level"]) => void;
}

export const useCombatLogStore = create<CombatLogState>((set) => ({
  entries: [
    {
      id: _entryId++,
      time: timestamp(),
      msg: "Systems nominal",
      level: "info",
    },
    {
      id: _entryId++,
      time: timestamp(),
      msg: "Entering combat zone",
      level: "info",
    },
  ],
  addEntry: (msg, level = "info") =>
    set((state) => ({
      entries: [
        ...state.entries.slice(-19),
        { id: _entryId++, time: timestamp(), msg, level },
      ],
    })),
}));
