const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

// Part 1: Start to just before the first "Acquista per nazionale"
const idx1 = lines.findIndex(l => l.includes('<!-- SEZIONE 3: Acquista per nazionale -->'));
const part1 = lines.slice(0, idx1);

// Part 2: The circular flags
// Find the second occurrence of "Acquista per nazionale"
const idx2 = lines.findIndex((l, i) => i > idx1 && l.includes('<!-- SEZIONE 3: Acquista per nazionale -->'));
// Find the end of this section (it ends after Italia's team-card closing div + two more closing divs)
// A safe way is to find the next "</div>" after "Italia" in block2.
let idxEndFlags = lines.findIndex((l, i) => i > idx2 && l.includes('Italia</p>'));
while (idxEndFlags < lines.length && !lines[idxEndFlags].includes('</div>')) idxEndFlags++;
// The structure has two more closing divs. Let's just find the closing tags carefully.
// team-card closes. Then h-scrollable-squares closes. Then home-section closes.
const part2 = lines.slice(idx2, idxEndFlags + 5);

// Part 3: From the footer note of the LAST screen-home to the end of the file
const lastFooterIdx = lines.findLastIndex(l => l.includes('<p class="home-footer-note">'));
const part3 = lines.slice(lastFooterIdx);

const newHtml = [...part1, ...part2, ...part3].join('\n');
fs.writeFileSync('index_clean.html', newHtml, 'utf8');
console.log('Successfully stitched index_clean.html');
console.log('Part 1 lines:', part1.length);
console.log('Part 2 lines:', part2.length);
console.log('Part 3 lines:', part3.length);
console.log('Total lines:', part1.length + part2.length + part3.length);
