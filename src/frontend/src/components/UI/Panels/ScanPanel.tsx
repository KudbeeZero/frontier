import React from "react";

const targets = [
  {
    id: "AST-001",
    type: "Asteroid",
    distance: 2.4,
    bearing: 45,
    minerals: "Iron, Silicon",
    threat: null as string | null,
  },
  {
    id: "AST-002",
    type: "Asteroid",
    distance: 5.1,
    bearing: 120,
    minerals: "Rare Earth",
    threat: null as string | null,
  },
  {
    id: "HOST-1",
    type: "Hostile",
    distance: 8.2,
    bearing: 310,
    minerals: null as string | null,
    threat: "HIGH",
  },
  {
    id: "HOST-2",
    type: "Hostile",
    distance: 12.5,
    bearing: 280,
    minerals: null as string | null,
    threat: "MED",
  },
  {
    id: "DEB-45",
    type: "Debris",
    distance: 1.8,
    bearing: 90,
    minerals: "None",
    threat: null as string | null,
  },
];

export function ScanPanel() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-cyan-500 font-bold uppercase text-sm border-b border-cyan-500/30 pb-2 mb-3 tracking-widest">
          Sector Scan
        </h3>
        <div className="bg-cyan-500/10 border border-cyan-500 rounded p-3 mb-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 uppercase tracking-widest">
              Range
            </span>
            <span className="text-cyan-400 font-mono">15.0 km</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 uppercase tracking-widest">
              Contacts
            </span>
            <span className="text-cyan-400 font-mono">
              {targets.length} detected
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-cyan-500 font-bold uppercase text-sm border-b border-cyan-500/30 pb-2 tracking-widest">
          Targets
        </h3>

        {targets.map((target) => (
          <div
            key={target.id}
            className="p-3 bg-gray-900/50 border border-cyan-500/30 rounded hover:border-cyan-500 cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-cyan-400 font-mono font-bold text-xs">
                  {target.id}
                </div>
                <div className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">
                  {target.type}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono text-xs">
                  {target.distance} km
                </div>
                <div className="text-gray-500 text-xs">{target.bearing}°</div>
              </div>
            </div>
            {target.minerals && (
              <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                Minerals:{" "}
                <span className="text-cyan-600">{target.minerals}</span>
              </div>
            )}
            {target.threat && (
              <div
                className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                  target.threat === "HIGH" ? "text-red-500" : "text-orange-400"
                }`}
              >
                ⚠ Threat: {target.threat}
              </div>
            )}
          </div>
        ))}
      </section>

      <button
        type="button"
        className="w-full px-4 py-2.5 bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30 font-semibold uppercase text-xs tracking-widest rounded transition-all"
      >
        Initiate Deep Scan
      </button>
    </div>
  );
}
