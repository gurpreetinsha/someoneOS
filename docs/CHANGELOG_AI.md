# CHANGELOG_AI.md — Machine-Readable AI Development History

This log tracks architectural milestones and major engineering modifications to SomeoneOS in a structured format optimized for AI subagent context ingestion.

---

## Entry: 2026-06-29 — AI-First Documentation System Establishment
- **Goal**: Generate a permanent, authoritative AI-first documentation system in `/docs` to serve as the primary source of truth for future AI models.
- **Files Changed**:
  - `docs/PROJECT_VISION.md` [NEW]
  - `docs/CURRENT_STATE.md` [NEW]
  - `docs/ARCHITECTURE.md` [NEW]
  - `docs/DIRECTORY_GUIDE.md` [NEW]
  - `docs/ROADMAP.md` [NEW]
  - `docs/DECISIONS.md` [NEW]
  - `docs/AI_RULES.md` [NEW]
  - `docs/HANDOFF.md` [NEW]
  - `docs/CHANGELOG_AI.md` [NEW]
  - `docs/CONSTITUTION.md` [NEW]
  - `docs/specifications/*.md` (8 Subsystem Specifications) [NEW]
- **Architectural Impact**: Formalized the separation of probabilistic LLM extraction from pure deterministic TypeScript engines. Defined strict directory boundaries and immutable engineering principles.
- **Reason**: Enable seamless context retrieval and architectural adherence for multi-agent workflows.
- **Future Implications**: All future AI coding sessions must inspect `/docs` and obey `AI_RULES.md` before attempting codebase refactoring.

---

## Entry: 2026-06-29 — Planner Evaluation Suite Implementation
- **Goal**: Build a robust, standalone evaluation harness to benchmark and verify planner accuracy across edge cases.
- **Files Changed**:
  - `lib/evaluation/plannerEvaluation.ts` [NEW]
- **Architectural Impact**: Established automated verification for Planner Algorithm 8 sorting rules, behavioral buffer adjustments (+20%), and constraint handling.
- **Reason**: Ensure zero regression in deterministic task sorting when updating planner rules.
- **Future Implications**: Modifications to `lib/planner/planner.ts` must pass all test scenarios in `plannerEvaluation.ts`.

---

## Entry: 2026-06-29 — Stage 1 Engine Pipeline Finalization
- **Goal**: Complete the core functional ingestion and planning pipeline.
- **Files Changed**:
  - `app/api/extract/route.ts`
  - `prompts/extraction.ts`
  - `lib/clarification.ts`
  - `lib/memory/memoryEngine.ts`
  - `lib/domain/normalizer.ts`
  - `lib/planner/planner.ts`
  - `lib/someoneos/engine.ts`
- **Architectural Impact**: Standardized `PlanningContext` and `SomeoneOSResult` computational data flows.
- **Reason**: Establish foundational cognitive architecture for SomeoneOS.
- **Future Implications**: Serves as the stable domain layer for Stage 2 persistence integration.
