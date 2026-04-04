const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
const content = fs.readFileSync(path, 'utf-8');
const lines = content.split('\n');

// Find tab starts
const tabStarts = [];
lines.forEach((l, i) => {
    if (l.includes("activeTab === 'projects'") && l.includes('&&')) tabStarts.push({ name: 'projects', line: i + 1 });
    if (l.includes("activeTab === 'overview'") && l.includes('&&')) tabStarts.push({ name: 'overview', line: i + 1 });
    if (l.includes("activeTab === 'reports'") && l.includes('&&')) tabStarts.push({ name: 'reports', line: i + 1 });
    if (l.includes("activeTab === 'team'") && l.includes('&&')) tabStarts.push({ name: 'team', line: i + 1 });
    if (l.includes("activeTab === 'users'") && l.includes('&&')) tabStarts.push({ name: 'users', line: i + 1 });
    if (l.includes("activeTab === 'trash'") && l.includes('&&')) tabStarts.push({ name: 'trash', line: i + 1 });
    if (l.includes("activeTab === 'email'") && l.includes('&&')) tabStarts.push({ name: 'email', line: i + 1 });
});
tabStarts.sort((a, b) => a.line - b.line);
tabStarts.push({ name: 'end', line: lines.length });

console.log('Tab starts:');
tabStarts.forEach(t => console.log(` ${t.name}: L${t.line}`));
console.log('');

tabStarts.forEach((tab, index) => {
    if (index === tabStarts.length - 1) return;
    const next = tabStarts[index + 1];
    let balance = 0;
    for (let i = tab.line - 1; i < next.line - 1; i++) {
        const l = lines[i];
        const opens = (l.match(/<div(?=[\s>])/g) || []).length;
        const closes = (l.match(/<\/div>/g) || []).length;
        const sc = (l.match(/<div[^>]*\/>/g) || []).length;
        balance += (opens - sc) - closes;
    }
    const status = balance === 0 ? '✅ OK' : `❌ Balance: ${balance}`;
    console.log(`Tab: ${tab.name.padEnd(10)} L${tab.line} - L${next.line} | ${status}`);
});
