const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
const content = fs.readFileSync(path, 'utf-8');
const lines = content.split('\n');

let d = 0; // div
let p = 0; // paren

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div(?=[\s>])/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    const pOpens = (line.match(/\(/g) || []).length;
    const pCloses = (line.match(/\)/g) || []).length;
    
    // Ignore self-closing divs
    const selfCloses = (line.match(/<div[^>]*\/>/g) || []).length;
    
    d += (opens - selfCloses) - closes;
    p += pOpens - pCloses;
    
    if (line.includes('activeTab ===')) {
        console.log(`${(i+1).toString().padStart(4)} | div: ${d.toString().padStart(2)} | paren: ${p.toString().padStart(2)} | ${line.trim()}`);
    }
}
