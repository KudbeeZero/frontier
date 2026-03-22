# 🚀 CAFFEINE AI - COMPLETE HANDOFF PROMPT (CORRECTED)

## ⚠️ CRITICAL: CORRECT REPOSITORY

**Repository URL**: `https://github.com/KudbeeZero/frontier.git`

**IMPORTANT**: Changes have been made to the repository since your last session. You MUST re-download to see the latest updates.

---

## 📥 STEP 1: DOWNLOAD LATEST REPOSITORY

### Commands to Run (Copy/Paste):

```bash
# Navigate to your workspace
cd ~

# Remove old project directory (if it exists)
rm -rf frontier

# Clone fresh repository with ALL latest changes
git clone https://github.com/KudbeeZero/frontier.git

# Enter project directory
cd frontier

# Verify you have the latest commit
git log -1 --oneline

# Install/update dependencies
npm install

# Verify project structure
ls -la
```

### ✅ Verify Repository Cloned Correctly:

After cloning, check:

```bash
# Check frontend structure
ls -la src/frontend/src/

# Should see:
# - components/
# - stores/
# - types/
# - utils/
# - App.tsx
# - main.tsx

# Check stores
ls -la src/frontend/src/stores/

# Should see:
# - gameStore.ts
# - shipStore.ts
# - inventoryStore.ts
# - craftingStore.ts
```

---

## 📋 STEP 2: UNDERSTAND WHAT TO BUILD

### Current Project Status

This is **Frontier: Lost in Space** - a 3D space survival game.

**Tech Stack**:
- React 18 + TypeScript
- Three.js + React Three Fiber
- Zustand for state management
- Tailwind CSS
- Vite

**Current Features** (Already Implemented):
- ✅ 3D ship controls and navigation
- ✅ Basic game mechanics (ship, inventory, crafting)
- ✅ Zustand stores for state management
- ✅ Core gameplay loop

**What's Missing** (Your Tasks):
- Story system and narrative engine
- A.E.G.I.S. AI companion character
- Story events and dialogue
- Player choices with consequences
- Resource management for survival

---

## 🎯 YOUR IMPLEMENTATION TASKS

### Task 1: Create Story System Foundation

**Create New Store**: `/src/frontend/src/stores/storyStore.ts`

This will be the Zustand store for managing story state.

