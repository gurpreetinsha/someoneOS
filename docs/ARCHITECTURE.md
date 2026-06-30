# SomeoneOS — Complete Technical Architecture & Overview Specification

This document provides a comprehensive technical breakdown of the **SomeoneOS** software architecture, engines, directories, data models, components, pipelines, and workflows. It is structured for developers, founding engineers, and autonomous AI agents seeking to review, refactor, or deploy the system for hackathons or production.

---

## 1. Project Summary

### What Problem It Solves
Traditional scheduling and planning applications place a heavy **manual database administration** tax on the user. When a human experiences high cognitive load, they struggle to estimate durations, select dates, triage priorities, or maintain structural discipline. This results in planning friction and eventual calendar drift. Furthermore, pure LLM-driven schedulers are probabilistic and unreliable: they hallucinate dates, overlap meetings, ignore math, and violate hard constraints. 

SomeoneOS solves these issues by:
- Ingesting raw, unformatted "brain dumps" (text streams) without forcing the user to fill out structured forms, tags, or dropdowns.
- Segregating **probabilistic extraction** (using LLMs) from **deterministic scheduling** (using pure functional TypeScript code).
- Protecting fixed schedule anchors (e.g., calendar meetings) while fluidly organizing actionable tasks around them.
- Adjusting schedule parameters dynamically based on learned behavior characteristics (e.g., adding buffers for procrastination tendencies).

### Main Idea
The core architecture is built around a **Hybrid Cognitive Pipeline**. It separates *linguistic parsing* from *scheduling logic*. The LLM reads natural language and parses it into linguistic primitive arrays. A pure TypeScript normalizer translates these arrays into unified domain concepts. Finally, a deterministic execution engine prioritizes and sequences the work using fixed algorithms, generating clear reasoning logs, assumptions, and warnings.

```
[Chaotic Stream of Consciousness]
              │
              ▼ (Linguistic Extraction via LLM API)
[Structured Text Entities (JSON Schema)]
              │
              ▼ (Domain Normalization Rules)
[Unified Planning Context (Actionable, Routines, Constraints)]
              │
              ▼ (Deterministic Sorting: Algorithm 8)
[Ordered Execution Schedule + Warnings & Assumptions]
```

### Current Completion Percentage
The project is currently at **45% - 50% overall completion**. 
* **Stage 1 (Core Pipeline & Engine)**: **100% Complete**. The linguistic parser, clarification engine, memory engine, domain normalizer, deterministic scheduler, and interactive workspace UI are fully functional in-memory.
* **Stage 2 (Firestore Persistence)**: **Planned / In Progress**.
* **Stage 3 (Calendar Integration)**: **Planned**.
* **Stage 4 (Autonomous Execution Proxies)**: **Planned (Long-Term)**.

---

## 2. Tech Stack

