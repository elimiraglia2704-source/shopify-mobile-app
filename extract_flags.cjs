const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const lines = txt.split('\n');
const block2 = lines.slice(508, 974);
const start = block2.findIndex(l => l.includes('Acquista per nazionale'));
console.log('Start index in block2:', start);
if (start !== -1) {
  console.log(block2.slice(start - 1, start + 25).join('\n'));
}
