// ─── Orbital Constants ────────────────────────────────────────────────────────

/** Radius of Earth sphere in scene units */
export const EARTH_RADIUS = 1.5;

/** Player camera orbit radius */
export const SHIP_ORBIT_RADIUS = 3;

/** Atmosphere shell radius */
export const ATMOSPHERE_RADIUS = 1.56;

/** Enemy spawn radius (further out than player) */
export const ENEMY_SPAWN_RADIUS = 5;

// ─── Physics Constants ────────────────────────────────────────────────────────

/** Angular drag applied to ship velocity each frame */
export const ANGULAR_DRAG = 0.92;

/** Max angular velocity (radians/s) */
export const MAX_ANGULAR_VEL = 2.0;

// ─── Game Constants ───────────────────────────────────────────────────────────

/** Local storage key for save data */
export const SAVE_KEY = "frontier_save";

/** How often to auto-save (ms) */
export const AUTO_SAVE_INTERVAL = 30_000;

/** Base number of enemies in wave 1 */
export const BASE_WAVE_SIZE = 3;

/** Additional enemies added per wave */
export const WAVE_SCALE_FACTOR = 2;

/** Distance (in radians) at which enemies deal contact damage */
export const ENEMY_CONTACT_RADIUS = 0.15;

// ─── HUD Constants ────────────────────────────────────────────────────────────

/** How long story event messages display (ms) */
export const STORY_EVENT_DURATION = 6000;

/** Radar display radius in scene units */
export const RADAR_RANGE = 8;
