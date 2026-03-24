# Architecture: Frontier Orbital Combat

## Overview

Frontier: Orbital Combat is a 3D space combat game built on a React/TypeScript frontend with an ICP (Internet Computer Protocol) backend for on-chain game state.

## Technology Stack

### Frontend
- **React 19** — UI component framework
- **Three.js + React Three Fiber** — 3D rendering and scene management
- **@react-three/drei** — Helper components and abstractions
- **Zustand** — Global state management
- **TailwindCSS** — Utility-first styling
- **Vite** — Build tooling and dev server

### Backend
- **Motoko** — Smart contract language for ICP
- **DFINITY SDK** — ICP canister deployment

## Directory Structure

```
src/
├── frontend/           # Vite + React app
│   └── src/
│       ├── components/
│       │   ├── game/   # Three.js / R3F scene components
│       │   └── ui/     # HUD and 2D overlay components
│       ├── stores/     # Zustand state stores
│       ├── systems/    # Pure game logic (no React deps)
│       ├── config/     # Static game data
│       └── types/      # Shared TypeScript interfaces
└── backend/            # ICP Motoko canister
```

## Data Flow

```
User Input → Ship Store → Camera Controller → Three.js Scene
                       ↓
              Weapon Store → Combat System → Enemy Store
                       ↓
              Game Store (score, phase, win/lose)
```

## State Architecture

Each Zustand store owns a specific domain:
- `useShipStore` — Player position (theta/phi orbital), velocity, hull/fuel
- `useWeaponsStore` — Active weapon, cooldowns, ammo counts
- `useEnemyStore` — Enemy list, targeting, AI state
- `useGameStore` — Game phase, score, credits, pause state

## Rendering Architecture

The Three.js scene lives inside a React Three Fiber `<Canvas>`. All 3D objects are R3F components. The HUD is a standard React overlay (`position: absolute`) on top of the Canvas.

## Orbital Mechanics

The player ship orbits Earth on a sphere of fixed radius. Position is encoded as `(theta, phi)` — longitude and latitude angles. The `orbital.ts` system converts these to Cartesian coordinates for camera placement and collision detection.