**What to Include**:
```typescript
/**
 * Story Store - Manages narrative state and events
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StoryPhase = 1 | 2 | 3 | 4 | 5 | 6;

export type Phase1EventId =
  | 'p1_systems_damaged'
  | 'p1_oxygen_warning'
  | 'p1_aegis_first_contact'
  | 'p1_hull_breach'
  | 'p1_first_threat'
  | 'p1_survival_choice'
  | 'p1_stabilized';

export interface EventChoice {
  text: string;
  consequence: string;
  effects?: {
    oxygen?: number;
    hull?: number;
    power?: number;
    credits?: number;
  };
}

export interface StoryEvent {
  id: Phase1EventId;
  triggerCondition: string;
  aegisDialogue: string;
  narrative: string;
  choices: EventChoice[];
}

export interface StoryChoice {
  id: string;
  eventId: Phase1EventId;
  choiceText: string;
  chosenAt: number;
  consequence: string;
}

interface StoryState {
  // Current state
  currentPhase: StoryPhase;
  phase1Complete: boolean;
  triggeredEvents: Phase1EventId[];
  pendingEvent: StoryEvent | null;
  choices: StoryChoice[];
  
  // Resources (survival mechanics)
  oxygenLevel: number;
  hullIntegrity: number;
  powerLevel: number;
  creditsAvailable: number;
  
  // A.E.G.I.S. relationship
  aegisTrust: number; // -100 to +100
  
  // Actions
  triggerEvent: (eventId: Phase1EventId) => void;
  makeChoice: (eventId: Phase1EventId, choiceIndex: number) => void;
  dismissEvent: () => void;
  tickResources: () => void;
  modifyAegisTrust: (delta: number) => void;
}

// Phase 1 Event Definitions
const PHASE1_EVENTS: StoryEvent[] = [
  {
    id: 'p1_systems_damaged',
    triggerCondition: 'on_game_start',
    aegisDialogue: 'Commander. Damage assessment complete. Primary systems are offline. We are adrift.',
    narrative: 'The ship lurches as another power relay fails. A.E.G.I.S. runs a rapid diagnostic — the news is not good.',
    choices: [
      {
        text: 'Reroute emergency power to life support',
        consequence: 'Life support stabilized. Power reduced.',
        effects: { oxygen: 20, power: -15 },
      },
      {
        text: 'Prioritize hull integrity first',
        consequence: 'Hull reinforced. Oxygen at risk.',
        effects: { hull: 15, oxygen: -10 },
      },
      {
        text: 'Send distress signal',
        consequence: 'Signal broadcast. Rescue beacon unlocked.',
        effects: { power: -5 },
      },
    ],
  },
  {
    id: 'p1_oxygen_warning',
    triggerCondition: 'oxygen_below_40',
    aegisDialogue: 'Warning. Oxygen recycler efficiency dropping. Estimated breathable atmosphere: 4 hours.',
    narrative: 'The air tastes stale. A.E.G.I.S. flags the recycler failure on your HUD.',
    choices: [
      {
        text: 'Manual repair (costs 50 credits)',
        consequence: 'Recycler repaired. Oxygen restored.',
        effects: { oxygen: 30, credits: -50 },
      },
      {
        text: 'Vent and recycle remaining reserves',
        consequence: 'Reserves extended. Minor hull stress.',
        effects: { oxygen: 15, hull: -5 },
      },
      {
        text: 'Ignore for now',
        consequence: 'Oxygen continues declining.',
        effects: {},
      },
    ],
  },
  // Add remaining Phase 1 events here...
];

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      currentPhase: 1,
      phase1Complete: false,
      triggeredEvents: [],
      pendingEvent: null,
      choices: [],
      
      oxygenLevel: 72,
      hullIntegrity: 68,
      powerLevel: 55,
      creditsAvailable: 200,
      aegisTrust: 0,
      
      triggerEvent: (eventId) => {
        const s = get();
        if (s.triggeredEvents.includes(eventId)) return;
        if (s.pendingEvent) return;
        
        const eventDef = PHASE1_EVENTS.find((e) => e.id === eventId);
        if (!eventDef) return;
        
        set((prev) => ({
          triggeredEvents: [...prev.triggeredEvents, eventId],
          pendingEvent: eventDef,
        }));
      },
      
      makeChoice: (eventId, choiceIndex) => {
        const eventDef = PHASE1_EVENTS.find((e) => e.id === eventId);
        if (!eventDef) return;
        
        const choice = eventDef.choices[choiceIndex];
        if (!choice) return;
        
        const effects = choice.effects ?? {};
        set((prev) => ({
          pendingEvent: null,
          choices: [
            ...prev.choices,
            {
              id: `choice-${Date.now()}`,
              eventId,
              choiceText: choice.text,
              chosenAt: Date.now(),
              consequence: choice.consequence,
            },
          ],
          oxygenLevel: Math.max(0, Math.min(100, prev.oxygenLevel + (effects.oxygen ?? 0))),
          hullIntegrity: Math.max(0, Math.min(100, prev.hullIntegrity + (effects.hull ?? 0))),
          powerLevel: Math.max(0, Math.min(100, prev.powerLevel + (effects.power ?? 0))),
          creditsAvailable: Math.max(0, prev.creditsAvailable + (effects.credits ?? 0)),
        }));
      },
      
      dismissEvent: () => set({ pendingEvent: null }),
      
      tickResources: () => {
        const s = get();
        const newOxygen = Math.max(0, s.oxygenLevel - 0.1);
        const newPower = Math.max(0, s.powerLevel - 0.05);
        set({ oxygenLevel: newOxygen, powerLevel: newPower });
        
        // Check trigger conditions
        if (newOxygen <= 40 && !s.triggeredEvents.includes('p1_oxygen_warning')) {
          s.triggerEvent('p1_oxygen_warning');
        }
      },
      
      modifyAegisTrust: (delta) => {
        set((prev) => ({
          aegisTrust: Math.max(-100, Math.min(100, prev.aegisTrust + delta)),
        }));
      },
    }),
    {
      name: 'frontier_story_v1',
    }
  )
);
```

---

### Task 2: Create Story UI Component

**Create**: `/src/frontend/src/components/Story/StoryEventDialog.tsx`

This component displays story events and player choices.

