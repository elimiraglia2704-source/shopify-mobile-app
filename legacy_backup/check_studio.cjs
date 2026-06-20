const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
console.log('Length:', txt.length);
const start = txt.indexOf('id="screen-studio"');
console.log(txt.substring(start, start + 1000));
