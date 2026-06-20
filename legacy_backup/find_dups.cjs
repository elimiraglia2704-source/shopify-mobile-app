const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('pwa-banner-actions')) console.log('pwa-banner-actions at ' + i);
  if (l.includes('bottom-nav')) console.log('bottom-nav at ' + i);
  if (l.includes('app-shell')) console.log('app-shell at ' + i);
});