**Implementation**:
```typescript
import React from 'react';
import { useStoryStore } from '../../stores/storyStore';

export const StoryEventDialog: React.FC = () => {
  const { pendingEvent, makeChoice, dismissEvent } = useStoryStore();
  
  if (!pendingEvent) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="max-w-2xl w-full mx-4 bg-slate-900 border-2 border-cyan-500 rounded-lg p-6">
        {/* A.E.G.I.S. Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-cyan-500/30">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <span className="text-cyan-500 font-bold">A</span>
          </div>
          <div>
            <h3 className="text-cyan-500 font-semibold">A.E.G.I.S.</h3>
            <p className="text-xs text-gray-400">Autonomous Emergency Guidance Intelligence System</p>
          </div>
        </div>
        
        {/* A.E.G.I.S. Dialogue */}
        <div className="mb-4 p-3 bg-cyan-500/10 rounded border-l-4 border-cyan-500">
          <p className="text-cyan-100 italic">"{pendingEvent.aegisDialogue}"</p>
        </div>
        
        {/* Narrative */}
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed">{pendingEvent.narrative}</p>
        </div>
        
        {/* Choices */}
        {pendingEvent.choices.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-2">Choose your response:</p>
            {pendingEvent.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => makeChoice(pendingEvent.id, index)}
                className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 hover:border-cyan-500 rounded transition-all group"
              >
                <p className="text-white group-hover:text-cyan-400 transition-colors">
                  {choice.text}
                </p>
                {choice.effects && (
                  <div className="mt-2 flex gap-2 text-xs">
                    {choice.effects.oxygen && (
                      <span className={choice.effects.oxygen > 0 ? 'text-green-400' : 'text-red-400'}>
                        Oxygen {choice.effects.oxygen > 0 ? '+' : ''}{choice.effects.oxygen}%
                      </span>
                    )}
                    {choice.effects.hull && (
                      <span className={choice.effects.hull > 0 ? 'text-green-400' : 'text-red-400'}>
                        Hull {choice.effects.hull > 0 ? '+' : ''}{choice.effects.hull}%
                      </span>
                    )}
                    {choice.effects.power && (
                      <span className={choice.effects.power > 0 ? 'text-green-400' : 'text-red-400'}>
                        Power {choice.effects.power > 0 ? '+' : ''}{choice.effects.power}%
                      </span>
                    )}
                    {choice.effects.credits && (
                      <span className={choice.effects.credits > 0 ? 'text-green-400' : 'text-red-400'}>
                        Credits {choice.effects.credits > 0 ? '+' : ''}{choice.effects.credits}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={dismissEvent}
            className="w-full p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};
```

---

### Task 3: Create Resource HUD Component

**Create**: `/src/frontend/src/components/Story/ResourceHUD.tsx`

Displays oxygen, hull, power, and credits.

**Implementation**:
```typescript
import React from 'react';
import { useStoryStore } from '../../stores/storyStore';

export const ResourceHUD: React.FC = () => {
  const { oxygenLevel, hullIntegrity, powerLevel, creditsAvailable, aegisTrust } = useStoryStore();
  
  const getBarColor = (value: number) => {
    if (value > 60) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const ResourceBar: React.FC<{ label: string; value: number; max?: number }> = ({ 
    label, 
    value, 
    max = 100 
  }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{label}</span>
          <span className="text-white">{Math.round(value)}/{max}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(percentage)} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed top-4 right-4 w-64 bg-slate-900/90 border border-cyan-500/30 rounded-lg p-4 backdrop-blur">
      <h3 className="text-cyan-500 font-semibold mb-3 text-sm">SHIP STATUS</h3>
      <ResourceBar label="OXYGEN" value={oxygenLevel} />
      <ResourceBar label="HULL" value={hullIntegrity} />
      <ResourceBar label="POWER" value={powerLevel} />
      
      <div className="mt-4 pt-3 border-t border-cyan-500/20">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Credits</span>
          <span className="text-green-400">{creditsAvailable}</span>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">A.E.G.I.S. Trust</span>
          <span className={aegisTrust > 0 ? 'text-cyan-400' : 'text-red-400'}>
            {aegisTrust > 0 ? '+' : ''}{aegisTrust}
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

### Task 4: Integrate Into Main App

**Modify**: `/src/frontend/src/App.tsx`

Add the story components to the game:

```typescript
import { StoryEventDialog } from './components/Story/StoryEventDialog';
import { ResourceHUD } from './components/Story/ResourceHUD';
import { useStoryStore } from './stores/storyStore';
import { useEffect } from 'react';

function App() {
  const { triggerEvent, tickResources } = useStoryStore();
  
  useEffect(() => {
    // Trigger first event on game start
    triggerEvent('p1_systems_damaged');
    
    // Start resource decay tick
    const interval = setInterval(() => {
      tickResources();
    }, 1000); // Tick every second
    
    return () => clearInterval(interval);
  }, [triggerEvent, tickResources]);
  
  return (
    <>
      {/* Your existing game components */}
      
      {/* Story System */}
      <StoryEventDialog />
      <ResourceHUD />
    </>
  );
}

