const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    const replacements = {
        'á¢‚¬€': '—',
        // Update old tab nomenclature dynamically
        'Visáo Geral': 'Geral',
        'Esteiras & Diários': 'Esteiras de desenvolvimento',
    };

    let changed = false;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }
    
    // Also change exact words for 'Emails' -> 'Configuração de Emails' where it's a tab title
    if (content.match(/<h2[^>]*>Emails<\/h2>/)) {
        content = content.replace(/(<h2[^>]*>)Emails(<\/h2>)/, '$1Configuração de Emails$2');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

const filesToFix = [
    'app/admin/page.tsx', 
    'app/dashboard/page.tsx', 
    'app/login/page.tsx',
    'app/api/auth/login/route.ts'
];

filesToFix.forEach(file => {
    fixFile(path.join(process.cwd(), file));
});
