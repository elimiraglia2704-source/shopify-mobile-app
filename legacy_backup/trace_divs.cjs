const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    
    depth += opens;
    depth -= closes;
    
    if (line.includes('id="screen-catalog"')) console.log(`--- CATALOG at ${i}, depth=${depth} ---`);
    if (line.includes('id="screen-pdp"')) console.log(`--- PDP at ${i}, depth=${depth} ---`);
    if (line.includes('id="screen-profile"')) console.log(`--- PROFILE at ${i}, depth=${depth} ---`);
}
console.log('Final div depth:', depth);
