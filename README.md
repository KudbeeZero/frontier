# Frontier: Orbital Combat

<p align="center">
  <img src="frontend/public/assets/uploads/design-preview.png" alt="Frontier Orbital Combat" width="400"/>
</p>

A 3D browser-based space combat game. Defend Earth from waves of hostile forces while orbiting the planet, collecting resources, and upgrading your ship — built on React Three Fiber and deployed on the Internet Computer.

---

## Gameplay

1. **Survive** — Destroy enemy waves before they reach Earth
2. **Collect** — Gather resources from defeated enemies
3. **Upgrade** — Improve weapons, hull, and propulsion
4. **Advance** — Progress through the story phases narrated by A.E.G.I.S.

### Controls

| Input | Action |
|-------|--------|
| Mouse/Touch drag | Rotate orbital position |
| Click/Tap | Fire active weapon |
| `1` / `2` / `3` | Switch weapons |

### Weapons

| Weapon | Damage | Fire Rate | Description |
|--------|--------|-----------|-------------|
| Pulse | 15 | Fast | Rapid-fire energy rounds |
| Rail | 80 | Slow | High-velocity slug |
| Missile | 120 | Medium | Homing warhead |

---

## Tech Stack

- **React 19** + **TypeScript**
- **Three.js** + **React Three Fiber** + **@react-three/drei**
- **Zustand** — game state management
- **TailwindCSS** — HUD styling
- **Vite** — build tooling
- **Motoko / ICP** — on-chain backend (Phase 6)

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

---

## Project Structure

```
src/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── game/   # Three.js / R3F scene components
│       │   └── ui/     # HUD and 2D overlay components
│       ├── stores/     # Zustand state (ship, game, weapons, enemy)
│       ├── systems/    # Pure game logic
│       ├── config/     # Static game data (enemies, weapons)
│       └── types/      # Shared TypeScript interfaces
└── backend/            # ICP Motoko canister (Phase 6)
```

---

## Current Status (Phase 1 — Survival)

- [x] Earth globe with orbital camera
- [x] Star field background
- [x] HUD overlay (Status, Radar, Weapon Console)
- [x] Zustand stores wired up
- [x] Story event system with A.E.G.I.S. narrator
- [x] Mobile touch controls
- [ ] Enemy spawn system
- [ ] Weapon firing mechanics
- [ ] Collision detection
- [ ] Resource pickup + wave progression

See [`docs/DEVELOPMENT_PHASES.md`](docs/DEVELOPMENT_PHASES.md) for the full roadmap.

---

## License

[MIT](LICENSE)
