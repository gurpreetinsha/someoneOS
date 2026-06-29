# Technical Specification: Workspace UI Subsystem

## 1. Purpose
The Workspace UI Subsystem comprises the complete interactive client interface for SomeoneOS. Built with React and Next.js App Router, it manages user input streams, triggers extraction APIs, displays clarification dialogs, visualizes learned memory sidebars, and renders execution plan schedules.

---

## 2. Responsibilities
- Renders responsive workspace grid layouts (`WorkspaceLayout.tsx`, `TopNavigation.tsx`).
- Captures raw freeform user brain dump text (`BrainDumpInput.tsx`).
- Coordinates asynchronous extraction lifecycle via custom hook (`useExtraction.ts`).
- Renders linguistic understanding breakdowns (`AiUnderstandingView.tsx`, `LatestBrainDump.tsx`).
- Manages interactive clarification input forms (`ClarificationPanel.tsx`).
- Displays categorized user memory sidebar (`MemorySidebar.tsx`).
- Renders execution plan preview cards with sorting badges, assumptions, and warnings (`ExecutionPreview.tsx`, `ExecutionSidebar.tsx`).

---

## 3. Inputs & Outputs
- **Inputs**: User keyboard text entry and button clicks.
- **Outputs**: Rendered HTML DOM elements, reactive state updates, and trigger calls to `runSomeoneOS` and `/api/extract`.

---

## 4. Dependencies
- Next.js App Router (`app/page.tsx`, `app/dashboard/page.tsx`).
- Tailwind CSS, Lucide React icons, Radix UI primitives.
- Domain engines (`lib/someoneos/engine.ts`).
- Auth context (`lib/auth.ts`).

---

## 5. Public Interfaces & Component Suite
Location: [components/workspace/](file:///d:/Codes/Projects/someoneos/components/workspace)
- `WorkspaceLayout.tsx`: Top-level flex container managing active state across subcomponents.
- `BrainDumpInput.tsx`: Textarea input capturing brain dumps.
- `AiUnderstandingView.tsx`: Tabbed card visualizing extracted events, goals, deadlines, and emotional signals.
- `ClarificationPanel.tsx`: Interactive form rendering generated questions and collecting user answers.
- `MemorySidebar.tsx`: Collapsible sidebar displaying extracted memories by category badge.
- `ExecutionPreview.tsx`: Execution schedule view rendering tasks, execution order, warnings, and assumptions.

---

## 6. Internal Component State Flow

```mermaid
flowchart TD
    A[BrainDumpInput] -->|Submit Text| B[useExtraction API Hook]
    B -->|POST /api/extract| C[Extraction API Endpoint]
    C -->> B[Return Extraction & Clarifications]
    
    B --> D{requiresClarification?}
    D -->|Yes| E[Render ClarificationPanel]
    E -->|User submits answers| F[Call runSomeoneOS with answers]
    D -->|No| F
    
    F --> G[Update WorkspaceLayout active state]
    G --> H[Render AiUnderstandingView]
    G --> I[Render MemorySidebar]
    G --> J[Render ExecutionPreview & ExecutionSidebar]
```

---

## 7. Future Extension Points
- **Interactive Drag-and-Drop Task Reordering**: Allow users to manually override execution orders, generating custom priority feedback for the domain engine.
- **Dark/Light Theme Toggle**: Full design system customization using Tailwind CSS CSS variables.

---

## 8. Known Limitations
- State is held in React client component state (`useState` in `WorkspaceLayout.tsx`); refreshing the page resets active workspace view state unless persisted.

---

## 9. Testing Strategy
- **React Testing Library Unit Tests**: Test component rendering, form submit events, loading state spinners, and disabled button states across workspace panels.
