const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/app';
const componentsDir = 'c:/Users/adson.vicente_murtac/Desktop/Landing Page da empresa/LandingPage/components';

const maps = [
    // Double encoding mappings using Unicode escapes for safety
    { from: /\u00C3\u00A1/g, to: 'á' },
    { from: /\u00C3\u00A9/g, to: 'é' },
    { from: /\u00C3\u00AD/g, to: 'í' },
    { from: /\u00C3\u00B3/g, to: 'ó' },
    { from: /\u00C3\u00BA/g, to: 'ú' },
    { from: /\u00C3\u00A3/g, to: 'ã' },
    { from: /\u00C3\u00B5/g, to: 'õ' },
    { from: /\u00C3\u00A7/g, to: 'ç' },
    { from: /\u00C3\u00AA/g, to: 'ê' },
    { from: /\u00C3\u00B4/g, to: 'ô' },
    { from: /\u00C3\u00A2/g, to: 'â' },
    { from: /\u00C3\u00BB/g, to: 'û' },
    { from: /\u00C3\u00AE/g, to: 'î' },
    { from: /\u00C3\u0080/g, to: 'À' },
    { from: /\u00C3\u0081/g, to: 'Á' },
    { from: /\u00C3\u008D/g, to: 'Í' },
    { from: /\u00C3\u0093/g, to: 'Ó' },
    { from: /\u00C3\u009A/g, to: 'Ú' },
    { from: /\u00C3\u0094/g, to: 'Ô' },
    { from: /\u00C3\u0087/g, to: 'Ç' },
    { from: /\u00C3\u00A0/g, to: 'à' },

    // Stubborn triple encoding or special sequences
    { from: /\u00C3\u00A1\u0192 TICO/g, to: 'Í TICO' }, // AVISO CRÍTICO case
    { from: /\u00C3\u0083\u00C2\u00A3/g, to: 'ã' }, // Triple ã
    { from: /\u00C3\u0083\u00C2\u00A7/g, to: 'ç' }, // Triple ç
    { from: /\u00C3\u0083\u00C2\u00A1/g, to: 'á' }  // Triple á
];

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const map of maps) {
                content = content.replace(map.from, map.to);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed: ${fullPath}`);
            }
        }
    }
}

processDir(rootDir);
processDir(componentsDir);
console.log('Done.');
