# CURRENT_STATE.md — SomeoneOS System Health & Milestone Snapshot

## 1. Executive Summary
SomeoneOS is currently at **Stage 1 (Brain Dump Ingestion & Deterministic Planning Engine)**. The core pipeline is fully functional end-to-end: unstructured user text is extracted via Google Gemini 2.5 Flash, verified by a deterministic clarification generator, extracted into memory primitives, normalized into a structured domain context, and transformed into an ordered execution plan via a deterministic sorting algorithm (Algorithm 8).

---

## 2. Completed Systems
| Subsystem | File Location | Status | Operational Notes |
| :--- | :--- | :--- | :--- |
| **Understanding Extraction API** | [app/api/extract/route.ts](file:///d:/Codes/Projects/someoneos/app/api/extract/route.ts) | **Complete** | Calls Gemini 2.5 Flash with structured JSON schema enforced. Extracts events, deadlines, goals, constraints, priorities, emotional signals, missing info. |
| **Clarification Engine** | [lib/clarification.ts](file:///d:/Codes/Projects/someoneos/lib/clarification.ts) | **Complete** | Pure deterministic rule engine checking missing dates/times and effort estimates. Generates max 3 targeted questions. |
| **Memory Engine** | [lib/memory/memoryEngine.ts](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts) | **Complete** | Pure deterministic extractor categorizing statements into 7 memory domains (routine, preference, project, goal, relationship, health, behavior). Uses `djb2Hash` deduplication. |
| **Domain Normalizer** | [lib/domain/normalizer.ts](file:///d:/Codes/Projects/someoneos/lib/domain/normalizer.ts) | **Complete** | Maps raw extractions and memories into single-domain primitives (`PlanningContext`). Performs duration lookup estimation and deadline linking. |
| **Planner Engine (Alg 8)** | [lib/planner/planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts) | **Complete** | Pure deterministic execution sorter. Applies behavioral buffers (+20%), separates events & abstract goals, sorts tasks by deadline -> priority -> dependencies -> title. |
| **Orchestrator Engine** | [lib/someoneos/engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts) | **Complete** | Clean functional orchestrator binding memory, normalization, and planning into single synchronous flow. |
| **Auth & Firebase Setup** | [lib/auth.ts](file:///d:/Codes/Projects/someoneos/lib/auth.ts), [lib/firebase.ts](file:///d:/Codes/Projects/someoneos/lib/firebase.ts) | **Complete** | Firebase Google Auth context provider with client-side reactive state. |
| **Workspace UI Suite** | [components/workspace/*](file:///d:/Codes/Projects/someoneos/components/workspace) | **Complete** | Full interactive suite including brain dump input, AI understanding breakdown cards, clarification prompt panel, memory sidebar, and execution preview. |
| **Planner Evaluation Suite** | [lib/evaluation/plannerEvaluation.ts](file:///d:/Codes/Projects/someoneos/lib/evaluation/plannerEvaluation.ts) | **Complete** | Standalone benchmark suite verifying planner determinism and accuracy across 50+ handwritten edge cases. |

---

## 3. Current Implementation Status
- **Pipeline Flow**: Pure functional in-memory flow operating on single-session request state.
- **LLM Integration**: Bounded to extraction (`gemini-2.5-flash`). Uses standard HTTP JSON response handling with code block sanitation.
- **UI Architecture**: Client components rendered inside Next.js App Router (`app/page.tsx`, `app/dashboard/page.tsx`).

---

## 4. Known Limitations
1. **In-Memory Volatility**: Memory items and extracted plans currently exist only within the active React client state. Refreshing the browser resets accumulated memory items.
2. **Mocked Calendar & Execution Extensions**: Extension points for Calendar, Execution, Research, and Notifications in [engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts#L37-L40) are commented stub points.
3. **Regex/Keyword Heuristic Reliance in Normalizer**: The Domain Normalizer relies on predefined keyword dictionary tables for category classification and duration estimations.

---

## 5. Current & Next Milestones

### Current Milestone: Stage 1 (Core Pipeline & Planner Benchmark Validation) — **Status: 100% COMPLETE**
- [x] Unstructured LLM extraction pipeline.
- [x] Deterministic memory extraction & hashing.
- [x] Domain normalizer context construction.
- [x] Deterministic planner (Algorithm 8) implementation.
- [x] Standalone evaluation harness.

### Next Milestone: Stage 2 (Persistence & Multi-Session Memory Engine) — **Status: PLANNED**
- [ ] Connect Firebase Firestore to persist extracted `MemoryItem` records per authenticated `userId`.
- [ ] Hydrate long-term memories into `buildPlanningContext` across sessions.
- [ ] Build user memory management UI (edit/delete learned habits and routines).

---

## 6. Open Technical Debt
- **Shared Type Duplication**: Minor overlap between extraction types in [types/extraction.ts](file:///d:/Codes/Projects/someoneos/types/extraction.ts) and domain types in [lib/domain/types.ts](file:///d:/Codes/Projects/someoneos/lib/domain/types.ts).
- **Hardcoded API Keys Warning**: Safe client/server environment checks present, but requires full verification in production deployment scripts.
