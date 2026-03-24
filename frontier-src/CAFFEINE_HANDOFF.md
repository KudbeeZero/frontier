# Caffeine Handoff: Frontier Orbital Combat

## Project State

This document tracks the handoff state between Caffeine AI sessions and local Claude Code development.

## Current Status

- **Phase:** 1 — Survival (in progress)
- **Build:** Functional — Three.js scene renders, basic HUD active
- **Backend:** ICP canister placeholder (Phase 6 implementation)

## What's Working

- [x] Earth globe renders with rotation
- [x] Star field background
- [x] Orbital camera controller (mouse drag)
- [x] Basic HUD overlay (Status, Radar, Weapon Console)
- [x] Zustand stores for ship, game, inventory, story state
- [x] Story event system with A.E.G.I.S. narrator
- [x] Mobile controls support
- [x] Start screen and pause menu

## What's Next

- [ ] Enemy spawn system (Phase 1 scouts)
- [ ] Weapon firing mechanics (Pulse cannon)
- [ ] Collision detection (projectile vs enemy)
- [ ] Resource pickup system
- [ ] Wave progression logic

## Key Files

| File | Purpose |
|------|---------|
| `src/frontend/src/App.tsx` | Root component, game lifecycle |
| `src/frontend/src/components/Game/GameCanvas.tsx` | Three.js Canvas wrapper |
| `src/frontend/src/components/game/EarthGlobe.tsx` | Earth 3D model |
| `src/frontend/src/stores/shipStore.ts` | Player ship state |
| `src/frontend/src/stores/gameStore.ts` | Game phase/score state |
| `src/frontend/src/systems/orbital.ts` | Orbital math utilities |
| `src/frontend/src/config/enemies.ts` | Enemy definitions |
| `src/frontend/src/config/weapons.ts` | Weapon definitions |

## Environment Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build
pnpm build
```

## Known Issues

- Texture loading: Earth globe currently uses placeholder color; texture loading to be added when assets are available
- Mobile touch controls need calibration testing

## Architecture Decisions

- **Orbital coordinates**: Player position stored as (theta, phi) angles, not Cartesian, to simplify orbital movement calculations
- **Zustand over Context**: Chosen for performance — game loop updates happen in `useFrame` at 60fps, Context would cause full re-renders
- **Component separation**: 3D components in `components/game/`, 2D HUD in `components/ui/` — keeps Three.js deps isolated
