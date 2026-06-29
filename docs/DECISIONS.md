# DECISIONS.md — SomeoneOS Architectural Decision Records (ADRs)

This document records the fundamental architectural choices governing SomeoneOS design, including technical rationale, rejected alternatives, and operational impacts.

---

## ADR-001: Separation of LLM Extraction and Pure Deterministic Planning
- **Status**: **ACCEPTED**
- **Context**: Autonomous AI assistants often use end-to-end LLM prompts to produce schedules directly from raw user input.
- **Decision**: Restrict the LLM strictly to linguistic entity extraction (`app/api/extract/route.ts`). Delegate all schedule construction, task prioritization, dependency resolution, and timing estimations to pure TypeScript engines (`lib/planner/planner.ts`).
- **Reason**: LLMs are non-deterministic, frequently hallucinate fake times, ignore hard constraints when context windows grow large, and fail to reliably perform arithmetic priority sorting. Pure TypeScript code guarantees reproducible, explainable, and instantaneous schedule ordering.
- **Alternatives Rejected**: End-to-end LLM schedule generation; Re-prompting LLMs with constraint feedback.
- **Impact**: Zero hallucinated task schedules; instantaneous execution order calculation; ability to benchmark algorithm quality via unit tests.

---

## ADR-002: Intermediate Domain Normalization Layer (`PlanningContext`)
- **Status**: **ACCEPTED**
- **Context**: Unstructured text extractions contain mixed signals—some statements are habits, others are deadlines, fixed events, or abstract aspirations.
- **Decision**: Introduce `lib/domain/normalizer.ts` to transform linguistic extractions into standardized `PlanningContext` domain primitives (`ActionableItem`, `DomainConstraint`, `EventAnchor`, `AbstractGoal`, `DomainPreference`, `DomainRoutine`, `HealthFactor`, `BehaviorFactor`) before calling the planner.
- **Reason**: Decouples the raw extraction format from the planner engine. Ensures that candidate statements are normalized into exactly ONE mutually exclusive domain primitive, eliminating duplicate tasks across schedules.
- **Alternatives Rejected**: Direct consumption of raw LLM JSON outputs inside `planner.ts`.
- **Impact**: Highly modular engine pipeline; easily swappable LLM extractors without impacting downstream planner logic.

---

## ADR-003: Deterministic Hash-Based ID Generation (`djb2Hash`)
- **Status**: **ACCEPTED**
- **Context**: Extracted memories and tasks require persistent unique identifiers for tracking, deduplication, and dependency referencing.
- **Decision**: Use a deterministic `djb2Hash` string hashing function combined with cleaned entity titles (`mem_routine_a1b2c3d4` or `task_e5f6g7h8`).
- **Reason**: Random UUID generation causes identical memories and tasks extracted across repeated sessions to produce different IDs, making deduplication impossible without database lookups. Deterministic hashing ensures identical entity text produces identical IDs.
- **Alternatives Rejected**: `crypto.randomUUID()`; sequential auto-incrementing integer IDs.
- **Impact**: Instantaneous in-memory deduplication across extraction runs; predictable unit testing.

---

## ADR-004: Execution Ordering via Algorithm 8
- **Status**: **ACCEPTED**
- **Context**: Actionable tasks require a strict, non-ambiguous ordering sequence for display in user execution previews.
- **Decision**: Implement a multi-tiered array sort in `planner.ts` evaluating: **1. Deadline presence -> 2. Priority rank (high=3, medium=2, low=1) -> 3. Dependency count -> 4. Title alphabetical sorting**.
- **Reason**: Provides a deterministic, highly predictable algorithm that prioritizes urgent time-sensitive work while breaking ties cleanly without random fluctuation.
- **Alternatives Rejected**: Dynamic topological graph sorting with weighted probability scoring.
- **Impact**: Guaranteed consistent sort results across identical task lists.

---

## ADR-005: Client-Side Authentication State Provider (`AuthProvider`)
- **Status**: **ACCEPTED**
- **Context**: SomeoneOS requires user session context for personalizing memory storage and workspace state.
- **Decision**: Implement a React Context provider (`lib/auth.ts`) wrapping Firebase Auth client SDK listeners (`onAuthStateChanged`).
- **Reason**: Next.js App Router client components require seamless reactivity to login status without blocking initial static page hydration.
- **Alternatives Rejected**: Server-only session cookie middleware blocking page loads.
- **Impact**: Fast client-side page transitions; lightweight auth integration.
