
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\adson.vicente_murtac\\Desktop\\Landing Page da empresa\\LandingPage\\app\\admin\\page.tsx', 'utf8');

const lines = content.split('\n');
let depth = 0;
let results = [];

lines.forEach((line, index) => {
    const lineNum = index + 1;
    // Count openings
    const opens = (line.match(/<div(?![^>]*\/)(?=[^>]*>)/g) || []).filter(tag => {
        // Skip some standard tags if they are div-like (already matched specifically for div here)
        return true;
    }).length;

    // Count closures
    const closes = (line.match(/<\/div>/g) || []).length;

    const prevDepth = depth;
    depth += opens - closes;
    if (depth !== prevDepth) {
        results.push({ lineNum, opens, closes, depth, content: line.trim() });
    }
});

// Print the last 10 changes and any negative depths
console.log('Depth changes detected. Final depth:', depth);
if (depth !== 0) {
    console.log('Error: Mismatched tags!');
}

results.filter(r => r.depth < 0).forEach(r => console.log(`Negative depth at line ${r.lineNum}: ${r.depth}`));

// Show the trace around the end of each section
const checkpoints = [1000, 1397, 1622, 1690, 1805, 2336];
checkpoints.forEach(cp => {
    const nearest = results.filter(r => r.lineNum <= cp).pop();
    if (nearest) {
        console.log(`Depth at line ${cp} (approx): ${nearest.depth} (Content: ${nearest.content})`);
    }
});
