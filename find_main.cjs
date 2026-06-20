const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('</main>')) console.log(i + ': ' + l);
  if (l.includes('id="screen-studio"')) console.log(i + ': ' + l);
  if (l.includes('id="screen-profile"')) console.log(i + ': ' + l);
});
