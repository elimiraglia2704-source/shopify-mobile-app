const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<section/g) || []).length;
    const closes = (line.match(/<\/section>/g) || []).length;
    
    depth += opens;
    depth -= closes;
    
    if (opens > 0 || closes > 0) {
        console.log(`Line ${i}: opens=${opens}, closes=${closes}, depth=${depth} -> ${line.trim()}`);
    }
}
