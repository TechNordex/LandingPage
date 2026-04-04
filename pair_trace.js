const fs = require('fs');
const content = fs.readFileSync('c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx', 'utf-8');
const lines = content.split('\n');
let stack = [];
for (let i = 1244-1; i < 1486-1; i++) {
    const line = lines[i];
    const opens = (line.match(/<div(?=[\s>])/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
    
    for (let p=0; p < (opens - selfCloses); p++) stack.push(i+1);
    for (let p=0; p < closes; p++) {
        if (stack.length > 0) {
            const startLine = stack.pop();
            console.log(`Open L${startLine} closed by L${i+1}`);
        } else {
            console.log(`Extra closing </div> at L${i+1}`);
        }
    }
}
console.log('Still open:', stack);