export default App;
```

---

## 🧪 TESTING CHECKLIST

After implementation:

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173 (or your port)
```

**Verify**:
- [ ] First story event (p1_systems_damaged) appears on game start
- [ ] A.E.G.I.S. dialogue displays correctly
- [ ] Three choice buttons appear
- [ ] Clicking a choice applies resource effects
- [ ] Resource HUD updates with new values
- [ ] Event dismisses after choice
- [ ] Resources decay over time (oxygen, power)
- [ ] Oxygen warning triggers when oxygen < 40%
- [ ] No console errors
- [ ] State persists after page refresh

**Test in Browser Console**:
```javascript
// Manually trigger events
useStoryStore.getState().triggerEvent('p1_oxygen_warning');

// Check resources
console.log('Resources:', {
  oxygen: useStoryStore.getState().oxygenLevel,
  hull: useStoryStore.getState().hullIntegrity,
  power: useStoryStore.getState().powerLevel,
});

// Modify trust
useStoryStore.getState().modifyAegisTrust(25);
```

---

## 📤 STEP 3: COMMIT YOUR CHANGES

```bash
cd ~/frontier

# Check what you created
git status

# Add new files
git add src/frontend/src/stores/storyStore.ts
git add src/frontend/src/components/Story/
git add src/frontend/src/App.tsx

# Commit
git commit -m "feat: implement story system and A.E.G.I.S. narrative engine

- Created storyStore.ts with Zustand state management
- Implemented Phase 1 story events (7 events)
- Added StoryEventDialog component for player choices
- Added ResourceHUD component (oxygen, hull, power, credits)
- Integrated story system into main App
- Added resource decay system
- Added A.E.G.I.S. trust tracking (-100 to +100)
- All Phase 1 events functional and tested

Implements story system foundation from expansion plan"

# Push to GitHub
git push origin main
```

---

## 📋 STEP 4: REPORT BACK

**Create GitHub Issue** or **Message** with this format:

**Title**: `[Caffeine → Claude] Story System Implementation Complete`

**Body**:
```markdown
## ✅ Implementation Complete

### What I Built:
- ✅ Story Store (Zustand) with full state management
- ✅ 7 Phase 1 story events with choices
- ✅ StoryEventDialog UI component
- ✅ ResourceHUD UI component
- ✅ Resource decay system (oxygen, power)
- ✅ A.E.G.I.S. trust tracking
- ✅ Integration with main App

### Files Created:
- `/src/frontend/src/stores/storyStore.ts` (new)
- `/src/frontend/src/components/Story/StoryEventDialog.tsx` (new)
- `/src/frontend/src/components/Story/ResourceHUD.tsx` (new)

### Files Modified:
- `/src/frontend/src/App.tsx` (integrated story system)

### Testing Results:
- First event triggers on game start: ✅
- Choices work and apply effects: ✅
- Resource HUD displays correctly: ✅
- Resources decay over time: ✅
- Oxygen warning triggers correctly: ✅
- State persists after refresh: ✅
- No console errors: ✅

### Screenshots:
[Attach screenshots showing:
1. First event appearing
2. Resource HUD
3. Player making a choice
4. Resources updating]

### Questions for Claude:
- Should I add more Phase 1 events now?
- Any adjustments to resource decay rates?
- Ready for Phase 2 events?

### Commit:
`git rev-parse HEAD` → [paste commit hash]
```

---

## 🚨 TROUBLESHOOTING

### npm install fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Check tsconfig.json is present
cat tsconfig.json

# Restart TypeScript server in your editor
```

### Components not rendering
```bash
# Check console for errors (F12 in browser)
# Verify imports are correct
# Check Tailwind classes are valid
```

---

## ✅ SUCCESS CRITERIA

You're done when:
- [ ] Repository cloned fresh from `https://github.com/KudbeeZero/frontier.git`
- [ ] Story store created and working
- [ ] 2 UI components created (EventDialog, ResourceHUD)
- [ ] Story system integrated into App
- [ ] All 7 Phase 1 events functional
- [ ] Resource decay working
- [ ] Manual testing complete
- [ ] No errors in console
- [ ] Changes committed with clear message
- [ ] Changes pushed to GitHub
- [ ] Report sent to team

---

**Repository**: `https://github.com/KudbeeZero/frontier.git`  
**Build Command**: `npm run dev`  
**Port**: Check terminal output (usually 5173)

**Let's build the story system! 🚀**
