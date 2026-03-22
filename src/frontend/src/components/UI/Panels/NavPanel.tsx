import React from "react";

const waypoints = [
  {
    id: "WP-1",
    name: "Mining Zone Alpha",
    distance: 15.2,
    coords: "045-12-08",
  },
  { id: "WP-2", name: "Station Relay", distance: 42.7, coords: "310-05-22" },
  { id: "WP-3", name: "Safe Harbor", distance: 89.3, coords: "180-00-15" },
];

const currentPosition = { sector: 7, coords: "000-00-00" };
const currentVelocity = 0;

export function NavPanel() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-cyan-500 font-bold uppercase text-sm border-b border-cyan-500/30 pb-2 mb-3 tracking-widest">
          Current Position
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between p-2.5 bg-cyan-500/10 border border-cyan-500 rounded">
            <span className="text-gray-400 text-xs uppercase tracking-widest">
              Sector
            </span>
            <span className="text-cyan-400 font-mono font-bold text-xs">
              {currentPosition.sector}
            </span>
          </div>
          <div className="flex justify-between p-2.5 bg-gray-900/50 border border-cyan-500/30 rounded">
            <span className="text-gray-400 text-xs uppercase tracking-widest">
              Coordinates
            </span>
            <span className="text-white font-mono text-xs">
              {currentPosition.coords}
            </span>
          </div>
          <div className="flex justify-between p-2.5 bg-gray-900/50 border border-cyan-500/30 rounded">
            <span className="text-gray-400 text-xs uppercase tracking-widest">
              Velocity
            </span>
            <span className="text-white font-mono text-xs">
              {currentVelocity} km/s
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-cyan-500 font-bold uppercase text-sm border-b border-cyan-500/30 pb-2 tracking-widest">
          Waypoints
        </h3>

        {waypoints.map((wp) => (
          <div
            key={wp.id}
            className="p-3 bg-gray-900/50 border border-cyan-500/30 rounded hover:border-cyan-500 cursor-pointer transition-all"
          >
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="text-cyan-400 font-bold text-xs">{wp.name}</div>
                <div className="text-gray-500 text-[10px] font-mono mt-0.5">
                  {wp.coords}
                </div>
              </div>
              <div className="text-white font-mono text-xs">
                {wp.distance} km
              </div>
            </div>
            <button
              type="button"
              className="w-full mt-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-cyan-400 text-[10px] font-semibold uppercase tracking-widest rounded hover:bg-cyan-500/30 transition-all"
            >
              Set Course
            </button>
          </div>
        ))}
      </section>

      <button
        type="button"
        className="w-full px-4 py-2.5 bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30 font-semibold uppercase text-xs tracking-widest rounded transition-all"
      >
        Add Waypoint
      </button>
    </div>
  );
}
