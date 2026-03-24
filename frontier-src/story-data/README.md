# Story Data System

This directory contains the narrative content for Frontier: Orbital Combat.

## Structure

```
story-data/
├── templates/          # Reusable event templates
└── chapters/
    ├── phase1_survival/
    ├── phase2_stabilization/
    ├── phase3_discovery/
    ├── phase4_escalation/
    ├── phase5_breakthrough/
    └── phase6_resolution/
```

## Event Format

Each story event is a JSON file:

```json
{
  "id": "p1_systems_damaged",
  "phase": 1,
  "title": "Systems Critical",
  "message": "Hull breach detected in sector 4. Weapons offline.",
  "speaker": "A.E.G.I.S.",
  "trigger": "game_start",
  "choices": [],
  "effects": {
    "hull": -20,
    "weaponsOnline": false
  }
}
```

## Triggers

Events are fired by the `useStoryStore` when conditions are met:
- `game_start` — Fires when the game begins
- `wave_complete` — Fires after each enemy wave
- `boss_defeated` — Fires when a boss enemy is destroyed
- `resource_threshold` — Fires when resources reach a value
- `manual` — Fired programmatically

## Adding New Events

1. Create a JSON file in the appropriate `chapters/phase*/` directory
2. Import it in the story store's event registry
3. Wire up the trigger condition

## Voice Narration

Events with a `speaker` field can use the `speakText()` utility for browser TTS narration.
