# Frontier: Lost in Space

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full 3D browser-based space exploration and crafting game
- React Three Fiber 3D scene with physics-based ship navigation
- Procedural asteroid field generation with instanced meshes
- Procedural star field background (parallax layers)
- Points of interest: derelict ships, space stations, anomalies
- Ship controller: WASD movement, mouse look, pointer lock, boost/brake
- Physics system: momentum, inertia, velocity-based movement
- Mining system: raycast targeting, laser beam, progress extraction, resource gathering
- 9 resource types: Iron, Silicon, Carbon, Titanium, Platinum, Rare Earth Elements, Exotic Matter, Dark Matter, Quantum Crystals
- Inventory management: weight/volume-based system
- Crafting system: recipe database, crafting UI, component installation
- Ship components: hull upgrades, engine upgrades, mining lasers, shields, scanners, refineries
- Survival systems: fuel, hull integrity, oxygen, power management
- HUD: velocity indicator, fuel gauge, hull integrity, cargo capacity, crosshair, mini-map/radar
- TAB key toggles HUD visibility for immersive mode
- Auto-save/load system using localStorage
- Quick restart option
- Tutorial/onboarding flow
- Particle effects: engine thrust, mining laser
- Zustand stores: gameStore, shipStore, inventoryStore, craftingStore
- TypeScript interfaces for all game types

### Modify
- App.tsx: render the full game canvas

### Remove
- Nothing (new project)

## Implementation Plan
1. Define all TypeScript types/interfaces in `src/types/game.ts`
2. Create Zustand stores: gameStore, shipStore, inventoryStore, craftingStore
3. Implement utility modules: physics.ts, generation.ts, constants.ts
4. Build Environment components: StarField, AsteroidField (instanced), SpaceStation, DerelictShip, Anomaly
5. Build Ship component with ShipController (pointer lock, WASD, mouse look, physics)
6. Build HUD system: velocity, fuel, hull, cargo, crosshair, radar, scanner
7. Build Mining system: targeting reticle, laser beam, progress bar, extraction logic
8. Build Inventory UI: resource grid, weight display, component list
9. Build Crafting UI: recipe browser, category filters, resource requirements, craft queue
10. Build Game container: Canvas setup, lighting, fog, scene composition
11. Wire auto-save (localStorage) and restart logic
12. Add particle effects for engine thrust and mining laser
13. Implement collision detection for hull damage
14. Performance: LOD, frustum culling, object pooling
