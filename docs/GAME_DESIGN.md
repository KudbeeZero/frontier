# Game Design Document: Frontier Orbital Combat

## Concept

Frontier: Orbital Combat is a third-person 3D space combat game. The player pilots a ship in low Earth orbit, defending the planet against waves of hostile forces while managing resources and upgrading systems.

## Core Loop

1. **Survive** — Destroy enemy waves before they reach Earth
2. **Collect** — Gather resources from destroyed enemies
3. **Upgrade** — Improve weapons, hull, and propulsion
4. **Advance** — Progress through the story phases

## Player Ship

The player orbits Earth at a fixed radius. Controls:
- **Mouse/Touch drag** — Rotate orbital position (theta/phi)
- **Scroll wheel** — Adjust orbital altitude (future phase)
- **Click/Tap** — Fire active weapon at cursor position
- **1/2/3 keys** — Switch weapons

## Weapons

| Weapon   | Damage | Fire Rate | Energy Cost | Description              |
|----------|--------|-----------|-------------|--------------------------|
| Pulse    | 15     | Fast      | 5           | Rapid-fire energy rounds |
| Rail     | 80     | Slow      | 20          | High-velocity slug       |
| Missile  | 120    | Medium    | 35          | Homing warhead           |

## Enemy Types

| Type       | HP  | Speed | Threat | Behavior              |
|------------|-----|-------|--------|-----------------------|
| Scout      | 30  | Fast  | Low    | Flanking approach     |
| Cruiser    | 150 | Med   | Med    | Direct assault        |
| Dreadnought| 500 | Slow  | High   | Heavy bombardment     |
| Drone Swarm| 10  | Fast  | Med    | Group coordination    |

## Game Phases

See `DEVELOPMENT_PHASES.md` for the six-phase progression system.

## HUD Elements

- **Status Panel** (top-left) — Hull integrity, power level, oxygen
- **Radar** (top-right) — Enemy positions relative to player
- **Weapon Console** (bottom-center) — Active weapon, ammo, cooldown
- **Targeting Reticle** (center) — Aim indicator

## Progression

Resources collected fund upgrades at the between-wave shop. The story advances automatically through phases as milestones are reached.
