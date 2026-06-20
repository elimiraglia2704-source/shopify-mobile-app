const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

let depth = 0;
let inPdp = false;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('id="screen-pdp"')) {
        inPdp = true;
        depth = 0; // reset div depth for this section
    }
    
    if (inPdp) {
        const opens = (line.match(/<div/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        depth += opens;
        depth -= closes;
    }
    
    if (line.includes('</section>') && inPdp) {
        inPdp = false;
        console.log('Final div depth in PDP:', depth);
    }
}
