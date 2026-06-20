const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

for (let i = 536; i < 608; i++) {
    if (lines[i].includes('h-scrollable-squares')) console.log('Found h-scrollable-squares in catalog 2 at line', i);
}

for (let i = 231; i < 536; i++) {
    if (lines[i].includes('h-scrollable-squares')) console.log('Found h-scrollable-squares in catalog 1 at line', i);
}
