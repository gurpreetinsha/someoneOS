import { UnderstandingResult } from "@/types/understanding";
import { extractMemory } from "@/lib/memory/memoryEngine";
import { createPlan } from "@/lib/planner/planner";
import { Task, PlanResult } from "@/lib/planner/types/planner";
import { MemoryExtractionResult } from "@/lib/memory/types/memory";
import { buildPlanningContext } from "@/lib/domain/normalizer";

// ============================================================================
// EVALUATION TYPES & INTERFACES
// ============================================================================

export interface EvaluationScenario {
  id: string;
  title: string;
  categories: string[];
  understanding: UnderstandingResult;
  clarificationAnswers?: Record<string, string>;
}

export interface ScenarioEvaluationResult {
  scenarioId: string;
  title: string;
  categories: string[];
  understanding: UnderstandingResult;
  memory: MemoryExtractionResult;
  plan: PlanResult;
  isDeterministic: boolean;
  defects: {
    duplicateTaskIds: boolean;
    duplicateTitles: boolean;
    circularDependencies: boolean;
    negativeDurations: boolean;
    zeroDurations: boolean;
    missingReasons: boolean;
    missingPriorities: boolean;
  };
}

export interface PlannerEvaluationReport {
  timestamp: string;
  totalScenarios: number;
  coveredCategories: string[];
  metrics: {
    totalTasks: number;
    avgTasksPerScenario: number;
    minTasksInScenario: number;
    maxTasksInScenario: number;
    totalWarnings: number;
    avgWarningsPerScenario: number;
    totalUnplannedItems: number;
    avgUnplannedPerScenario: number;
    totalEstimatedHours: number;
    avgEstimatedHoursPerScenario: number;
    priorityDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    totalMemoriesExtracted: number;
    memoryCategoryDistribution: Record<string, number>;
    deterministicCount: number;
    emptyPlansCount: number;
  };
  defectsSummary: {
    duplicateTaskIds: number;
    duplicateTitles: number;
    circularDependencies: number;
    negativeDurations: number;
    zeroDurations: number;
    missingReasons: number;
    missingPriorities: number;
  };
  failures: string[];
  passed: boolean;
}

// ============================================================================
// 52 HAND-WRITTEN REALISTIC SCENARIOS
// ============================================================================

