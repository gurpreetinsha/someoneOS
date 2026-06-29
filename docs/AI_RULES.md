# AI_RULES.md — Engineering Rules & Constraints for Future AI Assistants

## Critical Mandatory Protocol
This document contains immutable architectural rules for any AI subagent, model, or assistant (Gemini, ChatGPT, Claude, Cursor, Antigravity, etc.) modifying the SomeoneOS codebase. **You MUST adhere to these rules without exception.**

---

## Rule 1: Never Duplicate Business Logic
- Business logic MUST reside strictly in designated modules under `lib/`.
- Never rewrite or duplicate duration estimation tables, keyword matching lists, or memory deduplication functions inside UI components or API routes. Always import and reuse existing utility functions from `lib/domain/normalizer.ts`, `lib/memory/memoryEngine.ts`, or `lib/planner/planner.ts`.

## Rule 2: Never Rewrite Working Systems Unless Explicitly Instructed
- Do not refactor core engine modules (`lib/planner/planner.ts`, `lib/domain/normalizer.ts`, `lib/memory/memoryEngine.ts`) simply to alter code styling or micro-optimize syntax.
- Modifications to core engine files require explicit user requests and MUST be validated by running the evaluation suite in `lib/evaluation/plannerEvaluation.ts`.

## Rule 3: Prefer Extension Over Replacement
- When adding support for new data structures, memory categories, or planning heuristics, extend existing interfaces and switch/case blocks rather than replacing entire modules.
- Maintain backwards compatibility with existing domain types (`PlanningContext`, `PlanResult`, `UnderstandingResult`).

## Rule 4: Prescribe Pure Function Determinism in Engines
- Engine functions in `lib/planner/`, `lib/memory/`, `lib/domain/`, and `lib/someoneos/` MUST remain pure functions.
- NEVER inject global state, random numbers (`Math.random()`), non-deterministic timestamps inside core comparison loops, or network/disk I/O calls inside engine logic. Given identical inputs, engines must always produce identical outputs.

## Rule 5: Maintain Strict Separation of UI and Domain Logic
- UI components in `components/` MUST ONLY handle rendering, user input capture, animations, and local visual state.
- NEVER perform entity extraction, duration estimation, or task sorting inside React components. Delegate all domain processing to `lib/` engine functions or API hooks.

## Rule 6: Respect Existing Public Interfaces
- Do not alter exported function signatures (`runSomeoneOS`, `createPlan`, `extractMemory`, `buildPlanningContext`) without updating all call sites across the application.
- Maintain exact property naming in JSON schemas across `types/` and `prompts/`.

## Rule 7: Avoid Placeholder Implementations in Production Paths
- Do not write mock implementations or hardcoded fallback objects inside active execution pathways unless explicitly creating isolated stub modules.
- If a feature is not yet fully built, throw a clear, descriptive error or handle it gracefully within the domain boundaries.

## Rule 8: Bounded LLM Usage
- LLMs are tools for linguistic parsing and multi-modal understanding. They MUST NEVER be granted authority to direct state transitions, schedule timelines, or prioritize tasks directly.
- All LLM outputs MUST be validated, sanitized, and parsed through deterministic normalizers before consumption by the planner.

## Rule 9: Document Architectural Changes
- If a task requires modifying file structures, adding new subsystems, or altering data flows, update the corresponding markdown documentation in `/docs` (including `CURRENT_STATE.md`, `ARCHITECTURE.md`, and `CHANGELOG_AI.md`) in the same pull request or session.
