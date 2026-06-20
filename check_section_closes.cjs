const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const lines = txt.split('\n');

for (let i = 530; i < 650; i++) {
    if (lines[i].includes('</section>')) console.log(i + ': ' + lines[i]);
    if (lines[i].includes('<section')) console.log(i + ': ' + lines[i]);
}
