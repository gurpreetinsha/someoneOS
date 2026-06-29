# PROJECT_VISION.md — SomeoneOS Technical Vision & Product Philosophy

## 1. Why SomeoneOS Exists
Human cognition is inherently non-linear, unpredictable, and prone to overwhelm. When individuals experience high cognitive load, executive function deteriorates. Traditional task management tools (e.g., Todoist, Jira, Linear) force users to act as their own database administrators—demanding manual categorization, tagging, date-picking, and priority assignment at the exact moment when their mental bandwidth is at its lowest.

**SomeoneOS** exists to fundamentally eliminate this friction. It acts as an intelligent executive assistant operating between human stream-of-consciousness input and structured execution. By capturing raw, unfiltered "brain dumps" and passing them through a deterministic cognitive pipeline, SomeoneOS translates chaotic intent into actionable, prioritized, and contextual work schedules without demanding cognitive overhead from the user.

---

## 2. Problems It Solves
1. **The Cold-Start Friction of Planning**: Eliminates the mental tax of converting thoughts like *"I need to fix the auth bug before tomorrow and also buy groceries, but I hate morning meetings"* into structured tasks.
2. **Cognitive Overload & Overwhelm**: Captures freeform text and automatically segregates fixed schedule commitments (events) from executable work tasks and abstract aspirational goals.
3. **Loss of Context & Behavioral Drift**: Remembers user preferences, behavioral tendencies (e.g., procrastination buffers), routines, and health factors across sessions to build realistic execution plans.
4. **LLM Hallucination in Task Scheduling**: Solves the unreliability of LLM-generated schedules by strictly bounding LLMs to unstructured extraction while delegating task prioritization, dependency resolution, and timing estimations to pure deterministic TypeScript engines.

---

## 3. Target Users
- **Knowledge Workers & Software Engineers**: Professionals juggling multi-threaded tasks, asynchronous communication, technical debt, and tight deadlines.
- **Individuals with Executive Dysfunction or ADHD**: Users who struggle with task decomposition, time estimation, and maintaining structured schedules without active assistance.
- **High-Output Creators**: People who generate massive volumes of ideas and raw notes and require automated triage into concrete daily agendas.

---

## 4. Product Philosophy
- **Zero-Friction Ingestion**: Ingestion must accept dirty, unformatted, multi-domain text. The user should never be asked to fill out form fields for a task title, priority, or tag during initial capture.
- **Strict Separation of Extraction & Logic**: Machine learning models (LLMs) are used strictly for linguistic extraction and understanding. All business logic, scheduling heuristics, state changes, and memory rules MUST remain 100% deterministic code.
- **Respect for Fixed Anchors**: Events (e.g., "doctor appointment at 3 PM") are non-negotiable time anchors, whereas tasks are fluid units of work that adapt around anchors.
- **Radical Transparency**: The system explicitly exposes its assumptions and warnings (e.g., why a task was delayed, why a buffer was added) rather than acting as a black box.

---

## 5. Long-Term Vision
SomeoneOS aims to become the autonomous personal operating system. Beyond generating static daily execution plans, future iterations will interface directly with calendars (Google Calendar/Outlook), external tools (GitHub, Slack, Email), autonomous background execution agents, and proactive contextual notifications—transforming SomeoneOS from a passive planner into an active execution proxy.

---

## 6. Non-Goals
- **Not a Generic Chatbot**: SomeoneOS is not a conversational companion for open-ended chatting. Every interaction serves to refine state, update context, or output actionable plans.
- **Not a Manual CRUD Project Management Tool**: SomeoneOS will not build complex kanban boards or multi-level project trees requiring manual user dragging and dropping.
- **Not a Hallucinating AI Scheduler**: SomeoneOS will never allow an LLM to directly output a finalized daily schedule timeline without deterministic algorithmic validation and constraint enforcement.
