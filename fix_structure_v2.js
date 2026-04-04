const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

// 1. Fix Overview (L1244-1484)
// Find the block end specifically around 1480-1485
let overviewEndParen = -1;
for (let i = 1475; i < 1500; i++) {
    if (lines[i].includes(')}')) {
        overviewEndParen = i;
        break;
    }
}

if (overviewEndParen !== -1) {
    console.log('Found overview end at L' + (overviewEndParen + 1));
    // Move the )} after the next three </div>
    // Let's find the 3 divs
    let divs = [];
    for (let j = overviewEndParen + 1; j < overviewEndParen + 10; j++) {
        if (lines[j].includes('</div>')) divs.push(j);
        if (divs.length === 3) break;
    }
    
    if (divs.length === 3) {
        console.log('Found 3 divs after overview paren');
        const parenLine = lines[overviewEndParen];
        lines.splice(overviewEndParen, 1); // remove paren line
        lines.splice(divs[2], 0, parenLine); // insert paren line after the 3rd div (splice at divs[2] moves things down, so after the 3rd div)
        // Wait, splice(divs[2], 0, ...) inserts BEFORE divs[2].
        // I want it AFTER the 3rd div.
    }
}

// Rewriting a safer version of the script
function shiftClosureDown(tabStartLine, numDivs) {
    let lines = fs.readFileSync(path, 'utf-8').split('\n');
    let searchStart = tabStartLine + 100; // Skip the start
    let parenIndex = -1;
    for(let i=searchStart; i<lines.length; i++) {
        if (lines[i].includes(')}')) {
            // Make sure it's the tab closure, not a map closure
            // For admin page tabs, the closure is usually followed by a blank line or the next tab
            if (i > searchStart && (lines[i+1].includes('activeTab ===') || lines[i+1].trim() === '')) {
                parenIndex = i;
                break;
            }
        }
    }
    
    if (parenIndex !== -1) {
        console.log(`Found tab closure at L${parenIndex+1}`);
    }
}

// Actually, I'll just use a simpler replacement that respects whitespace better
// by reading the file content and using a regex with \s*
content = fs.readFileSync(path, 'utf-8');

// Fix Overview
content = content.replace(
    /<\/div>\s*\}\)\s*<\/div>\s*<\/div>\s*<\/div>/,
    "</div></div></div></div>)}"
);
// This is still risky.

// Let's try the line-by-line splice again but more carefully.
lines = fs.readFileSync(path, 'utf-8').split('\n');
// Overview (1244)
// Find L1480-1484 area.
// Original:
// 1480: </div>
// 1481: )}
// 1482: </div>
// 1483: </div>
// 1484: </div>
if (lines[1480].includes('</div>') && lines[1481].includes(')}')) {
    const paren = lines[1481];
    lines.splice(1481, 1); // remove L1481
    lines.splice(1483, 0, paren); // insert BEFORE the line that was L1485 (now L1484)
    console.log('Fixed Overview boundaries');
}

// Projects (1486)
// Find L2087-2088
// Original:
// 2087: </div>
// 2088: )}
// Need two </div>
if (lines[2087].includes('</div>') && lines[2088].includes(')}')) {
    lines.splice(2088, 0, '                </div>');
    console.log('Fixed Projects boundaries');
}

// Users (2381)
// Original:
// 2381: {activeTab === 'users' && (
// 2382: </div>
// 2383: <div className="animate-fade-in ...">
if (lines[2381].includes('activeTab === \'users\'') && lines[2382].includes('</div>')) {
    lines[2382] = '                    <div className="flex-1 p-5 lg:p-8 overflow-y-auto custom-scrollbar flex flex-col">';
    console.log('Fixed Users start and added wrapper');
}

// Users end (now moved down by 1 line)
// Original end was 2466, 2467. After splicing one at 2088, it's 2467, 2468.
// After changing 2382, line count is same.
// So 2467, 2468
if (lines[2467].includes('</div>') && lines[2468].includes(')}')) {
    lines.splice(2468, 0, '                </div>');
    console.log('Fixed Users end boundaries');
}

fs.writeFileSync(path, lines.join('\n'));
