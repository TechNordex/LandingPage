const fs = require('fs');
const content = fs.readFileSync('c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx', 'utf-8');
const lines = content.split('\n');
let stack = [];
for(let i=813; i<=1155; i++) {
  const line = lines[i];
  const opens = (line.match(/<div[ >]/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  for(let p=0;p<opens;p++) stack.push(i+1);
  for(let p=0;p<closes;p++) stack.pop();
}
console.log('Open divs length', stack.length, stack.join(', '));
