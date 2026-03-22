const fs = require('fs');
const path = require('path');

const replacements = {
    'Ã¡Æ’ TICO': 'Í TICO',
    'áÆ’': 'Í', 
    'aÃ§Ã£o': 'ação',
    'nÃ£o': 'não',
    'serÃ£o': 'serão',
    'diÃ¡rios': 'diários',
    'atualizaÃ§Ãµes': 'atualizações',
    'anotaÃ§Ãµes': 'anotações',
    'vocÃª': 'você',
    'estÃ¡': 'está',
    'ficarÃ¡': 'ficará',
    'visÃ­vel': 'visível',
    'exclusÃ£o': 'exclusão',
    'primÃ¡rios': 'primários',
    'serÃ¡': 'será',
    'emissÃ£o': 'emissão',
    'indivÃ­duo': 'indivíduo',
    'atribuiÃ§Ã£o': 'atribuição',
    'usuÃ¡rio': 'usuário',
    'gestÃ£o': 'gestão',
    'remoÃ§Ã£o': 'remoção',
    'poderÃ¡': 'poderá',
    'histÃ³ricos': 'históricos',
    'relatÃ³rios': 'relatórios',
    'eficiÃªncia': 'eficiência',
    'mÃ©tricas': 'métricas',
    'saÃºde': 'saúde',
    'operaÃ§Ãµes': 'operações',
    'atÃ©': 'até',
    'inÃ­cio': 'início',
    'duraÃ§Ã£o': 'duração',
    'conclusÃ£o': 'conclusão',
    'relaÃ§Ã£o': 'relação',
    'produÃ§Ã£o': 'produção',
    'perÃ­odo': 'período',
    'padrÃ£o': 'padrão',
    'pÃºblicas': 'públicas',
    'informaÃ§Ãµes': 'informações',
    'aprovaÃ§Ã£o': 'aprovação',
    'revisÃ£o': 'revisão',
    'decisÃ£o': 'decisão',
    'pipeline': 'pipeline',
    'estrutural': 'estrutural',
    'estÃ£o': 'estão',
    'avanÃ§a': 'avança',
    'novidades': 'novidades',
    'registradas': 'registradas',
    'serviÃ§os': 'serviços',
    'soluÃ§Ãµes': 'soluções',
    'TecnolÃ³gicas': 'Tecnológicas',
    'atenciosamente': 'atenciosamente',
    'equipe': 'equipe',
    'notÃ­cias': 'notícias',
    'prÃ³ximos': 'próximos',
    'passos': 'passos',
    'reuniÃ£o': 'reunião',
    'horÃ¡rio': 'horário',
    'disponÃ­vel': 'disponível',
    'confirmaÃ§Ã£o': 'confirmar',
    'atenÃ§Ã£o': 'atenção',
    'Ã­cone': 'ícone',
    'Ã­cones': 'ícones',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã®': 'î',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã£': 'ã',
    'Ãµ': 'õ',
    'Ã§': 'ç',
    'Ã€': 'À',
    'Ã ': 'Á',
    'Ãš': 'Ú',
    'Áš': 'Ú',
    'Ã‰': 'É',
    'Ã“': 'Ó',
    'Ã‡': 'Ç',
    'Ãƒ': 'Ã',
    'â—': '·',
    'â€"': '—',
    'â€¦': '...',
    'â€”': '—',
    '€”': '—',
    '€¦': '...',
    '”€”€': '──',
    'â”€': '─',
    'á¢€ ‚¬á¢€ ‚¬': '─────',
    'Ášltima': 'Última',
    '”€': '—'
};

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            console.log(`Processing ${fullPath}...`);
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const [key, val] of Object.entries(replacements)) {
                content = content.split(key).join(val);
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed encoding for ${fullPath}`);
            }
        }
    }
}

const rootDir = process.cwd();
processDir(path.join(rootDir, 'app'));
processDir(path.join(rootDir, 'components'));
processDir(path.join(rootDir, 'hooks'));
processDir(path.join(rootDir, 'lib'));

console.log("Encoding fix complete.");
