# Frontier: Orbital Combat — Story Mode System

## Current State
- `storyStore.ts` exists with basic event structure (3 existing events: p1_systems_damaged, p1_scan_results, p1_repair_start), `triggerEvent`, `selectChoice`, `dismiss` actions. No completed events tracking, no stage system, no story mode flag.
- `StoryPanel.tsx` exists with full UI (choices, effects labels, cyan styling), but no slide animation and not wired to a STORY MODE entry.
- `StoryEventPanel.tsx` exists as alternate panel variant with slide-up animation.
- `voiceNarration.ts` exists with browser `speechSynthesis` fallback.
- No SpaceDepot 3D object.
- No ElevenLabs service.
- No STORY MODE entry point in the UI.
- `GameCanvas.tsx` has no story mode spawning logic.

## Requested Changes (Diff)

### Add
- `src/frontend/src/services/elevenLabsService.ts` — ElevenLabs TTS service with placeholder voice IDs (`narrator_placeholder`, `aegis_placeholder`). Falls back to browser `speechSynthesis` if no API key. Exported `playVoiceLine(text, voiceId)` function.
- `src/frontend/src/components/Story/VoicePlayer.tsx` — React component that wraps voice playback; auto-plays A.E.G.I.S. dialogue when story event becomes visible.
- `src/frontend/src/objects/SpaceDepot.tsx` — 3D space station model using cylinders/cubes at world position (500, 0, 500). Includes proximity detection: tracks distance to camera/player; when within 50 units, surfaces `isNearDepot=true` to a store or callback. Emits a "DOCK" button via a portal/HUD hook when near.
- 3 new story events in `storyStore.ts`: "depot_arrival" (docking trigger), "systems_critical" (auto-trigger at 30s), "strange_signal" (unlocks after events 1 & 2 completed).
- `completedEvents: string[]`, `currentStage: number`, `isStoryMode: boolean`, `storyStartTime: number | null`, `nearDepot: boolean`, `setNearDepot`, `enterStoryMode`, `markEventComplete` actions added to storyStore.
- STORY MODE button in the HUD nav bar (next to mode toggles), visible when not in story mode.
- Story mode spawn logic: sets camera/player position 100 units from depot, shows notification "Fly to the depot and dock to begin".
- DOCK button overlay (rendered in HUD) when `nearDepot === true` in story mode.
- Auto-trigger logic for "systems_critical" event (30s after story mode starts) in a useEffect in App or GameCanvas.
- Strange Signal unlock check after completing events 1 & 2.

### Modify
- `storyStore.ts` — add new fields/actions listed above; add 3 new events; keep existing events intact.
- `StoryPanel.tsx` — ensure slide-up animation (translateY 100% → 0, 0.3s ease-out), covers bottom 50% of screen, dark bg with 60% black overlay on game, cyan top border, mobile-friendly 60px min button height.
- `GameCanvas.tsx` — add `<SpaceDepot />` to the 3D scene.
- `App.tsx` — mount `<StoryPanel />` and `<VoicePlayer />` conditionally; add story mode 30s auto-trigger effect.

### Remove
- Nothing removed; existing story events and panels preserved.

## Implementation Plan
1. Create `elevenLabsService.ts` with `playVoiceLine(text, voiceId)` using ElevenLabs REST API if `VITE_ELEVENLABS_API_KEY` env var exists, otherwise falls back to `speechSynthesis`.
2. Update `storyStore.ts`: add `completedEvents`, `currentStage`, `isStoryMode`, `storyStartTime`, `nearDepot`, and new actions; add 3 new story events with correct choices and resource effects.
3. Create `SpaceDepot.tsx` 3D object (cylinders + boxes geometry) positioned at [500,0,500]; use `useFrame` to measure distance from camera; call `useStoryStore.getState().setNearDepot(bool)` when within 50 units.
4. Update `StoryPanel.tsx` with slide-up CSS animation, 50% bottom coverage, 60% overlay, cyan border, 60px min button height.
5. Create `VoicePlayer.tsx` that watches `currentEvent`+`isVisible` and calls `playVoiceLine`.
6. Update `GameCanvas.tsx` to include `<SpaceDepot />`.
7. Update `App.tsx`: mount `<StoryPanel />`, `<VoicePlayer />`; add 30s timer effect for systems_critical; add DOCK button when `nearDepot && isStoryMode`.
8. Add STORY MODE button to the HUD navigation bar with `enterStoryMode` action that repositions player near depot and shows notification.
