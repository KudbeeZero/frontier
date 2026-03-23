# Frontier: Orbital Combat

## Current State
Full-stack space combat game with Three.js. Has orbital lanes system (5 lanes at radii 1.6–2.8), combat targeting (enemy ships in space), projectile/explosion systems, enemy store, weapons store. Earth globe radius = 1.4 units. Camera orbits at lane + 0.5 offset. UI: top nav bar, HUD panels, weapon bar, notification system, gameStore with credits.

## Requested Changes (Diff)

### Add
- `groundTargetStore.ts` — Zustand store: 8 targets with lat/lon positions on Earth surface (radius 1.4), hp=100, status (intact/damaged/destroyed), scorchMarks array, credits reward=50 per kill, destroyedCount
- `GroundTargets.tsx` — 3D scene component: renders each target as a small cone/cylinder on Earth surface + point light glow. Color: green (intact), orange (damaged <50hp), red (critical <25hp). Destroyed targets leave scorch mark mesh. Targets rotate with Earth globe. Smoke particle-like flicker on damaged targets.
- `GroundTargetReticle.tsx` — lock-on system: raycasts toward Earth center; detects which ground target is near crosshair in combat mode; requires 0.5s dwell time before locking; shows targeting box UI overlay with name, distance, health%.
- `GroundTargetRadar.tsx` — compact radar overlay showing target positions relative to current orbital angle; placed top-right under combat log.
- Update `CombatTargetingSystem.tsx` — integrate ground target detection alongside enemy detection.
- Update `combat.ts` — when locked target is a ground target, fire projectile toward Earth surface point; calculate travel time from distance.
- Update `Projectile.tsx` — check collision with ground targets; apply damage; trigger explosion at surface point; award credits + notification on kill.
- Update `HUD.tsx` — add TargetCounter widget to TopStatusBar ("Targets: 5/8"); add ground target locked indicator; render GroundTargetRadar in combat mode.
- Update `GameCanvas.tsx` — include GroundTargets and GroundTargetReticle in scene.
- Update `EarthGlobe.tsx` — export EARTH_RADIUS constant (1.4).

### Modify
- `gameStore.ts` — already has `addCredits`; no changes needed
- `types/game.ts` — add GroundTarget interface
- `NotificationSystem.tsx` — already handles success notifications

### Remove
- Nothing removed

## Implementation Plan
1. Add `GroundTarget` type to `types/game.ts`
2. Create `groundTargetStore.ts` with 8 hardcoded targets at real-world continent coordinates converted to sphere lat/lon
3. Create `GroundTargets.tsx` — 3D mesh group attached to Earth rotation, damage visual states, scorch marks
4. Create ground target lock-on logic inside `CombatTargetingSystem.tsx` with 0.5s dwell timer
5. Create `GroundTargetLockHUD.tsx` — targeting box overlay for locked ground target
6. Update `combat.ts` `handleFireButton` to fire at locked ground targets
7. Update `Projectile.tsx` to handle `groundTargetId` — arc projectile to surface, apply damage on arrival, trigger explosion, award credits
8. Create `GroundTargetRadar.tsx` — polar minimap showing 8 target positions
9. Update `HUD.tsx` — add target counter to status bar, ground target HUD, radar in combat
10. Update `GameCanvas.tsx` — mount GroundTargets in scene
