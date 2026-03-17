
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\adson.vicente_murtac\\Desktop\\Landing Page da empresa\\LandingPage\\app\\admin\\page.tsx', 'utf8');

const lines = content.split('\n');
let stack = [];
let lineNum = 0;

lines.forEach((line, index) => {
    lineNum = index + 1;
    // Simple regex for tags, ignoring self-closing and fragments
    // This is a naive parser but can help find obvious mismatches
    const opens = line.match(/<([a-zA-Z0-9]+)(?![^>]*\/)(?=[^>]*>)/g);
    const closes = line.match(/<\/([a-zA-Z0-9]+)>/g);

    if (opens) {
        opens.forEach(tag => {
            const tagName = tag.match(/<([a-zA-Z0-9]+)/)[1];
            if (tagName !== 'img' && tagName !== 'input' && tagName !== 'br' && tagName !== 'hr') {
                stack.push({ tag: tagName, line: lineNum });
            }
        });
    }

    if (closes) {
        closes.forEach(tag => {
            const tagName = tag.match(/<\/([a-zA-Z0-9]+)>/)[1];
            if (stack.length > 0) {
                const last = stack.pop();
                if (last.tag !== tagName) {
                    console.log(`Mismatch at line ${lineNum}: expected </${last.tag}> (from line ${last.line}), found ${tag}`);
                }
            } else {
                console.log(`Extra closing tag at line ${lineNum}: ${tag}`);
            }
        });
    }
});

console.log('Final stack size:', stack.length);
if (stack.length > 0) {
    console.log('Unclosed tags:');
    stack.forEach(item => console.log(`  <${item.tag}> starting at line ${item.line}`));
}
