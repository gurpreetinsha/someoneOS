# DIRECTORY_GUIDE.md — SomeoneOS Directory Topology & Conventions

## 1. Directory Structural Overview
The SomeoneOS repository strictly separates Next.js application framework code, UI layout components, custom hooks, prompt engineering templates, static type definitions, and core domain engine logic.

```
someoneos/
├── app/                  # Next.js App Router routes & API endpoints
├── components/           # UI components (Atomic primitives & Workspace views)
│   ├── ui/               # Generic design system primitives (Radix/Shadcn)
│   └── workspace/        # Domain-specific workspace components
├── hooks/                # Custom React client hooks
├── lib/                  # Core domain engines & utility suites
│   ├── domain/           # Intermediate domain normalizer & primitives
│   ├── evaluation/       # Benchmark harness & test suites
│   ├── memory/           # Deterministic memory extraction engine
│   ├── planner/          # Deterministic task scheduling engine (Alg 8)
│   └── someoneos/        # Top-level domain orchestrator engine
├── prompts/              # System prompt strings & LLM templates
├── types/                # Shared TypeScript definitions & schemas
└── docs/                 # System documentation & specs
```

---

## 2. Directory Specifications

### `/app`
- **Purpose**: Next.js App Router routing infrastructure, pages, and backend API handlers.
- **Responsibilities**: Defines root layout (`layout.tsx`), page routes (`page.tsx`, `dashboard/page.tsx`), global CSS styles (`globals.css`), and HTTP endpoints (`api/extract/route.ts`).
- **Forbidden Content**: Core business logic, scheduling algorithms, or memory extraction rules. API routes MUST remain thin controllers delegating to `lib/` modules.
- **Dependencies**: Next.js framework, React, `lib/gemini.ts`, `prompts/`.

### `/components`
- **Purpose**: React UI component tree divided into generic design primitives (`ui/`) and domain workspace views (`workspace/`).
- **Responsibilities**:
  - `components/ui/`: Atomic UI components (Buttons, Cards, Inputs, Dialogs).
  - `components/workspace/`: Business-aware UI panels (`BrainDumpInput.tsx`, `ExecutionPreview.tsx`, `MemorySidebar.tsx`, `ClarificationPanel.tsx`).
- **Forbidden Content**: Direct LLM SDK invocations or raw calculation algorithms.
- **Dependencies**: React, Lucide React icons, Tailwind CSS, Radix UI primitives.

### `/hooks`
- **Purpose**: Custom React hooks encapsulating complex UI state, async API fetch lifecycles, and context subscriptions.
- **Responsibilities**: `useExtraction.ts` manages HTTP calls to `/api/extract`, loading state, and error handling.
- **Forbidden Content**: Scheduling algorithms or multi-page state storage logic.
- **Dependencies**: React hooks (`useState`, `useCallback`), custom API routes.

### `/lib`
- **Purpose**: The core engine repository containing pure business logic, domain models, and third-party SDK wrappers.
- **Subdirectories & Boundaries**:
  - `lib/someoneos/`: Top-level orchestrator (`engine.ts`).
  - `lib/planner/`: Deterministic schedule generator and priority sorter (`planner.ts`).
  - `lib/memory/`: Pure statement classifier and memory deduplicator (`memoryEngine.ts`).
  - `lib/domain/`: Domain primitive normalizer (`normalizer.ts`, `types.ts`).
  - `lib/evaluation/`: Automated planner benchmark evaluation suite (`plannerEvaluation.ts`).
  - `lib/firebase.ts` & `lib/auth.ts`: Firebase configuration and React Auth context.
  - `lib/gemini.ts`: Google Generative AI SDK client initializer.
- **Forbidden Content**: React JSX elements or DOM references in domain folders (`domain/`, `planner/`, `memory/`, `someoneos/`). Core domain engines MUST remain pure TS modules executable in node, browser, or edge runtimes.

### `/prompts`
- **Purpose**: Centralized storage for system instruction templates sent to LLMs.
- **Responsibilities**: Holds strict JSON schemas and extraction instructions (`extraction.ts`).
- **Forbidden Content**: Imperative JavaScript/TypeScript logic or execution rules.
- **Dependencies**: Standard TypeScript string exports.

### `/types`
- **Purpose**: Shared static TypeScript interfaces and type definitions across client and server.
- **Responsibilities**: Defines extraction structures (`extraction.ts`), clarification structures (`clarification.ts`), and linguistic understanding outputs (`understanding.ts`).
- **Forbidden Content**: Executable JavaScript runtime code or function implementations.
