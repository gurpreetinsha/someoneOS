# CONSTITUTION.md — Permanent Engineering Principles of SomeoneOS

## Preamble
This Constitution sets forth the foundational, unalterable engineering principles of **SomeoneOS**. These principles govern all technical designs, refactoring proposals, and architectural extensions. They are binding upon all human developers and artificial intelligence agents operating on this repository.

---

## Principle I: Determinism is Paramount
The core value proposition of SomeoneOS relies on absolute reliability.
- **Section 1.1**: The generation of task schedules, allocation of focus blocks, resolution of task dependencies, and calculation of behavioral time buffers MUST be 100% deterministic.
- **Section 1.2**: Given identical inputs, domain engines (`lib/planner/`, `lib/memory/`, `lib/domain/`) MUST produce identical, bite-for-byte outputs. Probabilistic machine learning models MUST NEVER execute schedule calculations directly.

## Principle II: Absolute Separation of Extraction and Logic
- **Section 2.1**: Large Language Models (LLMs) are natural language interpreters, not business logic engines. Their role is strictly bounded to converting unstructured linguistic streams into valid structured data transfer objects (DTOs).
- **Section 2.2**: Business rules, categorization heuristics, state transitions, and scheduling algorithms MUST reside exclusively in pure TypeScript modules outside the LLM prompt layer.

## Principle III: Zero-Friction User Experience
- **Section 3.1**: The user interface MUST prioritize immediate stream-of-consciousness entry over structured data entry forms.
- **Section 3.2**: The application MUST NOT force the user to manually input fields (such as estimated minutes, tags, or priority dropdowns) during initial thought capture. Cognitive triage is the responsibility of the system, not the user.

## Principle IV: Radical Transparency & Explainability
- **Section 4.1**: The system MUST NEVER silently alter, defer, or modify a task schedule without exposing the underlying rationale.
- **Section 4.2**: Any applied behavioral buffer, schedule adjustment, or unplanned aspirational goal MUST be paired with an explicit `PlanAssumption` or `PlanWarning` output made accessible to the user interface.

## Principle V: Extension Over Modification (Open/Closed Principle)
- **Section 5.1**: Core domain engine interfaces MUST be open for extension (e.g., adding new memory domains, tools, or calendar anchors) but closed for modification.
- **Section 5.2**: Existing public contracts and return types MUST NOT be broken when implementing new sub-features.

## Principle VI: Zero-Placeholder Integrity
- **Section 6.1**: Production pathways MUST NOT contain fake mock data, silent stubs, or placeholder implementations that mimic success.
- **Section 6.2**: Extension points MUST be explicitly flagged as unintegrated or structured as clean interface boundaries until fully implemented and verified.
