
// Mocking the function from dashboard-client.tsx to test it in isolation
function parseBenchmark_Current(benchmarkStr) {
    if (!benchmarkStr || benchmarkStr === '-') return null
    try {
        // This is the logic currently in the file (lines 36-39)
        const parts = benchmarkStr.replace(/[^\d.\-]/g, ' ').trim().split(/\s+-\s+|\s+/)
        if (parts.length === 2) {
            return { min: parseFloat(parts[0]), max: parseFloat(parts[1]) }
        }
    } catch (e) {
        return null
    }
    return null
}

function parseBenchmark_Proposed(benchmarkStr) {
    if (!benchmarkStr || benchmarkStr === '-') return null
    try {
        // Proposed new logic
        const parts = benchmarkStr
            .replace(/[^\d.\-]/g, ' ')
            .split(/[\s-]+/)
            .filter(part => part.trim() !== '')

        if (parts.length === 2) {
            return { min: parseFloat(parts[0]), max: parseFloat(parts[1]) }
        }
    } catch (e) {
        return null
    }
    return null
}

const testCases = [
    { input: "0.35-0.55%", description: "Standard range with percent, no spaces (FAILING CASE)" },
    { input: "0.35 - 0.55%", description: "Range with spaces" },
    { input: "$1.20-$2.50", description: "Currency range, no spaces" },
    { input: "$1.20 - $2.50", description: "Currency range with spaces" },
    { input: "5-10", description: "Simple integer range" },
    { input: "-", description: "Dash/Empty" },
    { input: "", description: "Empty string" }
];

console.log("--- Testing Current Logic ---");
testCases.forEach(tc => {
    const result = parseBenchmark_Current(tc.input);
    console.log(`Input: "${tc.input}" (${tc.description})`);
    console.log(`Parsed: ${JSON.stringify(result)}`);
    console.log("--------------------------------");
});

console.log("\n\n--- Testing Proposed Logic ---");
testCases.forEach(tc => {
    const result = parseBenchmark_Proposed(tc.input);
    console.log(`Input: "${tc.input}" (${tc.description})`);
    console.log(`Parsed: ${JSON.stringify(result)}`);
    console.log("--------------------------------");
});
