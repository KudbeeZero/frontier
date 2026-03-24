# Frontier: Orbital Combat

## Current State
- Ground target destruction system is live: 8 hardcoded targets on Earth surface, 100 HP each, 50 credits, all static.
- Five orbital hex-grid rings exist on the Earth globe as decorative visual elements with no gameplay purpose.
- `laneStore` controls camera orbital radius (radii [1.6, 1.9, 2.2, 2.5, 2.8]) and lane switching (Q/E or swipe).
- Combat mode: player orbits Earth, locks onto ground targets (0.5s dwell), fires projectiles, targets take damage and are destroyed.
- No level progression system exists. Once all 8 targets are destroyed, nothing happens.

## Requested Changes (Diff)

### Add
- `orbitalLevelStore.ts`: 5-level config system with level names, altitudes, target counts, HP, credit rewards, enemy types, return fire flags, shield regen flags.
- `OrbitalLevelHUD.tsx`: Left-side panel showing all 5 levels with lock/active/complete status, current target counter, and level name.
- `EnemyReturnFire.tsx`: Component active in combat mode for levels 4+; fires periodic hull damage at the player ship.
- Level-complete animation/notification: "LEVEL COMPLETE - ADVANCING" notification + auto-advance after 2s.
- Even target distribution per level using golden-angle sphere placement.
- Shield HP on level 3 targets (4 of 16 have shields, 2x effective HP).
- Shield regen system for level 5 targets.

### Modify
- `groundTargetStore.ts`: Add `resetForLevel(level)` that generates level-appropriate targets. Add `shieldHp`/`shieldMaxHp`/`shieldRegenRate` fields.
- `EarthGlobe.tsx`: Orbital rings now reflect level status — active (bright cyan), completed (dim green), locked (very dim gray). Show level number labels next to rings.
- `HUD.tsx`: Show `OrbitalLevelHUD` in combat mode. Update target counter to show level context ("LVL 3 - 14/16").
- `GameCanvas.tsx`: Add `EnemyReturnFire` component.

### Remove
- Hardcoded 8-target initial state in `groundTargetStore`; replaced by level-driven generation starting from level 1.

## Implementation Plan
1. Create `orbitalLevelStore.ts` with 5 level configs and progression logic.
2. Update `groundTargetStore.ts` to support level-driven target generation with golden-angle distribution, optional shields, and shield regen.
3. Create `OrbitalLevelHUD.tsx` showing 5-level ladder with status indicators.
4. Create `EnemyReturnFire.tsx` for levels 4-5 damage logic.
5. Update `EarthGlobe.tsx` rings to reflect level status colors.
6. Update `HUD.tsx` to wire in the level HUD.
7. Update `GameCanvas.tsx` to include EnemyReturnFire.
