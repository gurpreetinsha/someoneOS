"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = require("@/lib/someoneos/engine");
var mockUnderstanding = {
    extraction: {
        events: ["Meeting at 3pm"],
        deadlines: ["Deadline for submission by tonight"],
        goals: ["Get Google internship"],
        constraints: [],
        priorities: [
            "Code frontend application",
            "Build backend API services",
            "Write project documentation",
            "Fix dashboard bugs",
            "Run 5 miles"
        ],
        emotionalSignals: ["Stressed about deadlines"],
        missingInformation: []
    },
    clarification: { requiresClarification: false, questions: [] }
};
var mockMemories = [
    {
        id: "mem_health_back_pain",
        category: "health",
        value: "Chronic lower back stiffness (requires movement breaks)",
        confidence: 0.95,
        reason: "Demo seed"
    },
    {
        id: "mem_behavior_procrastinate",
        category: "behavior",
        value: "Tends to procrastinate on coding features (+20% buffer)",
        confidence: 0.95,
        reason: "Demo seed"
    }
];
function test() {
    console.log("Running AI Schedule Negotiator integration test...");
    var result = (0, engine_1.runSomeoneOS)({
        understanding: mockUnderstanding,
        clarificationAnswers: {},
        historicalMemories: mockMemories
    });
    if (!result.negotiation) {
        console.error("FAIL: No negotiation payload returned!");
        process.exit(1);
    }
    var negotiation = result.negotiation;
    console.log("Overload Detected:", negotiation.overloadDetected);
    console.log("Recommended Strategy ID:", negotiation.recommendedId);
    console.log("Recommendation Reason:", negotiation.recommendationReason);
    console.log("\n--- STRATEGIES GENERATED ---");
    ["A", "B", "C"].forEach(function (id) {
        var strat = negotiation.strategies[id];
        console.log("\nStrategy ".concat(id, ": ").concat(strat.title));
        console.log("Success Probability: ".concat(strat.successProbability, "%"));
        console.log("Cognitive Load: ".concat(strat.cognitiveLoad, "%"));
        console.log("Tradeoffs: ".concat(strat.tradeoffs));
        console.log("Explanation: ".concat(strat.explanation));
        console.log("Plan Tasks Count: ".concat(strat.plan.tasks.length));
        console.log("Plan Unplanned Count: ".concat(strat.plan.unplannedItems.length));
    });
    if (negotiation.overloadDetected && negotiation.strategies.A && negotiation.strategies.B && negotiation.strategies.C) {
        console.log("\nPASS: AI Schedule Negotiator is working as expected!");
        process.exit(0);
    }
    else {
        console.error("FAIL: Strategy properties or overload check failed.");
        process.exit(1);
    }
}
test();
