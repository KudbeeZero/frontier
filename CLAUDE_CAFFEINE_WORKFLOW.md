# Claude + Caffeine Collaboration Workflow

## Overview

This project uses a hybrid workflow: **Caffeine AI** for rapid feature scaffolding and **Claude Code** (local CLI) for deep implementation, refactoring, and debugging.

## Workflow

### 1. Caffeine Session (Feature Design)

Use Caffeine when you need to:
- Scaffold new components from natural language prompts
- Generate boilerplate for new systems
- Rapidly prototype UI layouts

After a Caffeine session:
1. Export/sync the code to this repository
2. Update `CAFFEINE_HANDOFF.md` with new status
3. Run `pnpm typecheck` to catch any type issues
4. Commit with message: `feat: [description] (caffeine scaffold)`

### 2. Claude Code Session (Implementation)

Use Claude Code when you need to:
- Implement complex game logic (physics, AI, combat systems)
- Debug hard-to-reproduce issues
- Refactor for performance
- Integrate systems together

Start a Claude Code session by:
1. Reading `CAFFEINE_HANDOFF.md` for current state
2. Reading `docs/DEVELOPMENT_PHASES.md` for next milestones
3. Working on the current phase's pending tasks

After a Claude Code session:
1. Update `CAFFEINE_HANDOFF.md` with new status
2. Commit with descriptive message
3. Push to the active feature branch

### 3. Sync Points

At the end of each work session (either tool):
- [ ] All TypeScript errors resolved (`pnpm typecheck`)
- [ ] Game runs in dev mode (`pnpm dev`)
- [ ] `CAFFEINE_HANDOFF.md` updated
- [ ] Changes committed and pushed

## Branch Strategy

```
main          ← stable releases
claude/*      ← Claude Code feature branches
caffeine/*    ← Caffeine scaffold branches
```

Feature branches merge to `main` via PR after review.

## File Ownership

| Files | Primary Tool |
|-------|-------------|
| `src/frontend/src/systems/*.ts` | Claude Code |
| `src/frontend/src/config/*.ts` | Claude Code |
| `src/frontend/src/components/game/*.tsx` | Claude Code |
| `src/frontend/src/components/ui/*.tsx` | Caffeine |
| `src/frontend/src/stores/*.ts` | Either |
| `story-data/chapters/**/*.json` | Caffeine |
| `docs/*.md` | Claude Code |

## Communication Pattern

When handing off from Claude Code → Caffeine:
- Leave `// TODO(caffeine): [description]` comments
- Update the checklist in `CAFFEINE_HANDOFF.md`

When handing off from Caffeine → Claude Code:
- Export code cleanly
- Note any `// TODO(claude): [description]` comments
- Update `CAFFEINE_HANDOFF.md`
