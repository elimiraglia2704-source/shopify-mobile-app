const fs = require('fs');
const { execSync } = require('child_process');

execSync('git checkout HEAD -- index.html');
const txt = fs.readFileSync('index.html', 'utf8');

// The best way to fix this completely is to take HEAD's index.html,
// find the DUPLICATE screen-catalog, screen-betting, screen-vip, and REMOVE them cleanly.
// Then replace the flags inside the FIRST screen-catalog.
// I will use cheerio.
