# Frontier: Orbital Combat

## Current State
- Earth globe with day/night textures, atmospheric glow, slow rotation
- Orbital camera (WASD + mobile joystick) with physics drag
- Targeting reticle on Earth click, 1.5s lock-on with progress arc
- 4 weapons (Pulse, Rail, Missile, EMP) with cooldown/ammo/reload UI
- FIRE button + spacebar trigger; missile requires lock
- HUD: StatusPanel (top-left), RadarPanel (top-right), WeaponConsole (bottom-center), MobileJoystick
- No projectiles, no enemies, no landscape lock, dim Earth lighting

## Requested Changes (Diff)

### Add
- `config/enemies.ts` — 3 enemy types (satellite_light, satellite_weapons, asteroid) with health/size/color/points
- `stores/useProjectilesStore.ts` — projectile spawn, per-frame movement, collision vs enemies, impact tracking
- `stores/useEnemyStore.ts` — enemy spawn (3 on load, then every 12s, max 8), damage, score, impacts list
- `components/game/ProjectileSystem.tsx` — per-weapon 3D mesh (sphere/cylinder) with emissive + point light
- `components/game/EnemyLayer.tsx` — box meshes above Earth surface, health bar, fade on destroy, spawn on mount
- `components/game/ImpactEffect.tsx` — flash sphere that expands + fades on hit, driven by impacts list in enemy store
- `components/ui/ScorePanel.tsx` — score + kills counter
- `components/ui/FPSCounter.tsx` — bottom-right FPS monitor
- Landscape lock — CSS orient portrait→rotate 90deg so game always runs landscape on mobile

### Modify
- `App.tsx` — raise ambient (0.08→0.4) and directional (1.2→2.5) light; add EnemyLayer, ProjectileSystem, FPSCounter
- `EarthGlobe.tsx` — raise emissiveIntensity (0.22→0.35) for brighter city lights
- `stores/useWeaponsStore.ts` — in fire(), calculate real camera position from useShipStore theta/phi, spawn projectile toward target or Earth center
- `components/game/CameraController.tsx` — also tick useProjectilesStore and useEnemyStore each frame
- `components/hud/StatusPanel.tsx` — add color-coded progress bars (Hull/Power/O₂)
- `components/hud/RadarPanel.tsx` — show enemy dots relative to player position, animated sweep line
- `components/game/HUD.tsx` — add ScorePanel and FPSCounter
- `index.css` — portrait→landscape CSS rotation for landscape lock

### Remove
- Nothing removed

## Implementation Plan
1. Add enemies config
2. Add projectiles store (spawn, tick with collision, impacts)
3. Add enemy store (spawn, damage, score, impacts)
4. Wire useWeaponsStore.fire() to spawn projectile from real camera pos
5. Add CameraController ticks for projectile and enemy stores
6. Build ProjectileSystem renderer (per-weapon geometry, emissive, point light)
7. Build EnemyLayer renderer (box mesh, health bar, impact effects)
8. Build ImpactEffect (expanding flash sphere)
9. Build ScorePanel and FPSCounter
10. Update StatusPanel and RadarPanel with live data
11. Update HUD to include new panels
12. Raise lighting in App.tsx and EarthGlobe.tsx
13. Add landscape CSS lock
