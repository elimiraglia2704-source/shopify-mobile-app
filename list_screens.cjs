const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('<section class="screen"')) console.log(i + ': ' + l.trim());
  if (l.includes('<section class="screen active"')) console.log(i + ': ' + l.trim());
});
