# SomeoneOS Hackathon Master Plan: The AI Productivity Companion

> [!IMPORTANT]
> This master plan pivots SomeoneOS from a technical scheduling utility into a high-empathy, high-impact **AI Productivity Companion**. The strategy is mathematically optimized to maximize our score under the hackathon evaluation criteria.

---

## Part 1: The Product Vision

### "SomeoneOS is the first self-healing calendar that schedules around your biological energy, automatically defragmenting cognitive load and shifting tasks when you hit physical or mental fatigue."

**Why this is different (The Judge Hook):**
Traditional productivity apps tax the user by requiring manual database management. General LLM planners hallucinate calendar schedules. SomeoneOS bridges this gap: it extracts unstructured thoughts and behavioral patterns using Google Gemini, combines them with long-term memory, and uses a deterministic scheduling engine to physically protect the user's focus, energy, and well-being.

---

## Part 2: 15 Unique AI Features

Here are 15 features designed to feel magical, maximize points under the hackathon criteria, and reuse the existing hybrid cognitive pipeline.

### 1. Recovery Mode Visual Morph & Breath Guide
- **Description**: When Cognitive Load exceeds 70%, the dashboard transitions from energetic purple to cooling emerald-green. The sidebar renders a breathing visualizer (pulsing canvas) prompting a 60-second recovery.
- **Estimated Time**: 1.5 hours
- **Difficulty**: Easy
- **Judge Wow Factor**: 9.0/10
- **Evaluation Criteria Improved**: UX (10), Problem Solving (20)
- **Files to Edit**: [WorkspaceLayout.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/WorkspaceLayout.tsx), [ExecutionSidebar.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionSidebar.tsx), [globals.css](file:///d:/Codes/Projects/someoneos/app/globals.css)

### 2. Cognitive Load "Defrag" Engine
- **Description**: A one-click defragmenter that merges scattered micro-tasks into batch blocks (e.g., "Email Batch"), shifts low-priority tasks past tomorrow, and lowers the Cognitive Load index visually on-screen.
- **Estimated Time**: 1.5 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Innovation (20), UX (10)
- **Files to Edit**: [planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts), [ExecutionSidebar.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionSidebar.tsx)

### 3. Context-Swapping "Warm-Up" Generator
- **Description**: When transitioning between distinct projects, the app triggers a 60-second interactive modal summary (retrieved from memory/past plans) to reset focus and decrease context-switching friction.
- **Estimated Time**: 1.5 hours
- **Difficulty**: Easy
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: UX (10), Innovation (20), Problem Solving (20)
- **Files to Edit**: [ExecutionPreview.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx), [engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts)

### 4. Self-Healing Google Calendar Sync
- **Description**: Bidirectional Google Calendar sync. If an external calendar event clashes with planned focus blocks, the app auto-recomputes, schedules breaks, and updates the UI live with glowing transition states.
- **Estimated Time**: 3.0 hours
- **Difficulty**: Hard
- **Judge Wow Factor**: 9.5/10
- **Evaluation Criteria Improved**: Google Tech (15), Agentic Depth (20), Completeness (5)
- **Files to Edit**: [api/calendar/sync/route.ts](file:///d:/Codes/Projects/someoneos/app/api/calendar/sync/route.ts) [NEW], [engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts), [WorkspaceLayout.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/WorkspaceLayout.tsx)

### 5. Gemini Developer Context Caching
- **Description**: Caches historical user memories and past execution schedules on the Gemini API. Reduces response latencies for messy brain dumps from ~4s to <1s, saving token count and cost.
- **Estimated Time**: 1.5 hours
- **Difficulty**: Easy
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Technical (10), Google Tech (15)
- **Files to Edit**: [gemini.ts](file:///d:/Codes/Projects/someoneos/lib/gemini.ts), [api/extract/route.ts](file:///d:/Codes/Projects/someoneos/app/api/extract/route.ts)

### 6. Circadian Energy Rhythm Alignment ("Bio-Sync")
- **Description**: Extracts user circadian peak energy windows (e.g. "morning slumps") from text streams and maps heavy tasks (e.g. "review graph problems") to peaks, and light admin tasks to troughs.
- **Estimated Time**: 2.0 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Problem Solving (20), UX (10)
- **Files to Edit**: [memoryEngine.ts](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts), [planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts)

### 7. "Procrastination Autopsy" & Adaptive Buffering
- **Description**: When a task is marked procrastinated, the user explains why. Gemini extracts the root issue (e.g., lack of clarity) and adjusts category-specific buffers instead of a static 1.2x.
- **Estimated Time**: 2.5 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Agentic Depth (20), Innovation (20)
- **Files to Edit**: [memoryEngine.ts](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts), [planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts), [ExecutionPreview.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx)

### 8. "Ghost Tasks" Shadow Planner
- **Description**: Automatically detects high-stakes deadlines (e.g., "Presentation on Friday") and inserts background prep milestones ("Draft outline", "Dry run") in the preceding days.
- **Estimated Time**: 2.0 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 7.5/10
- **Evaluation Criteria Improved**: Problem Solving (20), Technical (10)
- **Files to Edit**: [planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts), [normalizer.ts](file:///d:/Codes/Projects/someoneos/lib/domain/normalizer.ts)

### 9. Cofounder Mode Automated Project Synthesizer
- **Description**: An agent that monitors completed tasks and leverages Gemini to compile a formatted Slack/email progress briefing ready to send to cofounders or teammates.
- **Estimated Time**: 2.0 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 7.0/10
- **Evaluation Criteria Improved**: Agentic Depth (20), Technical (10)
- **Files to Edit**: [engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts), [ExecutionPreview.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx)

### 10. "Relationship Guard" Social Scheduler
- **Description**: Memory engine flags personal relations (e.g., "Sarah"). If the planner detects zero family/social tasks for 7 days, it blocks out a slot for relationships.
- **Estimated Time**: 2.0 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Innovation (20), Problem Solving (20)
- **Files to Edit**: [memoryEngine.ts](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts), [planner.ts](file:///d:/Codes/Projects/someoneos/lib/planner/planner.ts)

### 11. Voice Ingestion & Vocal Stress Extraction
- **Description**: Processes voice recordings directly via Gemini. Extracts cognitive load baseline offsets based on vocal stress, speech rate, and sighs, displaying emotional indexes.
- **Estimated Time**: 3.5 hours
- **Difficulty**: Hard
- **Judge Wow Factor**: 10.0/10
- **Evaluation Criteria Improved**: Google Tech (15), UX (10), Innovation (20)
- **Files to Edit**: [api/extract/route.ts](file:///d:/Codes/Projects/someoneos/app/api/extract/route.ts), [BrainDumpInput.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/BrainDumpInput.tsx)

### 12. Dynamic "Focus Shield" & Slack Auto-DND
- **Description**: Extracts current task complexity and updates Slack DND status (e.g., "Focused on complex algorithms - back at 3PM") dynamically during deep work blocks.
- **Estimated Time**: 2.5 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: Agentic Depth (20), Problem Solving (20)
- **Files to Edit**: [engine.ts](file:///d:/Codes/Projects/someoneos/lib/someoneos/engine.ts), [ExecutionPreview.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ExecutionPreview.tsx)

### 13. Semantic Vector Deduplication & Memory Fusion
- **Description**: Upgrades character/string matching deduplication to vector similarity embeddings via Gemini's API, recognizing semantic overlaps (e.g. "buy milk" vs "get groceries").
- **Estimated Time**: 2.0 hours
- **Difficulty**: Medium
- **Judge Wow Factor**: 7.0/10
- **Evaluation Criteria Improved**: Technical (10), Google Tech (15)
- **Files to Edit**: [normalizer.ts](file:///d:/Codes/Projects/someoneos/lib/domain/normalizer.ts), [memoryEngine.ts](file:///d:/Codes/Projects/someoneos/lib/memory/memoryEngine.ts)

### 14. Gemini Live Voice Clarification Panel
- **Description**: Replaces static input forms with an interactive, voice-driven Gemini chat interface. The AI asks follow-ups verbally and adjusts the calendar live.
- **Estimated Time**: 5.0 hours
- **Difficulty**: Very Hard
- **Judge Wow Factor**: 10.0/10
- **Evaluation Criteria Improved**: Google Tech (15), Agentic Depth (20), UX (10)
- **Files to Edit**: [ClarificationPanel.tsx](file:///d:/Codes/Projects/someoneos/components/workspace/ClarificationPanel.tsx), [api/clarify-live/route.ts](file:///d:/Codes/Projects/someoneos/app/api/clarify-live/route.ts) [NEW]

### 15. Frictionless Chrome Capture Extension
- **Description**: A simple side-panel Chrome extension that captures web items (Slack, Jira, email) and routes them straight to `/api/extract` as quick background brain dumps.
- **Estimated Time**: 4.0 hours
- **Difficulty**: Hard
- **Judge Wow Factor**: 8.0/10
- **Evaluation Criteria Improved**: UX (10), Completeness (5), Google Tech (15)
- **Files to Edit**: [chrome-extension/](file:///d:/Codes/Projects/someoneos/chrome-extension) [NEW], [api/extract/route.ts](file:///d:/Codes/Projects/someoneos/app/api/extract/route.ts)

---

## Part 3: Feature Ranking by ROI (Points Per Hour)

To rank features objectively, we map each feature's contribution directly to the Hackathon Scoring Criteria:
- **Problem Solving (20 pts)**, **Agentic Depth (20 pts)**, **Innovation (20 pts)**, **Google Tech (15 pts)**, **UX (10 pts)**, **Technical (10 pts)**, **Completeness (5 pts)**.

$$\text{Points Contribution} = \text{Primary Criteria Value} + (\text{Secondary Criteria Value} \times 0.5)$$
$$\text{ROI} = \frac{\text{Points Contribution}}{\text{Estimated Time (Hours)}}$$

1. **Recovery Mode Visual Morph & Breath Guide**
   - *Points Contribution*: 30 points (UX 10, Problem Solving 20)
   - *Time*: 1.5 hours
   - **ROI: 20.0 points/hour**
2. **Cognitive Load "Defrag" Engine**
   - *Points Contribution*: 26 points (Innovation 20, UX 6)
   - *Time*: 1.5 hours
   - **ROI: 17.33 points/hour**
3. **Context-Swapping "Warm-Up" Generator**
   - *Points Contribution*: 26 points (UX 10, Innovation 10, Problem Solving 6)
   - *Time*: 1.5 hours
   - **ROI: 17.33 points/hour**
4. **Self-Healing Google Calendar Sync**
   - *Points Contribution*: 45 points (Google Tech 15, Agentic Depth 20, Completeness 10)
   - *Time*: 3.0 hours
   - **ROI: 15.0 points/hour**
5. **Gemini Developer Context Caching**
   - *Points Contribution*: 20 points (Technical 10, Google Tech 10)
   - *Time*: 1.5 hours
   - **ROI: 13.33 points/hour**
6. **Circadian Energy Rhythm Alignment ("Bio-Sync")**
   - *Points Contribution*: 26 points (Problem Solving 20, UX 6)
   - *Time*: 2.0 hours
   - **ROI: 13.0 points/hour**
7. **"Procrastination Autopsy" & Adaptive Buffering**
   - *Points Contribution*: 32 points (Agentic Depth 20, Innovation 12)
   - *Time*: 2.5 hours
   - **ROI: 12.8 points/hour**
8. **"Ghost Tasks" Shadow Planner**
   - *Points Contribution*: 24 points (Problem Solving 20, Technical 4)
   - *Time*: 2.0 hours
   - **ROI: 12.0 points/hour**
9. **Cofounder Mode Automated Project Synthesizer**
   - *Points Contribution*: 24 points (Agentic Depth 20, Technical 4)
   - *Time*: 2.0 hours
   - **ROI: 12.0 points/hour**
10. **"Relationship Guard" Social Scheduler**
    - *Points Contribution*: 20 points (Innovation 20)
    - *Time*: 2.0 hours
    - **ROI: 10.0 points/hour**
11. **Voice Ingestion & Vocal Stress Extraction**
    - *Points Contribution*: 35 points (Google Tech 15, UX 10, Innovation 10)
    - *Time*: 3.5 hours
    - **ROI: 10.0 points/hour**
12. **Dynamic "Focus Shield" & Slack Auto-DND**
    - *Points Contribution*: 24 points (Agentic Depth 20, Problem Solving 4)
    - *Time*: 2.5 hours
    - **ROI: 9.6 points/hour**
13. **Semantic Vector Deduplication & Memory Fusion**
    - *Points Contribution*: 16 points (Technical 10, Google Tech 6)
    - *Time*: 2.0 hours
    - **ROI: 8.0 points/hour**
14. **Gemini Live Voice Clarification Panel**
    - *Points Contribution*: 35 points (Google Tech 15, Agentic Depth 15, UX 5)
    - *Time*: 5.0 hours
    - **ROI: 7.0 points/hour**
15. **Frictionless Chrome Capture Extension**
    - *Points Contribution*: 18 points (UX 10, Completeness 5, Google Tech 3)
    - *Time*: 4.0 hours
    - **ROI: 4.5 points/hour**

---

## Part 4: The Core Hackathon Feature Set (Top 5 Selected)

We select the top 5 highest-ROI features. These features guarantee maximum score expansion in minimal development time.

### Selected Features

1. **Recovery Mode Visual Morph & Breath Guide (ROI: 20.0)**
   - *Why*: Radical visual change that judges remember. It converts the UI theme instantly based on state, showing perfect design alignment.
2. **Cognitive Load "Defrag" Engine (ROI: 17.33)**
   - *Why*: Solves cognitive friction visually. It animates multiple messy blocks merging into neat, structured tasks, illustrating problem-solving logic.
3. **Context-Swapping "Warm-Up" Generator (ROI: 17.33)**
   - *Why*: High-impact psychology feature that directly demonstrates why SomeoneOS is a "productivity companion" instead of a basic list maker.
4. **Self-Healing Google Calendar Sync (ROI: 15.0)**
   - *Why*: Solidifies the Google Technologies requirement with real-world Google Calendar integration, proving architectural depth.
5. **Gemini Developer Context Caching (ROI: 13.33)**
   - *Why*: Elite optimization flex. It shows judges that we understand state-of-the-art API configurations, making subsequent queries finish under 300ms.

---

### Rejected Features & Rationale

- **Circadian Energy Rhythm Alignment ("Bio-Sync")**: Overlaps heavily with the "Warm-Up" and "Defrag" features. Hard to make visually distinct in a short pitch.
- **"Procrastination Autopsy" & Adaptive Buffering**: Too slow to demonstrate. In a 3-minute pitch, you cannot wait around to show adaptive changes learning over multiple days.
- **"Ghost Tasks" Shadow Planner**: Hard to explain background task creation logic quickly. Sub-task generation is a common feature; doesn't feel sufficiently innovative.
- **Cofounder Mode Automated Project Synthesizer**: Running backend proxies is cool, but sending Slack drafts is mostly hidden from the main viewport, providing low visual feedback.
- **"Relationship Guard" Social Scheduler**: Adds scheduling clutter and can trigger weird, buggy calendar recommendations during live presentation.
- **Voice Ingestion & Vocal Stress Extraction**: High failure rate in a loud hackathon demo hall. Background noise will break audio transcription.
- **Dynamic "Focus Shield" & Slack Auto-DND**: Relies on third-party Slack developer sandbox access and webhooks, which are slow and brittle to demo.
- **Semantic Vector Deduplication & Memory Fusion**: Completely invisible to judges. You cannot easily demo embedding distance vectors in a 3-minute pitch slide deck.
- **Gemini Live Voice Clarification Panel**: Takes too long to build (5 hours). Live speech models can interrupt the presenter or lag, introducing catastrophic demo risk.
- **Frictionless Chrome Capture Extension**: High setup friction. Judges hate waiting for extension installs or sideloading configurations.

---

## Part 5: The Perfect 3-Minute Demo Script

> [!TIP]
> The demo is designed as an interactive narrative. The presenter plays the role of a stressed founder during a chaotic day.

### Phase 1: The Frictionless Ingestion (0:00 - 0:30)

* **Action**:
  - Presenter opens the SomeoneOS Dashboard. The UI is a glowing, premium dark-theme slate.
  - In the input console, the presenter types (or paste-types) a chaotic paragraph:
    > *"I have a critical investor pitch deck to finish today, and my back is killing me. My cofounder wants a sync at 10 AM. Oh, and I need to review code PRs."*
  - Presenter clicks **"Build My Day"**.

* **Script**:
  > *"We've all faced mornings like this: completely overwhelmed, a messy list of meetings, physical pain, and mental static. Normally, you'd spend 15 minutes organizing cards in Trello or blocking calendar slots. Let's see what SomeoneOS does when I just brain dump my chaos."*

* **Animation**:
  - Standard submission transition. The button changes to a glowing, rotating spinner.

---

### Phase 2: The Self-Healing Conflict & Memory Integration (0:30 - 1:15)

* **Action**:
  - The screen splits. The Gemini extraction output panels glow on-screen.
  - The calendar updates. A calendar conflict banner slides in: **"Conflict Alert: Investor Pitch (Google Calendar event) blocks Cofounder Sync. Resolving..."**
  - Presenter clicks **"Heal Calendar"**.

* **Script**:
  > *"SomeoneOS extracts the structure immediately. It logs my back pain to my physical profile. But look here: it connects to my Google Calendar and flags that my cofounder meeting conflicts with a scheduled investor deck review. Instead of letting me fail, I click one button, and the system dynamically shifts the cofounder sync, anchors the pitch, and updates my schedule."*

* **Animation**:
  - A subtle particle trail animates from the conflict banner, calendar blocks slide down smoothly, and a green badge glows: **"Calendar Healed via Algorithm 8"**.

---

### Phase 3: The Recovery Mode Visual Shift (1:15 - 2:00)

* **Action**:
  - The "Cognitive Load Sidebar" meter rises rapidly, landing at **82% (Critical Strain)**.
  - Suddenly, the entire dashboard UI undergoes a color shift from purple/blue to soft, calming emerald green.
  - A pulsing, translucent green halo expands and contracts in the center of the viewport with the text: *"Inhaling... Exhaling... Take a breath (30s remaining)"*.

* **Script**:
  > *"Watch what happens to the interface. Because my load is critical and the memory engine holds my physical constraint — back stiffness — SomeoneOS automatically morphs the environment. It goes into Recovery Mode. The colors soften, and the app prompts a breathing exercise. It has automatically injected a 15-minute physical stretch break right before my big pitch block."*

* **Animation**:
  - Linear transition color interpolation on CSS variables. The breathing halo scales up and down at $0.15\text{Hz}$ using CSS keyframe keying.

---

### Phase 4: Gemini Context Caching & Zero-Latency Query (2:00 - 2:30)

* **Action**:
  - Presenter opens the chat input box at the bottom and types: *"Remind me about the slides we skipped last week."*
  - The answer renders **instantly (< 300ms)** on-screen: *"Last week, you decided to drop the Appendix slides to keep the presentation under 10 minutes."*

* **Script**:
  > *"Because we use Gemini Developer Context Caching, the system maintains my full historical context directly in the model. There is no typical 4-second LLM delay. It responds in under 300 milliseconds. It remembers my previous decisions and keeps me aligned instantly."*

* **Animation**:
  - The chat bubble pops up with a spring animation and a "Cached Retrieval" green badge.

---

### Phase 5: The Cognitive Defrag & The Close (2:30 - 3:00)

* **Action**:
  - The presenter clicks the glowing **"Defrag Day"** button on the right sidebar.
  - The tasks panel plays a folding grid animation: three micro-tasks collapse into a single block labeled: **"Admin & PR Review Batch (45m)"**.
  - The Cognitive Load Index falls from **82% to 45% (Healthy)**.

* **Script**:
  > *"To finalize, my dashboard has too many tiny items. I click 'Defrag'. The engine batches my code reviews, reschedules minor issues, and my cognitive load drops back to healthy levels.
  >
  > We didn't build a checklist application. We built a system that protects your biology, schedules around your limits, and heals your day. SomeoneOS makes technology serve human limits. Thank you."*

* **Animation**:
  - Fade-out on collapsed tasks, fade-in on the batched task block, and a radial wipe on the cognitive load gauge shifting color from red to green.

---

**Judge reaction:**
*"I would actually use this."*
