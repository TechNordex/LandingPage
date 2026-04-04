const fs = require('fs');
const path = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Remove the Fragment <> wrapper from Projects tab (line ~1488)
// Replace: {activeTab === 'projects' && (\n                    <>\n  with just the expression
content = content.replace(
  "{activeTab === 'projects' && (\n                    <>\n                    <div",
  "{activeTab === 'projects' && (\n                    <div"
);

// Fix 2: Also find the closing </> of the projects fragment before Reports tab
// The fragment close would appear just before the reports tab comment
const reportsSep = '\n            {/* TAB: Relatórios Profissionais */}';
const idx = content.indexOf(reportsSep);
if (idx !== -1) {
  // Look back from idx to find if there's a stray </> 
  const before = content.slice(idx - 300, idx);
  console.log('Before reports separator:', JSON.stringify(before));
}

fs.writeFileSync(path, content);
console.log('Fix 1 applied. Done.');
