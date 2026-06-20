const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const block3 = lines.slice(974);
console.log('Block 3 length:', block3.length);
let hasFlags = false;
let hasCatalog = false;
let hasBottomNav = false;
block3.forEach((l, i) => {
  if (l.includes('Acquista per nazionale')) hasFlags = true;
  if (l.includes('id=\"screen-catalog\"')) hasCatalog = true;
  if (l.includes('bottom-nav')) hasBottomNav = true;
});
console.log('hasFlags:', hasFlags, 'hasCatalog:', hasCatalog, 'hasBottomNav:', hasBottomNav);
