const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Exactly as seen in view_file tool output
    const replacements = {
        'Histá³rico e Atualizaá§áµes': 'Histórico e Atualizações',
        'Nenhuma atualizaá§áo ainda.': 'Nenhuma atualização ainda.',
        'observaá§áµes': 'observações',
        'avaná§a': 'avança',
        'seráo': 'serão',
        'restriá§áo': 'restrição',
        'dáºvidas': 'dúvidas',
        'referáªncia': 'referência',
        'observaá§áo': 'observação',
        'Observaá§áo': 'Observação',
        'Bem-vindo á  Nordex!': 'Bem-vindo à Nordex!',
        'está¡ sendo preparado': 'está sendo preparado',
        'vocáª': 'você',
        'poderá¡': 'poderá',
        'aprovaá§áo': 'aprovação',
        'lá³gicas': 'lógicas',
        'reproduá§áo': 'reprodução',
        'estáo': 'estão',
        'proteá§áo': 'proteção',
        'dáºvidas, feedback': 'dúvidas, feedback'
    };

    let changed = false;
    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

fixFile(path.join(process.cwd(), 'app/dashboard/page.tsx'));
