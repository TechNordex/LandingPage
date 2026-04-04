const fs = require('fs');
const content = fs.readFileSync('tsc_output.txt', 'utf16le');
fs.writeFileSync('tsc_output_utf8.txt', content, 'utf8');
