# SomeoneOS — Developer & Engineering Manual

This manual contains setup procedures, coding standards, verification protocols, roadmaps, and guidelines for human developers and autonomous AI subagents working on **SomeoneOS**.

---

## 1. Directory Topology

The codebase enforces strict separation of Next.js routes, components, custom hooks, prompts, types, and logic:

```
someoneos/
├── app/                  # Next.js App Router routes & API endpoints
├── components/           # UI components
│   ├── ui/               # Generic design system primitives (Radix/Shadcn)
│   └── workspace/        # Domain-specific workspace dashboard views
├── hooks/                # Custom React client hooks (useExtraction)
├── lib/                  # Core domain engines & logic modules
│   ├── domain/           # Concept Normalizer mapping & primitive types
│   ├── memory/           # Personal memory category parser
│   ├── orchestrator/     # Core OS orchestrator & failure calculators
│   └── planner/          # Deterministic task scheduling engine (Algorithm 8)
├── prompts/              # Strict Gemini extraction prompt templates
├── tests/                # Unified testing suites and quality benchmarks
├── types/                # Unified TypeScript API schemas
└── docs/                 # Masters and architectural decisions
```

---

## 2. Setup & Local Development

### Prerequisites
- Node.js (v20+ recommended)
- Firebase Account (for authentication context)
- Google Gemini API Key

### Step-by-Step Local Deployment
1. **Clone the Repository & Install Dependencies**
   ```bash
   git clone <repository_url>
   cd someoneos
   npm install
   ```

2. **Configure Environment Settings**
   Create a `.env.local` file by copying the template:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys and project settings:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the landing screen.

---

## 3. Developer Onboarding Demo Script

To quickly demonstrate the cognitive pipelines without connecting a live Firebase Auth backend:
1. Land on the home page `/` and click **Demo Account / Sign-In**. This logs in a mock `judge@someoneos.ai` identity.
2. Observe the **Memory Bank Sidebar** seeded with:
   - Routine: *Drop kids off at school* (applied at 8:00 AM daily).
   - Preference: *Avoid early morning meetings*.
   - Health: *Lower back stiffness* (triggers stretch breaks at 1:00 PM).
   - Behavior: *Procrastination memory active* (+20% task estimate buffers).
3. Type this unstructured brain dump into the input field:
   > *"I have a Meta interview next Wednesday, but my back hurts so much and I hate early meetings. Need to review graph problems. Also need to buy groceries today."*
4. Press **Build My Week**. The **Clarification Panel** halts the process and prompts: *"When is your interview?"*
5. Input `2:00 PM` and press **Continue**.
6. The schedule will load, applying the **+20% buffer** to graph reviews, injecting a **fatigue stretch break** at 1:00 PM, and locking the **Meta Interview** as a fixed anchor at 2:00 PM.

---

## 4. Verification & Testing

Verify that Algorithm 8 and the memory engines are performing deterministically by running the unified test suite:
```bash
# Runs memory tests, planner tests, risk evaluator tests, and the 52-scenario evaluation harness
npm test
```

---

## 5. Engineering Constitution

These principles govern all technical designs, refactoring proposals, and architectural extensions:
- **Principle I: Determinism is Paramount**: Calculation of task schedules, focus blocks, and time buffers MUST be 100% deterministic. Given identical inputs, domain engines (`lib/planner/`, `lib/memory/`, `lib/domain/`) MUST produce identical outputs.
- **Principle II: Absolute Separation of Extraction and Logic**: LLMs are natural language interpreters, not business logic engines. They convert text to JSON. Business rules and scheduling engines must remain in pure TypeScript code.
- **Principle III: Zero-Friction User Experience**: Thought capture must be form-free. Cognitive triage is the responsibility of the system, not the user.
- **Principle IV: Radical Transparency**: The system must expose why it deferred a task or inserted a buffer via explicit `PlanAssumption` and `PlanWarning` logs.
- **Principle V: Extension Over Modification (Open/Closed Principle)**: Extend existing interfaces and switch/case blocks rather than replacing entire modules.
- **Principle VI: Zero-Placeholder Integrity**: Production paths must not contain mock data, silent stubs, or placeholder implementations.

---

## 6. AI Subagent Constraints & Rules

If you are an AI assistant (Cursor, Antigravity, Gemini, etc.) modifying SomeoneOS, you must strictly obey these rules:
1. **Never Duplicate Business Logic**: All business rules, classification regex, and estimations must live under `lib/`. Do not duplicate logic inside components or API route files.
2. **Never Rewrite Working Systems Without Explicit Instruction**: Do not refactor core engine modules (`lib/planner/planner.ts`, `lib/domain/normalizer.ts`, `lib/memory/memoryEngine.ts`) simply to micro-optimize syntax or alter code styling.
3. **Prefer Extension Over Replacement**: Maintain backwards compatibility with existing domain types (`PlanningContext`, `PlanResult`, `UnderstandingResult`).
4. **Prescribe Pure Function Determinism in Engines**: Do not inject global state, non-deterministic timers, random numbers, or network I/O calls inside core engine logic.
5. **Separation of UI and Domain Logic**: React components must handle only rendering, visual state, and user input capture.

---

## 7. Development Roadmap

- **Stage 1 (Core Pipeline & Engine)**: **100% Complete**. The linguistic parser, clarification engine, memory engine, domain normalizer, deterministic scheduler, and interactive workspace UI are fully functional in-memory.
- **Stage 2 (Firestore Persistence)**: **Planned / Next Milestone**. Connect Firebase Firestore to persist extracted `MemoryItem` records per authenticated user.
- **Stage 3 (Calendar Integration)**: **Planned**. Two-way sync with Google Calendar/Outlook to map schedule tasks as dynamic focus blocks.
- **Stage 4 (Autonomous Execution Proxies)**: **Planned (Long-Term)**. Implement API tools (GitHub, Gmail, Slack) to draft emails or execute pull requests directly from the schedule.

---

## 8. AI Development History (Changelog)

### Entry: 2026-07-01 — Post-Hackathon Repository Cleanup
- **Goal**: Clean up loose files, centralize testing suites, reorganize engine structure, and consolidate developer documentation.
- **Files Modified**:
  - `package.json` (Added `test` script and `tsx` dependency)
  - `components/workspace/WorkspaceLayout.tsx` (Updated orchestrator import)
  - `components/workspace/ExecutionPreview.tsx` (Updated orchestrator import)
- **Files Moved & Renamed**:
  - `lib/memory/testMemoryEngine.ts` -> `tests/memoryEngine.test.ts`
  - `lib/planner/testPlanner.ts` -> `tests/planner.test.ts`
  - `lib/someoneos/testFailurePrediction.ts` -> `tests/failurePrediction.test.ts`
  - `lib/evaluation/plannerEvaluation.ts` -> `tests/plannerEvaluation.ts`
  - `lib/someoneos/` -> `lib/orchestrator/`
- **Files Deleted**:
  - Legacy test files inside `lib/`
  - Redundant markdown files in `docs/` and root (19 files consolidated into 2 master files)
  - Generated transpiled file `test-negotiator.js` in root
- **Architectural Impact**: Centralized all unit tests under `tests/` and renamed the orchestrator layer to `lib/orchestrator` to enforce a clean, professional, and feature-oriented directory structure.
