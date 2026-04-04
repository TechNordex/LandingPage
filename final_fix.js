const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let lines = fs.readFileSync(path, 'utf-8').split('\n');

// 1. Fix lucide-react imports (add PieChart, CalendarDays)
for (let i = 0; i < 50; i++) {
    if (lines[i].includes('lucide-react') && !lines[i].includes('PieChart')) {
        // Look for the last line before '}'
        for (let j = i; j > 0; j--) {
            if (lines[j].includes('LayoutDashboard')) {
                lines[j] = lines[j].replace('Check, Code', 'Check, Code, PieChart, CalendarDays');
                console.log('Fixed imports');
                break;
            }
        }
    }
}

// 2. Fix Overview (L1244 start, end around 1481)
// We need to move )} from its current location to after the 3 divs.
// Let's find it.
let foundOverviewParen = -1;
for (let i = 1470; i < 1500; i++) {
    if (lines[i].trim() === ')}' && lines[i-1].includes('</div>')) {
        foundOverviewParen = i;
        break;
    }
}
if (foundOverviewParen !== -1) {
    const paren = lines[foundOverviewParen];
    lines.splice(foundOverviewParen, 1);
    // Now lines are shifted. The 3 divs are now at foundOverviewParen, +1, +2.
    // Insert after the 3rd div.
    lines.splice(foundOverviewParen + 3, 0, paren);
    console.log('Fixed Overview tab ending');
}

// 3. Fix Projects (L2087-2088)
// Need one more </div> before )}
// But the line numbers might have shifted. Let's search for the end of projects.
let foundProjectsParen = -1;
for (let i = 2000; i < 2200; i++) {
    if (lines[i].includes(')}' ) && lines[i+2] && lines[i+2].includes('reports')) {
        foundProjectsParen = i;
        break;
    }
}
if (foundProjectsParen !== -1) {
    lines.splice(foundProjectsParen, 0, '                    </div>');
    console.log('Fixed Projects tab ending');
}

// 4. Fix Users (L2467-2468)
// Need one more </div> before )}
let foundUsersParen = -1;
for (let i = 2400; i < 2600; i++) {
    if (lines[i].includes(')}' ) && lines[i+2] && lines[i+2].includes('trash')) {
        foundUsersParen = i;
        break;
    }
}
if (foundUsersParen !== -1) {
    lines.splice(foundUsersParen, 0, '                </div>');
    console.log('Fixed Users tab ending');
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Final repair script finished.');
