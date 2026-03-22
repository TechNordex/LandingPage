const fs = require('fs');
const path = require('path');

const replacements = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã£': 'ã', 'Ãµ': 'õ', 'Ã§': 'ç', 'Ãª': 'ê', 'Ã¢': 'â',
    'Ã´': 'ô', 'Ã»': 'û', 'Ã®': 'î', 'Ã ': 'À', 'Ã': 'Á',
    'Á³': 'ó', 'Á§': 'ç', 'Áµ': 'õ', 'Á¡': 'á', 'Áª': 'ê',
    'Á§Á³': 'ção', 'Á‡': 'Ç', 'Á•': 'Õ', 'Áƒ': 'Ã', 'Á‰': 'É',
    'Á ': 'À', 'Á\u00A0': 'à', 'á§áo': 'ação', 'decisáo': 'decisão',
    'Restriá§áo': 'Restrição', 'atualizaá§áo': 'atualização',
    'observaá§áµes': 'observações', 'estáo': 'estão', 'vocáª': 'você',
    'poderá¡': 'poderá', 'lá³gicas': 'lógicas', 'reproduá§áo': 'reprodução',
    'proteá§áo': 'proteção', 'aprovaá§áo': 'aprovação',
    'Histá³rico': 'Histórico', 'Atualizaá§áµes': 'Atualizações',
    'Nenhuma atualizaá§áo': 'Nenhuma atualização',
    'está¡ sendo': 'está sendo', 'Bem-vindo á\u00A0': 'Bem-vindo à ',
    'dáºvidas': 'dúvidas', 'referáªncia': 'referência',
    'ESFORÁ‡O': 'ESFORÇO', 'ATUALIZAÁ‡Á•ES': 'ATUALIZAÇÕES',
    'REGRAS LÁ“GICAS': 'REGRAS LÓGICAS'
};

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
            fixFile(fullPath);
        }
    });
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    let changed = false;

    for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

console.log('Starting global encoding fix...');
walk(path.join(process.cwd(), 'app'));
walk(path.join(process.cwd(), 'components'));
walk(path.join(process.cwd(), 'lib'));
console.log('Finished.');
