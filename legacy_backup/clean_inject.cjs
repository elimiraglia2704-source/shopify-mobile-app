const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');
const flagsHtml = fs.readFileSync('flags.html', 'utf8');

const startTag = '<div class="h-scrollable-squares">';
const startIdx = txt.indexOf(startTag);

// In the clean index.html, the h-scrollable-squares ends before the next section 
// "<!-- SEZIONE 4: Prodotti High Demand -->"
// So we can find that exact string!
const nextSection = txt.indexOf('<!-- SEZIONE 4: Prodotti High Demand -->');

// We want to keep <div class="h-scrollable-squares"> and end with </div> before SEZIONE 4
const before = txt.substring(0, startIdx + startTag.length);
const after = '\n        </div>\n\n        ' + txt.substring(nextSection);

let newHtml = before + '\n' + flagsHtml + after;

// Bump version
newHtml = newHtml.replace('app.js?v=19', 'app.js?v=26');

fs.writeFileSync('index.html', newHtml);
console.log('Successfully injected into clean index.html');