* **Frontend Framework**: [Next.js 15.0.0](file:///d:/Codes/Projects/someoneos/package.json#L19) (App Router, React 19 Client components).
* **Styling**: Tailwind CSS 3.4.14 with PostCSS and custom utility gradients.
* **Backend Runtime**: Next.js Serverless Route Handlers (Node.js runtime).
* **Database**: Firebase Firestore (planned for Stage 2). Currently runs on client-side state with `localStorage` cache for memory hydration.
* **Authentication**: Firebase Authentication v12.15.0 (Google OAuth Sign-in & client-side reactive state tracking).
* **AI Models**: Google Gemini 2.5 Flash (`gemini-2.5-flash`) initialized via the `@google/generative-ai` SDK.
* **Development Libraries**: 
  - `@google/generative-ai` (v0.24.1)
  - `firebase` (v12.15.0)
  - `lucide-react` (v0.453.0) for icon assets
  - `class-variance-authority`, `clsx`, `tailwind-merge`, and `tailwindcss-animate` for dynamic Tailwind layout styling.
* **Google Technologies in Use**: 
  - Google Gemini Developer API
  - Google Firebase Auth & Google Identity Provider
  - Firebase Firestore (planned)
  - Google Calendar API OAuth tokens (planned)

---

## 3. Folder Structure

Below is the complete directory topology of the SomeoneOS workspace:

```
someoneos/
├── .env.example              # Template file for local environment variables
├── .env.local                # Local environment secrets (Git-ignored)
├── .eslintrc.json            # ESLint static analysis configuration
├── .gitignore                # File exclusion specifications for Git
├── .prettierrc               # Prettier code formatting rules
├── components.json           # UI components initialization settings (shadcn UI)
├── next.config.ts            # Next.js custom build configurations
├── postcss.config.mjs        # PostCSS configurations for Tailwind
├── package.json              # Package metadata, dependencies, and script declarations
├── tailwind.config.ts        # Tailwind CSS design system utility declarations
├── tsconfig.json             # TypeScript compiler rules
├── app/                      # Next.js App Router routing infrastructure
│   ├── globals.css           # Global CSS variables, custom typography, grid patterns
│   ├── layout.tsx            # Main HTML wrapper mounting Auth and HTML containers
│   ├── page.tsx              # Public-facing minimalist landing & sign-in page
│   ├── api/                  # Next.js Server API endpoints
│   │   └── extract/          # Ingestion route
│   │       └── route.ts      # POST controller communicating with Gemini 2.5 Flash
│   └── dashboard/            # Protected client workspace route
│       └── page.tsx          # Workspace index verifying authentication state
├── components/               # React UI components suite
│   ├── DemoSignInButton.tsx  # Interactive button initializing mock judge user state
│   ├── GoogleSignInButton.tsx# Firebase client Google Auth control
│   ├── UserProfile.tsx       # Avatar panel handling user information and logout trigger
│   ├── ui/                   # Generic atomic UI components
│   │   └── button.tsx        # Tailored design-system button component
│   └── workspace/            # Domain-specific workspace dashboard components
│       ├── AiUnderstandingView.tsx # Displays visual cards of Gemini's extracted primitives
│       ├── BrainDumpInput.tsx      # Large text capture panel for thoughts
│       ├── ClarificationPanel.tsx  # Dynamic interviewer prompt for missing values
│       ├── ExecutionPreview.tsx    # Plan preview tabs: Timeline, Simulator, Load, Decision Log
│       ├── ExecutionSidebar.tsx    # Engine state indicator lights and Load Gauge
│       ├── LatestBrainDump.tsx     # Display box of the current raw text capture
│       ├── MemorySidebar.tsx       # Category listing of agent's learned items
│       ├── TopNavigation.tsx       # Header navigation bar containing branding and profile
│       └── WorkspaceLayout.tsx     # Layout orchestrating pipeline execution state
├── docs/                     # System specifications, constitution, and roadmap docs
│   ├── AI_RULES.md           # Instructions for AI developer agents
│   ├── ARCHITECTURE.md       # [This File] System architecture and pipeline guide
│   ├── CHANGELOG_AI.md       # AI-generated commit changes tracker
│   ├── CONSTITUTION.md       # Engineering and design core guidelines
│   ├── CURRENT_STATE.md      # Summary of subsystem status and limitations
│   ├── DIRECTORY_GUIDE.md    # Detailed guide on repository paths and rules
│   ├── FOUNDER_BRIEF.md      # Synthesis of vision, architecture, and mental model
│   ├── HANDOFF.md            # Brief instruction list for consecutive developer agents
│   ├── PROJECT_VISION.md     # Vision specs and product objectives
│   ├── ROADMAP.md            # Sequential multi-stage development roadmap
│   └── specifications/       # Markdown specifications folder
├── hooks/                    # Custom React client hooks
│   └── useExtraction.ts      # Manages API call cycle to /api/extract, errors, and loading
├── lib/                      # Core logic engine files
│   ├── auth.ts               # React Auth Context wrapper managing Auth State
│   ├── clarification.ts      # Heuristic rules identifying missing planning constraints
│   ├── firebase.ts           # Firebase SDK client initialization
│   ├── gemini.ts             # Google Generative AI client instance constructor
│   ├── utils.ts              # Tailwind styles merging helper
│   ├── domain/               # Context translation models
│   │   ├── normalizer.ts     # Maps linguistic models to domain primitives
│   │   └── types.ts          # Primitives interfaces (ActionableItem, routines, etc.)
│   ├── evaluation/           # Test benchmarking suites
│   │   └── plannerEvaluation.ts # Script evaluating 52 deterministic schedule scenarios
│   ├── memory/               # Persistent traits engines
│   │   ├── memoryEngine.ts   # Extractor classifying statements into 7 categories
│   │   └── types/            # Types representing learned memory nodes
│   │       └── memory.ts     # MemoryItem schema definitions
│   ├── planner/              # Scheduling sorter engines
│   │   ├── planner.ts        # Scheduling engine executing Algorithm 8
│   │   ├── testPlanner.ts    # Independent planner test suite
│   │   └── types/            # Sorter schemas
│   │       └── planner.ts    # Tasks, warnings, and assumptions types
│   └── someoneos/            # Global coordinating engine
│       └── engine.ts         # runSomeoneOS coordinator linking memory, normalizer, and planner
├── prompts/                  # Prompt files
│   └── extraction.ts         # Strict system instruction text for Gemini 2.5 Flash
└── types/                    # Shared TypeScript interface declarations
    ├── clarification.ts      # ClarificationQuestion / ClarificationResult declarations
    ├── extraction.ts         # ExtractionResult and ExecutionState structures
    ├── index.ts              # Exporter registry
    └── understanding.ts      # Joint API response container type
```

---

## 4. Features Implemented

### 1. Zero-Friction Brain Dump Ingestion
* **Purpose**: Allows users to input unorganized thoughts without being forced to click fields, prioritize dropdowns, assign tags, or estimate durations manually.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 2. Linguistic Extraction API
* **Purpose**: Invokes the `gemini-2.5-flash` model with schema enforcement to extract entities (events, deadlines, goals, constraints, priorities, emotional signals, missing information) in a structured JSON payload.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 3. Heuristic Clarification Engine
* **Purpose**: Scans extracted items with regex rules to see if key parameters are missing (e.g., an event title containing "interview" but missing a date, or an executable goal missing duration). Generates up to 3 highly targeted questions with reasons.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 4. Deterministic Memory Engine
* **Purpose**: Automatically identifies and categorizes personal constraints, habits, routines, physical health factors, and behavior traits from text statements. It splits compound sentences, runs them through 7 category sub-extractors, and hashes the contents to deduplicate data.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 5. Domain Normalization Layer
* **Purpose**: Maps raw extracted linguistic arrays and long-term user memories into mutually exclusive domain primitives. Resolves duplicate statements via word cleaning, filters, and similarity checks.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 6. Sorter Engine (Algorithm 8)
* **Purpose**: Implements pure, deterministic scheduling calculations. Applies procrastination buffers (+20% task duration), filters fixed event anchors from work items, and sorts execution queues based on structured properties.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 7. Cognitive Load Index Calculator
* **Purpose**: Computes a real-time index of the user's workload (0-100 score) based on the quantity of tasks, count of high-priority nodes, unexecutable goals, health factors, and behavior traits.
* **Status**: **100% Operational**
* **Completed Percentage**: **100%**

### 8. Future Simulator Console
* **Purpose**: Runs a simulated timeline projection across a 5-day cycle to flag potential risk collisions (e.g., task overload, physical back fatigue, deadline overlaps) and allows the user to trigger dynamic "Auto-Repair" schedules.
* **Status**: **100% Operational (Interactive Simulation Loop)**
* **Completed Percentage**: **100%**

---

## 5. User Flow

```
[Google/Demo Sign-In] ─► [Frictionless Text Ingest] ─► [Clarification Dialog]
                                                               │
                                                               ▼
[Execution Sorter UI] ◄─ [Domain Normalization] ◄─ [Memory Engine Extraction]
```

### 1. Access & Sign-In
A user visits the application. If unauthenticated, the public home landing screen is shown. The user chooses **Google Authentication** or bypasses via **Demo Sign-in** (initializing a mock user identity: `judge@someoneos.ai`).

### 2. Stream-of-Consciousness Input
The authenticated user enters a chaotic, multi-line paragraph describing their thoughts:
> *"I have a Meta interview next Wednesday, but my back hurts so much and I hate early meetings. Need to review graph problems. Also need to buy groceries today."*

### 3. Structural Triage and Ingestion API
The client hook triggers `POST /api/extract` with the text payload. The Gemini model parses it into a strict JSON payload mapping events, deadlines, and emotional signals.

### 4. Interactive Interview Loop (Clarification)
The clarification engine detects that `Meta interview` is an event, but Wednesday lacks a designated time slot. The UI halts automated planning and prompts:
- *"When is your interview?"* (Reason: *Interview timing is required to allocate space on your schedule.*)
The user enters *"2:00 PM"* and clicks **Continue Planning**.

### 5. Memory Trait Capture
The Orchestrator processes the input text and clarification answers through the memory engine. 
- `"my back hurts so much"` triggers a **Health** factor: *"Chronic back stiffness"*.
- `"i hate early meetings"` triggers a **System Preference**: *"Avoid tasks during early morning hours"*.
The items are saved to the local memory bank.

### 6. Domain Mapping & Planning Context
The Domain Normalizer maps statements into mutually exclusive primitives. The interview is mapped to an `EventAnchor`. `"Buy groceries today"` becomes an `ActionableItem` with High priority (due to the "today" deadline). `"Review graph problems"` becomes a work task with Medium priority and an estimated duration of 120 minutes (computed from the `ESTIMATION_TABLE` keywords `graph`/`problems`/`review`).

### 7. Execution Order Generation
The planner applies Algorithm 8 sorting parameters:
- It checks behavior factor history. Since a procrastination memory exists, it scales the 120-minute review task by **1.2x (144 minutes)**.
- It inserts fixed event anchors and creates assumptions explaining the buffers.
- It calculates the final sorted list of tasks: 
  1. `Buy groceries` (high priority / explicit deadline first).
  2. `Review graph problems` (no explicit deadline, sorted second).

### 8. Focus Dashboard Visualization
The final list is loaded in the dashboard workspace:
- The **Timeline** displays drop-school routines at 8:00 AM, stretches at 1:00 PM, and the Meta interview fixed block at 2:00 PM.
- The **Cognitive Load Gauge** flags the fatigue level.
- The **Decision Log** shows details of all applied buffers.
- The **Future Simulator** lets users project and repair conflicts.

---

## 6. AI Architecture

SomeoneOS operates on a strict **Hybrid Cognitive Pipeline**:

```
                  ┌──────────────────────────────┐
                  │   Probabilistic Ingestion    │
                  │   - Gemini 2.5 Flash API     │
                  │   - Structured JSON Schema   │
                  └──────────────┬───────────────┘
                                 │
                                 ▼ (JSON Extraction Result)
                  ┌──────────────────────────────┐
                  │   Heuristic Clarification    │
                  │   - Rules-Based Questions    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼ (Answers + Extraction)
                  ┌──────────────────────────────┐
                  │  Deterministic Engines Core  │
                  │  - Memory extraction Engine  │
                  │  - Domain Normalizer Layer   │
                  │  - Algorithm 8 Sorter        │
                  └──────────────────────────────┘
```

### Where AI is Used
AI is **strictly restricted** to the ingestion phase. It is used as a natural language parser to translate messy streams of consciousness into key-value JSON arrays. AI is **never** permitted to calculate schedule order, execute sort math, determine task durations, or manipulate planning times. This prevents the scheduling engine from experiencing hallucinations.

### Prompts
The core prompt is exported in [`prompts/extraction.ts`](file:///d:/Codes/Projects/someoneos/prompts/extraction.ts). It enforces structural output:
* System instructions dictate that the model act solely as a text extractor.
* The response must be a valid, raw JSON object matches this format:
  ```json
  {
    "events": ["string"],
    "deadlines": ["string"],
    "goals": ["string"],
    "constraints": ["string"],
    "priorities": ["string"],
    "emotionalSignals": ["string"],
    "missingInformation": ["string"]
  }
  ```
* Instructions forbid markdown fencing (no ` ```json ` blocks).

### Memory
Memory is processed in [`lib/memory/memoryEngine.ts`](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts):
- Text is normalized (lower-cased, whitespace removed).
- The text is split into statements using sentence delimiters, `and`, and `but`.
- Statements are checked against 7 sub-extractors:
  1. `routine`: Scans for frequencies like `"every morning"`, `"daily"`.
  2. `preference`: Scans for phrases like `"i hate"`, `"i prefer"`.
  3. `project`: Identifies building side projects.
  4. `goal`: Scans for targets like `"i want to"`, `"my goal is"`.
  5. `relationship`: Finds contacts like `"my mom"`, `"my manager"`.
  6. `health`: Scans for physical constraints like `"back pain"`, `"migraine"`.
  7. `behavior`: Detects cognitive traits like `"procrastinate"`, `"forget"`.
- Hashing: Memory IDs are generated deterministically using `djb2Hash`:
  ```typescript
  function djb2Hash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }
  ```
  The hash target is `${category}:${normalizedValue}`, preventing duplicate traits.

### Planning
The planner operates in [`lib/planner/planner.ts`](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts). It consumes `PlanningContext` and applies the following rule sequence:
1. Loops through `behaviorFactors`. If a procrastination trait exists, it triggers a time-scaling flag and registers a planning assumption log.
2. Registers routines as structural assumptions.
3. Classifies events as fixed time constraints (not task items).
4. Flags high-level goals as warnings to request task breakdown.
5. Performs sorting (Algorithm 8) on actionable tasks.

### Reasoning
Every scheduler state modification logs its reasoning:
- `PlanAssumption`: Documents system inferences (e.g. task scaling, default estimates, routines).
- `PlanWarning`: Documents planning risks (e.g. abstract goals lacking tasks).
These are rendered transparently in the **Decision Log** on the user interface.

### Agents
Workflows in Stage 4 include **autonomous execution agents**. Tasks containing metadata (like `"Draft cofounder report"`) will integrate with tool proxies to draft Slack messages, emails, or code commits.

### Workflows
The global synchronizer in [`lib/someoneos/engine.ts`](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts) orchestrates:
1. `extractMemory`: Extracts traits from the current raw input.
2. Merges current memories with historic values, retaining the highest confidence score.
3. `buildPlanningContext`: Integrates understanding, merged memories, and clarification answers.
4. `createPlan`: Computes sorted tasks, assumptions, and warnings.

### Tools
The UI cockpit serves as the diagnostic tool, providing access to the database states, linguistic parsing JSON arrays, and the sorting reasoning engine.

---

## 7. Database Schema

SomeoneOS currently runs in-memory with client state cached in `localStorage`. Below is the data model used for the in-memory engine, along with the planned schema for the Stage 2 Firebase Firestore persistence:

### Active Client-Side Cache Data Structures (`localStorage`)

#### `someoneos_memories` (Array of objects)
Matches the `MemoryItem` interface:
```typescript
interface MemoryItem {
  id: string;          // Format: mem_[category]_[djb2Hash]
  category: "routine" | "preference" | "project" | "goal" | "relationship" | "health" | "behavior";
  value: string;       // Normalized text representation
  confidence: number;  // Confidence rating (0.0 to 1.0)
  reason: string;      // Ingestion trigger detail description
}
```

### Planned Firestore Database Topology (Stage 2)

#### 1. `users` collection (Document ID: `userId`)
Tracks general user metrics and settings.
* `uid`: `string` (Matches Firebase Auth user ID)
* `displayName`: `string | null`
* `email`: `string`
* `photoURL`: `string | null`
* `createdAt`: `timestamp`
* `lastSignInAt`: `timestamp`

#### 2. `users/{userId}/memories` collection (Document ID: `memoryId`)
Holds the persistent user memories.
* `id`: `string` (System unique identifier matching `mem_[category]_[hash]`)
* `category`: `string`
* `value`: `string`
* `confidence`: `number`
* `reason`: `string`
* `createdAt`: `timestamp`
* `updatedAt`: `timestamp`

#### 3. `users/{userId}/plans` collection (Document ID: `planId`)
Maintains past planning snapshots.
* `planId`: `string`
* `timestamp`: `timestamp`
* `executionOrder`: `string[]` (Ordered list of task IDs)
* `tasks`: Array of Map:
  - `id`: `string`
  - `title`: `string`
  - `priority`: `string`
  - `estimatedMinutes`: `number`
  - `dependsOn`: `string[]`
  - `deadline`: `string | null`
  - `category`: `string`
  - `reason`: `string`
* `warnings`: Array of Map:
  - `id`: `string`
  - `target`: `string`
  - `message`: `string`
* `assumptions`: Array of Map:
  - `id`: `string`
  - `target`: `string`
  - `message`: `string`
* `unplannedItems`: Array of Map:
  - `id`: `string`
  - `title`: `string`
  - `reason`: `string`

#### 4. `users/{userId}/ingestions` collection (Document ID: `ingestionId`)
Audit log of raw user dumps.
* `ingestionId`: `string`
* `rawText`: `string`
* `clarificationAnswers`: `map` (Keys match question IDs)
* `timestamp`: `timestamp`

---

## 8. APIs

SomeoneOS currently exposes Next.js Route Handler endpoints:

### 1. Brain Dump Processing Endpoint (`/api/extract`)
* **Method**: `POST`
* **Content-Type**: `application/json`
* **Request Headers**: None
* **Request Body**:
  ```json
  {
    "text": "The raw brain dump message typed by the user"
  }
  ```
* **Success Response Code**: `200 OK`
* **Success Response Body**:
  ```json
  {
    "extraction": {
      "events": ["list of parsed strings representing meetings/appointments"],
      "deadlines": ["list of parsed deadlines"],
      "goals": ["list of parsed future/abstract aspirations"],
      "constraints": ["list of parsed scheduling constraints"],
      "priorities": ["list of parsed priority statements"],
      "emotionalSignals": ["list of parsed feelings/sentiments"],
      "missingInformation": ["list of parsed items lacking details"]
    },
    "clarification": {
      "requiresClarification": true,
      "questions": [
        {
          "id": "question-identifier-string",
          "question": "The question to present to the user",
          "reason": "The reason explaining why this value is needed"
        }
      ]
    }
  }
  ```
* **Client Error Response Code**: `400 Bad Request`
  - Triggered if `text` is empty, missing, or not a string.
  - Body: `{ "error": "Brain dump text is required." }`
* **Server Error Response Code**: `500 Internal Server Error`
  - Triggered if the Gemini API Key is missing or if the API call fails.
  - Body: `{ "error": "Failed to analyze brain dump with Gemini." }`

### Planned / Upcoming APIs (Stage 3 & 4)
* `POST /api/calendar/sync`: Synchronizes fixed events with external providers.
* `POST /api/execution/trigger`: Executes task-level automation workflows.

---

## 9. Components

The application is structured into the following React components:

### Parent & Layout Components
* **[`WorkspaceLayout.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/WorkspaceLayout.tsx)**:
  Manages the primary application state: input text, parser outputs, memories, and execution results. It handles client local storage sync and computes the cognitive load index.
* **[`TopNavigation.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/TopNavigation.tsx)**:
  Maintains the global header. Displays branding, the current preview release badge, and the user profile profile card.

### Ingestion & Analysis Panels
* **[`BrainDumpInput.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/BrainDumpInput.tsx)**:
  Provides the text input interface where users enter raw, unorganized thoughts. Displays dynamic placeholders and handles submission states.
* **[`LatestBrainDump.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/LatestBrainDump.tsx)**:
  A clean preview panel showing the user's most recent brain dump entry.
* **[`AiUnderstandingView.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/AiUnderstandingView.tsx)**:
  Displays the raw JSON output from the Gemini extraction API in styled status cards (Events, Deadlines, Goals, Priorities, Constraints, Emotional Signals, Missing Info).
* **[`ClarificationPanel.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/ClarificationPanel.tsx)**:
  An interactive interface that displays clarification questions. It prompts for responses and passes inputs to the scheduling engine.

### Visual Preview & Dashboard Console
* **[`ExecutionPreview.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx)**:
  The centerpiece of the workspace, structured around four interactive tabs:
  1. *Reasoning Timeline*: A visual layout mapping task items and fixed event anchors chronologically.
  2. *Future Simulator*: A 5-day workflow simulator that models schedule collisions and runs a task-repair script.
  3. *Cognitive Load*: A detail panel analyzing user fatigue risk indicators.
  4. *Decision Log*: A table displaying scheduling assumptions and warnings.

### Sidebar Monitors
* **[`MemorySidebar.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/MemorySidebar.tsx)**:
  Displays the user's persistent profile categories (Routines, System Preferences, Physical Health Factors, Behavioral Profiles, Long-term Goals).
* **[`ExecutionSidebar.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionSidebar.tsx)**:
  The workspace dashboard monitor. Displays the cognitive load index progress bar, current system operational mode (Normal vs Recovery Mode), status indicators, and total risk count.

---

## 10. Current Limitations

* **State Volatility**: The system operates entirely in-memory. Refreshing the browser clears all accumulated memory structures and schedule results.
* **Static Estimation baselines**: Task duration relies on simple keyword matching (e.g., matching "study" to 120 minutes) rather than historical completion data.
* **Procrastination buffers**: The scheduler applies a static +20% duration buffer for procrastination behavior memories, regardless of the task type.
* **Basic Dependency checking**: Task dependency logic is simple: it checks titles for transition keywords like "after" or "then" and searches for preceding tasks.
* **Single-Threaded Agenda**: The scheduler assumes a single-threaded queue. It does not calculate parallel paths, resource allocation, or multiple calendars.
* **Simple Deduplication**: Similarity matching filters out duplicate text using basic string cleaning and word comparisons rather than vector embeddings.

---

## 11. Future Ideas

* **Multi-Device Sync (Stage 2)**: Storing user profiles and memory states in Firebase Firestore.
* **Google Calendar Integration (Stage 3)**: Syncing schedule blocks directly with Google Calendar slots as focus blocks, avoiding calendar overlaps.
* **Autonomous Task Actions (Stage 4)**: Integrating tool proxies (GitHub API, Slack API, Gmail API) to draft responses, submit PRs, and process emails.
* **Voice-First Ingestion (Stage 5)**: Ingesting audio files and using voice extraction models.
* **Machine Learning Buffers**: Tracking task execution history to adjust duration estimates based on actual performance.
* **Semantic Vector Deduplication**: Implementing vector similarity search to recognize duplicate tasks written differently.

---

## 12. Screens

### 1. Landing & Authentication Screen (`/`)
* **Visual Styling**: Slate typography, subtle mesh grid layout, minimal header.
* **Interactions**:
  - *Sign in with Google*: Client authentication popup.
  - *Demo Account / Sign-In*: A mock login button for testing.
  - *Interactive Cards*: Three informational cards explaining features.

### 2. Protected Workspace Dashboard Screen (`/dashboard`)
* **Visual Layout**: Three-column dashboard:
  - *Left Column (Learned Context)*: Displays the memory bank sidebar. Shows routines, preferences, health flags, and goals. Contains a button to clear local storage.
  - *Center Column (Interactive Workspace)*:
    - Thought capture input box.
    - Active brain dump text card.
    - AI parsed cards visualization grid.
    - Clarification input form (when active).
    - Cognitive Action Preview Console (Timeline, Simulator, Load, Decision Log tabs).
  - *Right Column (Cognition Monitor)*: Displays operational modes (Normal vs. Recovery), cognitive load meter, engine status badges, and risk counts.

---

## 13. Authentication

### Auth Architecture
Authentication uses **Firebase Authentication v12** to manage client sessions:
- The [`AuthProvider`](file:///d:/Codes/Projects/someoneos/lib/auth.ts#L46) context wrapper tracks session status using `onAuthStateChanged`.
- Redirect middleware in `dashboard/page.tsx` checks credentials and redirects unauthenticated users to `/`.

### Demo Login (Hackathon Judge Mode)
To simplify testing, the system provides a mock login method:
- The [signInMockUser](file:///d:/Codes/Projects/someoneos/lib/auth.ts#L50) function signs in a dummy user: `judge@someoneos.ai`.
- This mock session pre-populates local storage with mock memories (routines, preference, health flags, behavior buffers) to demonstrate the scheduler's behavior.

---

## 14. Calendar Integration

### Current Status
* **In-Memory Mocking**: Fixed events parsed from raw text are processed as constraint anchors. The timeline displays these events alongside actionable tasks.

### Planned Sync Logic (Stage 3)
1. **OAuth Verification**: Connects user accounts via OAuth scopes.
2. **Double-Ended Sync**:
   - *Import*: Retrieves calendar slots to block out busy times.
   - *Export*: Pushes generated tasks to Google Calendar as focus blocks.
3. **Collision Management**: Re-runs the scheduler if calendar items conflict, resolving conflicts via Algorithm 8.

---

## 15. Notifications

### Current Status
* **Mock Hooks**: API structures in the orchestrator feature stub hooks for notifications.

### Planned Notifications System (Stage 6)
* **Status Updates**: Prompt users when tasks run past their duration estimates.
* **Conflict Alerts**: Send browser alerts if calendar updates create conflicts.
* **Cognitive Recovery Warnings**: Notify users when cognitive load score exceeds 70%, suggesting breaks or task rescheduling.

---

## 16. Agent Capabilities

SomeoneOS operates as an interactive planner and assistant:
- **Linguistic Entity Extraction**: Extracts structure from raw text using LLMs.
- **Dynamic Duration Buffering**: Automatically applies a 1.2x time buffer to tasks when procrastination behavior patterns are detected.
- **Routines Analysis**: Recognizes routines (e.g. "morning gym") and blocks out calendar times.
- **Recovery Mode Routing**: Automatically switches the workspace to recovery mode when health flags (e.g. "back pain") and high cognitive load are detected, adding stretch breaks and postponing tasks.
- **Conflict Resolution Simulation**: Simulates scheduling risks and resolves conflicts using Algorithm 8.

---

## 17. Deployment

1. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add key configurations:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=someone-os.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=someone-os
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=someone-os.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
   NEXT_PUBLIC_FIREBASE_APP_ID=1:9876:web:abcd
   GEMINI_API_KEY=AIzaSyGeminiKeyHere
   ```
2. **Production Build**:
   ```bash
   npm run build
   ```
   Next.js compiles page structures and builds API controllers.
3. **Vercel / Hosting Provider Deployment**:
   Link the repository to Vercel, set the environment variables, and deploy.

---

## 18. Demo Script

This walk-through script demonstrates the hybrid cognitive scheduling capabilities of the app:

### Step 1: Sign-In
1. Navigate to the landing page `/`.
2. Click **Demo Account / Sign-In**.
3. Verify that you are logged in as "Hackathon Judge" and redirected to `/dashboard`.
4. Confirm that the sidebar displays pre-seeded memories (drop kids routine, hate early meetings preference, lower back stiffness, procrastination buffer).

### Step 2: Thought Capture
1. Enter the following brain dump in the input box:
   > *"I have a Meta interview next Wednesday, but my back hurts so much and I hate early meetings. Need to review graph problems. Also need to buy groceries today."*
2. Click **Build My Week**.

### Step 3: Clarification
1. The **Clarification Panel** will appear on the dashboard.
2. Verify that it asks: *"When is your interview?"* with the reason: *"Interview timing is required to allocate space on your schedule."*
3. Enter *"2:00 PM"* in the input field and click **Continue Planning**.

### Step 4: Reviewing Sorter Output
1. Under **Linguistic Parser**, inspect the parsed entities.
2. In the **Reasoning Timeline**, verify the schedule order:
   - Routine block at 8:00 AM (Kids drop-off constraint).
   - "Buy groceries" task (High priority, deadline today).
   - "Review graph problems" task (Scaled to 144 minutes due to the procrastination buffer).
   - Physical Break block at 1:00 PM (Injected stretch break due to back pain health flag).
   - Meta Interview fixed event at 2:00 PM.
3. Under **Decision Log**, check the scheduling assumptions, including the +20% procrastination buffer.

### Step 5: Simulating Conflicts
1. Open the **Future Simulator** tab.
2. Click **Run Simulation**.
3. Wait for Day 3 to trigger a schedule collision alert.
4. Click **Auto-Repair Schedule** and verify that conflicts are resolved.

---

## 19. Important Code Files

| Code File | Absolute Path | Description |
| :--- | :--- | :--- |
| **Extraction Prompt** | [`prompts/extraction.ts`](file:///d:/Codes/Projects/someoneos/prompts/extraction.ts) | System prompt templates specifying JSON schemas for Gemini 2.5 Flash. |
| **Extraction Endpoint** | [`app/api/extract/route.ts`](file:///d:/Codes/Projects/someoneos/app/api/extract/route.ts) | API route handling text extraction and invoking the Clarification engine. |
| **Clarification Heuristics** | [`lib/clarification.ts`](file:///d:/Codes/Projects/someoneos/lib/clarification.ts) | Identifies missing values (dates, times, estimates) using heuristic rules. |
| **Memory Engine** | [`lib/memory/memoryEngine.ts`](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts) | Classifies text statements into 7 memory categories. |
| **Domain Normalizer** | [`lib/domain/normalizer.ts`](file:///d:/Codes/Projects/someoneos/lib/domain/normalizer.ts) | Translates raw extractions and memories into unified domain primitives. |
| **Scheduling Engine** | [`lib/planner/planner.ts`](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts) | Implements Algorithm 8 sorting rules and manages task list constraints. |
| **OS Orchestrator** | [`lib/someoneos/engine.ts`](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts) | Orchestrates the extraction, normalization, and scheduling pipeline. |
| **Auth Provider** | [`lib/auth.ts`](file:///d:/Codes/Projects/someoneos/lib/auth.ts) | Manages Firebase Auth context and handles mock login credentials. |
| **Workspace Layout** | [`components/workspace/WorkspaceLayout.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/WorkspaceLayout.tsx) | Root workspace component managing state and local storage sync. |
| **Execution Preview** | [`components/workspace/ExecutionPreview.tsx`](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx) | Renders the timeline view, future simulator console, and decision logs. |

---

## 20. What Makes This Project Unique

* **AI Parsing, Code Scheduling**: Segregates probabilistic text processing from deterministic scheduling, guaranteeing a reliable calendar state.
* **Implicit Memory Extraction**: Automatically learns habits, preferences, health constraints, and behaviors from text dumps.
* **Cognitive Load Indexing**: Monitors task volumes, urgency, and user traits to compute a real-time fatigue score.
* **Proactive Recovery Scheduling**: Automatically adjusts plans to insert breaks and stretch routines when high cognitive load and physical health flags are detected.
* **Interactive Future Simulation**: Allows users to simulate, test, and repair schedule conflicts across a multi-day window.
