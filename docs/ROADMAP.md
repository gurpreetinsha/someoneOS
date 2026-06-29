# ROADMAP.md — SomeoneOS Multi-Stage Development Roadmap

## Overview
SomeoneOS is developed through modular, sequential stages. Each stage enforces pure functional separation and verifies quality through automated benchmarks before advancing to multi-device state synchronization and autonomous tool execution.

---

## Development Stages

### Stage 1: Ingestion Pipeline & Deterministic Planning Engine
- **Goal**: Establish the end-to-end cognitive pipeline converting raw text into structured execution schedules without LLM scheduling hallucination.
- **Status**: **100% COMPLETE**
- **Expected Files**:
  - `app/api/extract/route.ts`
  - `prompts/extraction.ts`
  - `lib/clarification.ts`
  - `lib/memory/memoryEngine.ts`
  - `lib/domain/normalizer.ts`
  - `lib/planner/planner.ts`
  - `lib/someoneos/engine.ts`
  - `lib/evaluation/plannerEvaluation.ts`
- **Dependencies**: `@google/generative-ai`, Next.js App Router.
- **Completion Criteria**: 
  - [x] LLM successfully extracts JSON entities without syntax errors.
  - [x] Planner Algorithm 8 passes 50+ deterministic benchmark scenarios in `plannerEvaluation.ts`.
  - [x] UI visualizes tasks, memory items, clarification questions, and execution orders.
- **Future Improvements**: Transition duration estimations from static lookup tables to dynamic user behavioral metrics.

---

### Stage 2: Firebase Firestore Persistence & Long-Term Memory Engine
- **Goal**: Synchronize user memories, past execution plans, and clarification history across sessions and devices.
- **Status**: **PLANNED (Next Objective)**
- **Expected Files**:
  - `lib/firestore/memoryStore.ts` (NEW)
  - `lib/firestore/planStore.ts` (NEW)
  - `hooks/useMemory.ts` (NEW)
  - `components/workspace/MemoryManagerDialog.tsx` (NEW)
- **Dependencies**: `firebase/firestore`, `lib/auth.ts`, Stage 1 Memory Engine.
- **Completion Criteria**:
  - [ ] Extracted memory items are saved to Firebase Firestore under `users/{userId}/memories`.
  - [ ] Accumulated long-term memories are retrieved on page load and hydrated into `buildPlanningContext`.
  - [ ] Users can manually inspect, edit, or soft-delete learned habits and routines in a UI dialog.
- **Future Improvements**: Implement vector embeddings or similarity search for memory deduplication across hundreds of past sessions.

---

### Stage 3: Calendar Integration & Fixed Schedule Anchoring
- **Goal**: Seamlessly synchronize SomeoneOS fixed event anchors with external calendar providers (Google Calendar, Outlook).
- **Status**: **PLANNED**
- **Expected Files**:
  - `lib/calendar/googleCalendar.ts` (NEW)
  - `lib/calendar/types.ts` (NEW)
  - `app/api/calendar/sync/route.ts` (NEW)
- **Dependencies**: Google Calendar API / OAuth2 tokens, Stage 1 Planner Anchors.
- **Completion Criteria**:
  - [ ] Fixed events extracted from brain dumps are automatically queried against live calendar availability.
  - [ ] Final execution plans respect existing Google Calendar blocks without overlap.
  - [ ] Generated tasks can be pushed to Google Calendar as focus blocks.
- **Future Improvements**: Bi-directional real-time webhook synchronization for external calendar changes.

---

### Stage 4: Autonomous Task Execution & Tool Integrations
- **Goal**: Transform SomeoneOS from a static task planner into an active execution agent capable of performing digital actions.
- **Status**: **PLANNED (Long-Term)**
- **Expected Files**:
  - `lib/execution/executionEngine.ts` (NEW)
  - `lib/tools/githubTool.ts` (NEW)
  - `lib/tools/emailTool.ts` (NEW)
- **Dependencies**: Tool APIs, OAuth scopes, Stage 1 Task IDs.
- **Completion Criteria**:
  - [ ] Planner tasks with execution metadata can be triggered by the user to auto-summarize emails or draft GitHub pull requests.
  - [ ] Execution feedback updates task status in real-time.
- **Future Improvements**: Proactive, autonomous background cron execution of low-risk administrative tasks.