export const EVALUATION_SCENARIOS: EvaluationScenario[] = [
  // 1. Student - Midterm Prep
  {
    id: "sc_01",
    title: "Student Midterm Cram",
    categories: ["Student", "Exam week", "Short brain dumps"],
    understanding: {
      rawText: "Need to study DSA for midterm on Friday. Read chapter 4 and 5.",
      extraction: {
        events: [],
        deadlines: ["Submit assignment by Friday"],
        goals: [],
        constraints: [],
        priorities: ["Study DSA", "Read chapter 4 and 5"],
        emotionalSignals: ["stressed"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 2. Founder - Seed Pitch Prep
  {
    id: "sc_02",
    title: "Founder Investor Deck",
    categories: ["Founder", "Multiple deadlines", "Conflicting priorities"],
    understanding: {
      rawText: "Finish pitch deck for VC meeting at 3pm tomorrow. Send financials to cofounder.",
      extraction: {
        events: ["VC meeting at 3pm"],
        deadlines: ["Finish pitch deck by tomorrow 3pm"],
        goals: ["Raise seed round"],
        constraints: [],
        priorities: ["Prepare portfolio", "Send email to client"],
        emotionalSignals: ["anxious"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 3. Job Seeker - Applications
  {
    id: "sc_03",
    title: "Job Applications Sprint",
    categories: ["Job seeker", "Short brain dumps"],
    understanding: {
      rawText: "Apply to 5 frontend roles today. Fix resume formatting.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Get software engineer job"],
        constraints: [],
        priorities: ["Fix resume formatting", "Send email to recruiter"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 4. Working Professional - Sprint Deliverables
  {
    id: "sc_04",
    title: "Sprint Feature Review",
    categories: ["Working professional", "Multiple deadlines"],
    understanding: {
      rawText: "Code API endpoints for auth module. Review PR for search service by 5pm.",
      extraction: {
        events: ["Standup at 10am"],
        deadlines: ["Review PR by 5pm"],
        goals: [],
        constraints: [],
        priorities: ["Code API", "Review PR"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 5. ADHD - Overwhelmed Afternoon
  {
    id: "sc_05",
    title: "ADHD Task Dump",
    categories: ["ADHD", "Long messy brain dumps", "Mixed emotional state"],
    understanding: {
      rawText: "I have so much to do and I procrastinate so badly! I need to pay electric bill, fix bug in app, clean desk, buy groceries, and call mom. Everything feels urgent.",
      extraction: {
        events: [],
        deadlines: ["Pay electric bill today"],
        goals: ["Be organized"],
        constraints: ["Struggle with focus"],
        priorities: ["Pay electric bill", "Fix bug", "Clean desk", "Buy groceries"],
        emotionalSignals: ["overwhelmed", "anxious"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 6. Busy Parent - Morning Chaos
  {
    id: "sc_06",
    title: "Parent Routine Run",
    categories: ["Busy parent", "Recurring routines", "Relationship obligations"],
    understanding: {
      rawText: "Drop kids at school every morning at 8am. Pick up pediatric medicine. Prepare dinner for my family.",
      extraction: {
        events: ["Drop kids at school at 8am"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Pick up medicine", "Prepare dinner"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 7. Fitness Enthusiast
  {
    id: "sc_07",
    title: "Marathon Prep",
    categories: ["Fitness", "Recurring routines"],
    understanding: {
      rawText: "Go gym every morning. Run 10k tempo run on Saturday. Track daily protein intake.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Complete marathon"],
        constraints: [],
        priorities: ["Run 10k tempo run", "Track daily protein intake"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 8. Vacation Planning
  {
    id: "sc_08",
    title: "Tokyo Trip Itinerary",
    categories: ["Vacation", "Long messy brain dumps"],
    understanding: {
      rawText: "Planning trip to Tokyo! Book flight tickets by tomorrow. Reserve Ghibli museum tickets. Check passport expiration date. Exchange currency.",
      extraction: {
        events: [],
        deadlines: ["Book flight tickets by tomorrow"],
        goals: ["Have great vacation"],
        constraints: [],
        priorities: ["Book flight tickets", "Reserve museum tickets", "Check passport expiration"],
        emotionalSignals: ["excited"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 9. Exam Week Rush
  {
    id: "sc_09",
    title: "CS Finals Crunch",
    categories: ["Student", "Exam week", "Conflicting priorities"],
    understanding: {
      rawText: "Finals week is crazy. Algorithms exam on Thursday, OS project due Friday midnight. Need to finish operating systems lab report.",
      extraction: {
        events: ["Algorithms exam on Thursday"],
        deadlines: ["Submit OS project by Friday midnight"],
        goals: ["Pass exams"],
        constraints: [],
        priorities: ["Study algorithms", "Write report"],
        emotionalSignals: ["panicked"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 10. 48-Hour AI Hackathon
  {
    id: "sc_10",
    title: "AI Hackathon Build",
    categories: ["Hackathon", "Multiple deadlines", "Short brain dumps"],
    understanding: {
      rawText: "Hackathon project building AI assistant. Submit devpost by 12pm Sunday. Record demo video.",
      extraction: {
        events: ["Opening ceremony at 6pm"],
        deadlines: ["Submit devpost by Sunday 12pm"],
        goals: ["Win hackathon"],
        constraints: [],
        priorities: ["Build app", "Record demo video"],
        emotionalSignals: ["hyped"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 11. Relationship Obligations
  {
    id: "sc_11",
    title: "Anniversary Celebration",
    categories: ["Relationship obligations", "Short brain dumps"],
    understanding: {
      rawText: "Anniversary dinner with my wife at 7pm on Saturday. Buy flowers and handwritten card.",
      extraction: {
        events: ["Anniversary dinner at 7pm Saturday"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Buy flowers", "Write card"],
        emotionalSignals: ["loving"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 12. Health Issues
  {
    id: "sc_12",
    title: "Back Injury Care",
    categories: ["Health issues", "Short brain dumps"],
    understanding: {
      rawText: "Injured my lower back. Doctor appointment at 2pm. Pick up prescription muscle relaxants.",
      extraction: {
        events: ["Doctor appointment at 2pm"],
        deadlines: [],
        goals: ["Recover health"],
        constraints: ["Back pain"],
        priorities: ["Pick up prescription"],
        emotionalSignals: ["in pain"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 13. Burnout Recovery
  {
    id: "sc_13",
    title: "Burnout Reset",
    categories: ["Burnout", "Mixed emotional state", "Short brain dumps"],
    understanding: {
      rawText: "Extremely exhausted. Taking a mental health day. Turn off work notifications, rest, walk in park.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Be healthier"],
        constraints: ["Low energy"],
        priorities: ["Walk in park"],
        emotionalSignals: ["drained", "exhausted"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 14. Very Ambiguous Brain Dump
  {
    id: "sc_14",
    title: "Existential Life Direction",
    categories: ["Very ambiguous brain dumps", "Mixed emotional state"],
    understanding: {
      rawText: "I want to become successful and rich. Maybe figure out life goals and happiness.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Become rich", "Learn happiness"],
        constraints: [],
        priorities: [],
        emotionalSignals: ["confused"],
        missingInformation: ["Actionable steps"],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 15. Student & Part-time Job Combo
  {
    id: "sc_15",
    title: "Student Work Shift",
    categories: ["Student", "Working professional", "Conflicting priorities"],
    understanding: {
      rawText: "Shift at cafe at 4pm. Need to submit essay by 11pm tonight.",
      extraction: {
        events: ["Shift at cafe at 4pm"],
        deadlines: ["Submit essay by 11pm"],
        goals: [],
        constraints: [],
        priorities: ["Write essay"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 16. Founder Product Launch Week
  {
    id: "sc_16",
    title: "Product Hunt Launch",
    categories: ["Founder", "Multiple deadlines"],
    understanding: {
      rawText: "Launching on Product Hunt tomorrow at midnight! Prepare promotional tweets, fix critical login bug, verify server infrastructure.",
      extraction: {
        events: ["Product Hunt launch at 12am"],
        deadlines: ["Fix login bug by 10pm"],
        goals: ["Successful product launch"],
        constraints: [],
        priorities: ["Fix login bug", "Review system"],
        emotionalSignals: ["intense"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 17. Job Seeker - Technical Interview Sprint
  {
    id: "sc_17",
    title: "Technical Interview Prep",
    categories: ["Job seeker", "Multiple deadlines", "Student"],
    understanding: {
      rawText: "Technical interview with Meta on Wednesday. Study DSA graph algorithms and practice dynamic programming problems.",
      extraction: {
        events: ["Interview with Meta at 10am Wednesday"],
        deadlines: [],
        goals: ["Get job"],
        constraints: [],
        priorities: ["Study DSA"],
        emotionalSignals: ["nervous"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 18. Busy Parent - Weekend Chore Marathon
  {
    id: "sc_18",
    title: "Parent Weekend Chores",
    categories: ["Busy parent", "Recurring routines"],
    understanding: {
      rawText: "Clean garage, take kids to soccer practice at 10am Saturday, do weekly meal prep every Sunday.",
      extraction: {
        events: ["Soccer practice at 10am Saturday"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Clean garage", "Weekly meal prep"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 19. Fitness - Injury Rehab Plan
  {
    id: "sc_19",
    title: "Physical Therapy Routine",
    categories: ["Fitness", "Health issues"],
    understanding: {
      rawText: "Physical therapy session at 11am for rotator cuff injury. Do shoulder mobility exercises daily.",
      extraction: {
        events: ["Physical therapy session at 11am"],
        deadlines: [],
        goals: ["Recover health"],
        constraints: ["Injured shoulder"],
        priorities: ["Do shoulder mobility exercises"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 20. Working Professional - Quarterly Review Docs
  {
    id: "sc_20",
    title: "Q3 Strategy Document",
    categories: ["Working professional", "Short brain dumps"],
    understanding: {
      rawText: "Write doc for Q3 product roadmap strategy. Send draft to engineering manager.",
      extraction: {
        events: [],
        deadlines: ["Send draft by Friday"],
        goals: [],
        constraints: [],
        priorities: ["Write doc", "Send email to manager"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 21. ADHD - Brain Dump Spill
  {
    id: "sc_21",
    title: "ADHD Hyper-Brain Dump",
    categories: ["ADHD", "Long messy brain dumps", "Mixed emotional state"],
    understanding: {
      rawText: "I forget deadlines constantly and I procrastinate all day. Need to organize desk, reply to Slack messages, study Rust programming, and renew driver license before end of month.",
      extraction: {
        events: [],
        deadlines: ["Renew driver license by end of month"],
        goals: [],
        constraints: ["I procrastinate", "Forget deadlines"],
        priorities: ["Organize desk", "Send message", "Study Rust"],
        emotionalSignals: ["scattered"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 22. Vacation - Camping Trip Packing
  {
    id: "sc_22",
    title: "Yosemite Camping Pack",
    categories: ["Vacation", "Short brain dumps"],
    understanding: {
      rawText: "Pack tent, sleeping bags, and portable stove for Yosemite camping trip this weekend.",
      extraction: {
        events: ["Drive to Yosemite Friday 6am"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Pack gear", "Buy groceries"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 23. Hackathon Demo Prep
  {
    id: "sc_23",
    title: "Hackathon Pitch Deck",
    categories: ["Hackathon", "Multiple deadlines"],
    understanding: {
      rawText: "Prepare presentation slides for hackathon judges at 4pm. Test live app deployment.",
      extraction: {
        events: ["Judging presentation at 4pm"],
        deadlines: ["Test app deployment by 3pm"],
        goals: [],
        constraints: [],
        priorities: ["Prepare doc", "Test deployment"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 24. Burnout & Exhaustion Spill
  {
    id: "sc_24",
    title: "Overworked Fatigue",
    categories: ["Burnout", "Mixed emotional state", "Health issues"],
    understanding: {
      rawText: "Suffering from severe migraine and mental exhaustion. Need sleep. Cancel non-essential calls.",
      extraction: {
        events: [],
        deadlines: [],
        goals: [],
        constraints: ["Migraine", "Exhaustion"],
        priorities: ["Rest"],
        emotionalSignals: ["depleted"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 25. Relationship - Helping Sister Move
  {
    id: "sc_25",
    title: "Family Moving Help",
    categories: ["Relationship obligations", "Working professional"],
    understanding: {
      rawText: "Helping my sister move apartment on Saturday morning at 9am. Rent moving truck on Friday.",
      extraction: {
        events: ["Helping my sister move at 9am Saturday"],
        deadlines: ["Rent truck by Friday 5pm"],
        goals: [],
        constraints: [],
        priorities: ["Rent truck"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 26. Very Ambiguous Brain Dump - Career Pivot
  {
    id: "sc_26",
    title: "Career Pivot Ambiguity",
    categories: ["Very ambiguous brain dumps"],
    understanding: {
      rawText: "Maybe I should change careers or get into AI research. Aspire to build impactful systems.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Get into AI research", "Build impactful systems"],
        constraints: [],
        priorities: [],
        emotionalSignals: ["seeking direction"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 27. Student - Lab Report & Group Project
  {
    id: "sc_27",
    title: "Physics Lab & Group Meeting",
    categories: ["Student", "Conflicting priorities"],
    understanding: {
      rawText: "Group project meeting at 2pm. Write physics lab report by 11:59pm tonight.",
      extraction: {
        events: ["Meeting at 2pm"],
        deadlines: ["Submit physics lab report by 11:59pm"],
        goals: [],
        constraints: [],
        priorities: ["Write report"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 28. Founder - Investor Updates
  {
    id: "sc_28",
    title: "Monthly Investor Update",
    categories: ["Founder", "Working professional"],
    understanding: {
      rawText: "Send monthly update email to investors detailing burn rate, active users, and roadmap.",
      extraction: {
        events: [],
        deadlines: ["Send update email by end of day"],
        goals: [],
        constraints: [],
        priorities: ["Send email to investors", "Draft report"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 29. Job Seeker - Networking Outreach
  {
    id: "sc_29",
    title: "LinkedIn Networking Routine",
    categories: ["Job seeker", "Recurring routines"],
    understanding: {
      rawText: "Send LinkedIn connection messages to engineering managers every day. Follow up on active referrals.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Get job"],
        constraints: [],
        priorities: ["Send message to managers"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 30. Busy Parent - Birthday Party Planning
  {
    id: "sc_30",
    title: "Kid Birthday Party Prep",
    categories: ["Busy parent", "Relationship obligations", "Long messy brain dumps"],
    understanding: {
      rawText: "Planning my son's 7th birthday party! Order custom superhero cake by Wednesday. Send digital invitations to classmates. Buy party favors and decorations.",
      extraction: {
        events: ["Birthday party on Saturday at 2pm"],
        deadlines: ["Order cake by Wednesday"],
        goals: [],
        constraints: [],
        priorities: ["Order cake", "Send invitations", "Buy decorations"],
        emotionalSignals: ["busy"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 31. Fitness - Weightlifting Progression
  {
    id: "sc_31",
    title: "Strength Training Plan",
    categories: ["Fitness", "Short brain dumps"],
    understanding: {
      rawText: "Upper body bench press workout today. Track personal record weights.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Be healthier"],
        constraints: [],
        priorities: ["Bench press workout"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 32. Working Professional - Outage Post-Mortem
  {
    id: "sc_32",
    title: "Production Outage Review",
    categories: ["Working professional", "Multiple deadlines"],
    understanding: {
      rawText: "Production outage review meeting at 11am. Write post-mortem document explaining root cause and fix bug in database query.",
      extraction: {
        events: ["Meeting at 11am"],
        deadlines: ["Submit post-mortem doc by 4pm"],
        goals: [],
        constraints: [],
        priorities: ["Write document", "Fix bug"],
        emotionalSignals: ["stressed"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 33. ADHD - Hyperfocus Side Project
  {
    id: "sc_33",
    title: "ADHD Side Project Sprint",
    categories: ["ADHD", "Founder", "Long messy brain dumps"],
    understanding: {
      rawText: "Building a new AI widget app! I get easily distracted but I want to code prototype today, design logo, and set up landing page.",
      extraction: {
        events: [],
        deadlines: [],
        goals: [],
        constraints: ["Distracted easily"],
        priorities: ["Code app", "Design logo"],
        emotionalSignals: ["hyperfocused"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 34. Vacation - European Road Trip
  {
    id: "sc_34",
    title: "Euro Road Trip Ideas",
    categories: ["Vacation", "Very ambiguous brain dumps"],
    understanding: {
      rawText: "Thinking about visiting France and Italy next summer. Maybe rent a car and drive through Tuscany.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Travel Europe"],
        constraints: [],
        priorities: [],
        emotionalSignals: [],
        missingInformation: ["Dates and budget"],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 35. Exam Week - Organic Chemistry Grind
  {
    id: "sc_35",
    title: "Organic Chem Final Prep",
    categories: ["Student", "Exam week", "Burnout"],
    understanding: {
      rawText: "Organic chemistry final exam in 3 days. Feeling exhausted but need to memorize reaction mechanisms and review practice problems.",
      extraction: {
        events: ["Organic Chem exam in 3 days"],
        deadlines: [],
        goals: ["Pass exam"],
        constraints: ["Exhausted"],
        priorities: ["Memorize reactions", "Review problems"],
        emotionalSignals: ["drained"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 36. Hackathon Final Pitch
  {
    id: "sc_36",
    title: "Hackathon Code Freeze",
    categories: ["Hackathon", "Short brain dumps"],
    understanding: {
      rawText: "Code freeze at 11am! Push final git commit to repository and check build status.",
      extraction: {
        events: [],
        deadlines: ["Push commit by 11am"],
        goals: [],
        constraints: [],
        priorities: ["Push code", "Review build"],
        emotionalSignals: ["rushed"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 37. Relationship - Family Reunion
  {
    id: "sc_37",
    title: "Family Reunion Dinner",
    categories: ["Relationship obligations", "Busy parent"],
    understanding: {
      rawText: "Dinner with my parents and relatives at 6pm on Sunday. Coordinate potluck dishes with my sister.",
      extraction: {
        events: ["Family dinner at 6pm Sunday"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Coordinate potluck"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 38. Health Issues - Chronic Back Pain Routine
  {
    id: "sc_38",
    title: "Back Pain Stretch Routine",
    categories: ["Health issues", "Recurring routines"],
    understanding: {
      rawText: "Struggling with chronic back pain. Do core stability stretches every morning and evening.",
      extraction: {
        events: [],
        deadlines: [],
        goals: [],
        constraints: ["Back pain"],
        priorities: ["Do morning stretches"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 39. Burnout - Sabbatical To-Do List
  {
    id: "sc_39",
    title: "Sabbatical Rest Plan",
    categories: ["Burnout", "Long messy brain dumps"],
    understanding: {
      rawText: "On sabbatical to recover from work burnout. Read novels, disconnect from laptop, sleep 8 hours daily, drink herbal tea.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Be healthier"],
        constraints: ["Burnout"],
        priorities: ["Read novel"],
        emotionalSignals: ["peaceful"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 40. Very Ambiguous Brain Dump - Vague Ideas
  {
    id: "sc_40",
    title: "Vague Creative Ideas",
    categories: ["Very ambiguous brain dumps", "Short brain dumps"],
    understanding: {
      rawText: "Someday write a sci-fi novel or start a podcast about philosophy.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Write novel", "Start podcast"],
        constraints: [],
        priorities: [],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 41. Student - Scholarship Application
  {
    id: "sc_41",
    title: "Scholarship Essay & Application",
    categories: ["Student", "Job seeker", "Multiple deadlines"],
    understanding: {
      rawText: "Apply for tech merit scholarship by Friday midnight. Write 500 word essay on career ambitions and request recommendation letter from professor.",
      extraction: {
        events: [],
        deadlines: ["Submit scholarship by Friday midnight"],
        goals: [],
        constraints: [],
        priorities: ["Write essay", "Send email to professor"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 42. Founder - Hiring First Engineer
  {
    id: "sc_42",
    title: "Engineering Hiring Pipeline",
    categories: ["Founder", "Working professional"],
    understanding: {
      rawText: "Hiring senior fullstack engineer. Conduct technical screening call at 2pm. Review candidate resumes.",
      extraction: {
        events: ["Call at 2pm"],
        deadlines: [],
        goals: ["Get job candidates"],
        constraints: [],
        priorities: ["Review resume"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 43. Job Seeker - Portfolio Revamp
  {
    id: "sc_43",
    title: "Portfolio Website Polish",
    categories: ["Job seeker", "Founder", "Short brain dumps"],
    understanding: {
      rawText: "Prepare portfolio website showcase projects. Update bio and deployed live links.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Get job"],
        constraints: [],
        priorities: ["Prepare portfolio", "Review links"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 44. Working Professional - Client Onboarding
  {
    id: "sc_44",
    title: "Enterprise Client Onboarding",
    categories: ["Working professional", "Multiple deadlines"],
    understanding: {
      rawText: "Onboarding new enterprise client. Sync call with client lead at 1pm. Send implementation documentation by 4pm.",
      extraction: {
        events: ["Sync call at 1pm"],
        deadlines: ["Send document by 4pm"],
        goals: [],
        constraints: [],
        priorities: ["Send document"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 45. ADHD - Morning Task Panic
  {
    id: "sc_45",
    title: "ADHD Morning Rush",
    categories: ["ADHD", "Mixed emotional state", "Short brain dumps"],
    understanding: {
      rawText: "Woke up late! I procrastinate so easily. Need to send urgent email to boss and refactor code module.",
      extraction: {
        events: [],
        deadlines: ["Send email urgently"],
        goals: [],
        constraints: ["I procrastinate"],
        priorities: ["Send email to boss", "Refactor code"],
        emotionalSignals: ["flustered"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 46. Busy Parent - School Science Fair
  {
    id: "sc_46",
    title: "Kid Science Fair Project",
    categories: ["Busy parent", "Student", "Relationship obligations"],
    understanding: {
      rawText: "Helping my daughter build solar system model for school science fair on Thursday. Buy foam balls and paint.",
      extraction: {
        events: ["Science fair on Thursday"],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Buy supplies", "Build model"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 47. Fitness - 10K Race Week Prep
  {
    id: "sc_47",
    title: "10K Race Registration & Gear",
    categories: ["Fitness", "Multiple deadlines"],
    understanding: {
      rawText: "10K race this Sunday at 7am. Pick up race bib packet on Saturday by 4pm. Carbo-load dinner.",
      extraction: {
        events: ["Race at 7am Sunday"],
        deadlines: ["Pick up packet by Saturday 4pm"],
        goals: [],
        constraints: [],
        priorities: ["Pick up packet"],
        emotionalSignals: ["excited"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 48. Vacation - Post-Holiday Catch Up
  {
    id: "sc_48",
    title: "Post-Vacation Work Catch-up",
    categories: ["Vacation", "Working professional", "Short brain dumps"],
    understanding: {
      rawText: "Back from vacation. Process 150 unread emails and catch up on team Slack updates.",
      extraction: {
        events: [],
        deadlines: [],
        goals: [],
        constraints: [],
        priorities: ["Send email", "Review Slack"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 49. Exam Week - History Essay
  {
    id: "sc_49",
    title: "History Term Paper Study Group",
    categories: ["Student", "Exam week", "Relationship obligations"],
    understanding: {
      rawText: "Study group session with classmates at 3pm. Finish writing term paper essay by midnight.",
      extraction: {
        events: ["Study group at 3pm"],
        deadlines: ["Submit essay by midnight"],
        goals: [],
        constraints: [],
        priorities: ["Write essay"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 50. Hackathon Team Ideation
  {
    id: "sc_50",
    title: "Hackathon Brainstorming",
    categories: ["Hackathon", "Very ambiguous brain dumps"],
    understanding: {
      rawText: "Hackathon kickoff! Brainstorming cool app ideas or blockchain protocols.",
      extraction: {
        events: ["Kickoff event"],
        deadlines: [],
        goals: ["Build app"],
        constraints: [],
        priorities: [],
        emotionalSignals: [],
        missingInformation: ["Chosen concept"],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 51. Relationship - Friend's Bachelor Party
  {
    id: "sc_51",
    title: "Bachelor Party Planning",
    categories: ["Relationship obligations", "Long messy brain dumps"],
    understanding: {
      rawText: "Organizing best friend's bachelor party trip to Austin! Book Airbnb accommodation, reserve steakhouse dinner table at 8pm Saturday, collect payments from groomsmen.",
      extraction: {
        events: ["Dinner at 8pm Saturday"],
        deadlines: ["Book Airbnb by Friday"],
        goals: [],
        constraints: [],
        priorities: ["Book Airbnb", "Collect payments"],
        emotionalSignals: [],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
  // 52. Burnout - Stress Management Routine
  {
    id: "sc_52",
    title: "Stress Reduction Self-Care",
    categories: ["Burnout", "Health issues", "Mixed emotional state"],
    understanding: {
      rawText: "Feeling overwhelmed and burned out. Practicing meditation daily, limiting screen time after 9pm.",
      extraction: {
        events: [],
        deadlines: [],
        goals: ["Be healthier"],
        constraints: ["Burnout"],
        priorities: ["Practice meditation"],
        emotionalSignals: ["anxious"],
        missingInformation: [],
      },
      clarification: { requiresClarification: false, questions: [] },
    },
  },
];

// ============================================================================
// AUTOMATIC DEFECT DETECTION HELPERS
// ============================================================================

function detectCircularDependencies(tasks: Task[]): boolean {
  const adj = new Map<string, string[]>();
  tasks.forEach((t) => adj.set(t.id, t.dependsOn || []));

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function isCyclic(node: string): boolean {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (isCyclic(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (const task of tasks) {
    if (isCyclic(task.id)) return true;
  }
  return false;
}

function evaluateScenario(scenario: EvaluationScenario): ScenarioEvaluationResult {
  const clarificationAnswers = scenario.clarificationAnswers || {};

  // Run Pipeline Stage 1 & 2: Memory Extraction & Upstream Domain Normalization
  const memory = extractMemory(scenario.understanding);
  const context = buildPlanningContext({
    understanding: scenario.understanding,
    memory,
    clarificationAnswers,
  });

  // Run Pipeline Stage 3: Planner Execution (consumes PlanningContext only)
  const plan = createPlan(context);

  // Check Determinism by executing second time
  const memory2 = extractMemory(scenario.understanding);
  const context2 = buildPlanningContext({
    understanding: scenario.understanding,
    memory: memory2,
    clarificationAnswers,
  });
  const plan2 = createPlan(context2);

  const isDeterministic =
    JSON.stringify(plan.executionOrder) === JSON.stringify(plan2.executionOrder) &&
    plan.tasks.length === plan2.tasks.length &&
    plan.tasks.every((t, idx) => t.id === plan2.tasks[idx].id && t.estimatedMinutes === plan2.tasks[idx].estimatedMinutes);

  // Automatic Defects Detection
  const taskIds = plan.tasks.map((t) => t.id);
  const taskTitles = plan.tasks.map((t) => t.title.toLowerCase().trim());

  const duplicateTaskIds = new Set(taskIds).size < taskIds.length;
  const duplicateTitles = new Set(taskTitles).size < taskTitles.length;
  const circularDependencies = detectCircularDependencies(plan.tasks);
  const negativeDurations = plan.tasks.some((t) => t.estimatedMinutes < 0);
  const zeroDurations = plan.tasks.some((t) => t.estimatedMinutes === 0);
  const missingReasons = plan.tasks.some((t) => !t.reason || t.reason.trim() === "");
  const missingPriorities = plan.tasks.some((t) => !["high", "medium", "low"].includes(t.priority));

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    categories: scenario.categories,
    understanding: scenario.understanding,
    memory,
    plan,
    isDeterministic,
    defects: {
      duplicateTaskIds,
      duplicateTitles,
      circularDependencies,
      negativeDurations,
      zeroDurations,
      missingReasons,
      missingPriorities,
    },
  };
}

// ============================================================================
// MAIN EVALUATION ENGINE & REPORT GENERATOR
// ============================================================================

export function runPlannerEvaluation(): PlannerEvaluationReport {
  const results = EVALUATION_SCENARIOS.map(evaluateScenario);

  let totalTasks = 0;
  let minTasksInScenario = Infinity;
  let maxTasksInScenario = 0;
  let totalWarnings = 0;
  let totalUnplannedItems = 0;
  let totalEstimatedMinutes = 0;
  let totalMemoriesExtracted = 0;
  let deterministicCount = 0;
  let emptyPlansCount = 0;

  const priorityDistribution = { high: 0, medium: 0, low: 0 };
  const memoryCategoryDistribution: Record<string, number> = {};
  const categoriesSet = new Set<string>();

  const defectsSummary = {
    duplicateTaskIds: 0,
    duplicateTitles: 0,
    circularDependencies: 0,
    negativeDurations: 0,
    zeroDurations: 0,
    missingReasons: 0,
    missingPriorities: 0,
  };

  results.forEach((res) => {
    res.categories.forEach((c) => categoriesSet.add(c));

    const taskCount = res.plan.tasks.length;
    totalTasks += taskCount;
    if (taskCount < minTasksInScenario) minTasksInScenario = taskCount;
    if (taskCount > maxTasksInScenario) maxTasksInScenario = taskCount;

    if (taskCount === 0 && res.plan.unplannedItems.length === 0) {
      emptyPlansCount++;
    }

    totalWarnings += res.plan.warnings.length;
    totalUnplannedItems += res.plan.unplannedItems.length;

    res.plan.tasks.forEach((t) => {
      totalEstimatedMinutes += t.estimatedMinutes;
      if (t.priority === "high" || t.priority === "medium" || t.priority === "low") {
        priorityDistribution[t.priority]++;
      }
    });

    totalMemoriesExtracted += res.memory.extractedCount;
    res.memory.memories.forEach((m) => {
      memoryCategoryDistribution[m.category] = (memoryCategoryDistribution[m.category] || 0) + 1;
    });

    if (res.isDeterministic) deterministicCount++;

    if (res.defects.duplicateTaskIds) defectsSummary.duplicateTaskIds++;
    if (res.defects.duplicateTitles) defectsSummary.duplicateTitles++;
    if (res.defects.circularDependencies) defectsSummary.circularDependencies++;
    if (res.defects.negativeDurations) defectsSummary.negativeDurations++;
    if (res.defects.zeroDurations) defectsSummary.zeroDurations++;
    if (res.defects.missingReasons) defectsSummary.missingReasons++;
    if (res.defects.missingPriorities) defectsSummary.missingPriorities++;
  });

  const totalScenarios = results.length;
  const totalEstimatedHours = Math.round((totalEstimatedMinutes / 60) * 10) / 10;

  const failures: string[] = [];

  // Required checks for PASS/FAIL
  if (totalScenarios < 50) {
    failures.push(`Scenario count standard failed: Executed ${totalScenarios} scenarios, minimum required is 50.`);
  }

  if (deterministicCount < totalScenarios) {
    failures.push(`Determinism check failed: ${totalScenarios - deterministicCount} scenario runs were non-deterministic.`);
  }

  if (defectsSummary.duplicateTaskIds > 0) {
    failures.push(`Defect detected: ${defectsSummary.duplicateTaskIds} scenarios contained duplicate task IDs.`);
  }
  if (defectsSummary.duplicateTitles > 0) {
    failures.push(`Defect detected: ${defectsSummary.duplicateTitles} scenarios contained duplicate task titles.`);
  }
  if (defectsSummary.circularDependencies > 0) {
    failures.push(`Defect detected: ${defectsSummary.circularDependencies} scenarios contained circular dependencies.`);
  }
  if (defectsSummary.negativeDurations > 0) {
    failures.push(`Defect detected: ${defectsSummary.negativeDurations} scenarios contained tasks with negative duration.`);
  }
  if (defectsSummary.zeroDurations > 0) {
    failures.push(`Defect detected: ${defectsSummary.zeroDurations} scenarios contained tasks with zero duration.`);
  }
  if (defectsSummary.missingReasons > 0) {
    failures.push(`Defect detected: ${defectsSummary.missingReasons} scenarios contained tasks missing reason strings.`);
  }
  if (defectsSummary.missingPriorities > 0) {
    failures.push(`Defect detected: ${defectsSummary.missingPriorities} scenarios contained tasks missing priority assignment.`);
  }

  const requiredCategories = [
    "Student",
    "Founder",
    "Job seeker",
    "Working professional",
    "ADHD",
    "Busy parent",
    "Fitness",
    "Multiple deadlines",
    "Conflicting priorities",
    "Vacation",
    "Exam week",
    "Hackathon",
    "Relationship obligations",
    "Health issues",
    "Burnout",
    "Recurring routines",
    "Mixed emotional state",
    "Long messy brain dumps",
    "Short brain dumps",
    "Very ambiguous brain dumps",
  ];

  const missingCategories = requiredCategories.filter((cat) => !categoriesSet.has(cat));
  if (missingCategories.length > 0) {
    failures.push(`Category coverage incomplete: Missing required categories [${missingCategories.join(", ")}].`);
  }

  const passed = failures.length === 0;

  return {
    timestamp: new Date().toISOString(),
    totalScenarios,
    coveredCategories: Array.from(categoriesSet),
    metrics: {
      totalTasks,
      avgTasksPerScenario: Math.round((totalTasks / totalScenarios) * 100) / 100,
      minTasksInScenario: minTasksInScenario === Infinity ? 0 : minTasksInScenario,
      maxTasksInScenario,
      totalWarnings,
      avgWarningsPerScenario: Math.round((totalWarnings / totalScenarios) * 100) / 100,
      totalUnplannedItems,
      avgUnplannedPerScenario: Math.round((totalUnplannedItems / totalScenarios) * 100) / 100,
      totalEstimatedHours,
      avgEstimatedHoursPerScenario: Math.round((totalEstimatedHours / totalScenarios) * 100) / 100,
      priorityDistribution,
      totalMemoriesExtracted,
      memoryCategoryDistribution,
      deterministicCount,
      emptyPlansCount,
    },
    defectsSummary,
    failures,
    passed,
  };
}

export function printReport(report: PlannerEvaluationReport): void {
  console.log("\n==========================================================================");
  console.log("                      SOMEONEOS PLANNER EVALUATION REPORT                 ");
  console.log("==========================================================================");
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Total Hand-written Scenarios Evaluated: ${report.totalScenarios}`);
  console.log(`Unique Coverage Categories: ${report.coveredCategories.length}`);
  console.log("--------------------------------------------------------------------------");
  console.log("METRICS COLLECTED:");
  console.log(`  - Total Tasks Generated:          ${report.metrics.totalTasks} (avg ${report.metrics.avgTasksPerScenario} / scenario, min ${report.metrics.minTasksInScenario}, max ${report.metrics.maxTasksInScenario})`);
  console.log(`  - Estimated Work Load:            ${report.metrics.totalEstimatedHours} total hours (avg ${report.metrics.avgEstimatedHoursPerScenario} hrs / scenario)`);
  console.log(`  - Priority Distribution:          High: ${report.metrics.priorityDistribution.high}, Medium: ${report.metrics.priorityDistribution.medium}, Low: ${report.metrics.priorityDistribution.low}`);
  console.log(`  - Total Planner Warnings:         ${report.metrics.totalWarnings} (avg ${report.metrics.avgWarningsPerScenario} / scenario)`);
  console.log(`  - Total Unplanned Goal Items:     ${report.metrics.totalUnplannedItems} (avg ${report.metrics.avgUnplannedPerScenario} / scenario)`);
  console.log(`  - Total Memories Extracted:       ${report.metrics.totalMemoriesExtracted}`);
  console.log(`  - Memory Categories Breakdown:    ${JSON.stringify(report.metrics.memoryCategoryDistribution)}`);
  console.log(`  - Determinism Pass Rate:          ${report.metrics.deterministicCount}/${report.totalScenarios} (${Math.round((report.metrics.deterministicCount / report.totalScenarios) * 100)}%)`);
  console.log(`  - Empty Plans Count:              ${report.metrics.emptyPlansCount}`);
  console.log("--------------------------------------------------------------------------");
  console.log("AUTOMATIC DEFECTS DETECTED:");
  console.log(`  - Duplicate Task IDs:             ${report.defectsSummary.duplicateTaskIds}`);
  console.log(`  - Duplicate Task Titles:          ${report.defectsSummary.duplicateTitles}`);
  console.log(`  - Circular Dependencies:          ${report.defectsSummary.circularDependencies}`);
  console.log(`  - Negative Durations:             ${report.defectsSummary.negativeDurations}`);
  console.log(`  - Zero Durations:                 ${report.defectsSummary.zeroDurations}`);
  console.log(`  - Missing Task Reasons:           ${report.defectsSummary.missingReasons}`);
  console.log(`  - Missing Task Priorities:        ${report.defectsSummary.missingPriorities}`);
  console.log("==========================================================================");

  if (report.passed) {
    console.log("\nOVERALL STATUS: PASS");
    console.log("All planner quality benchmarks, determinism rules, and defect checks satisfied successfully.\n");
  } else {
    console.log("\nOVERALL STATUS: FAIL");
    console.log("Failure Reasons:");
    report.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. ${f}`);
    });
    console.log("");
  }
}

// Executable entrypoint
if (require.main === module) {
  const report = runPlannerEvaluation();
  printReport(report);
  if (!report.passed) {
    process.exit(1);
  }
}
