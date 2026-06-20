const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');

const s1 = txt.indexOf('id="screen-studio"');
console.log('Studio contents:', txt.substring(s1, s1 + 1000));

const s2 = txt.indexOf('id="screen-profile"');
console.log('Profile contents:', txt.substring(s2, s2 + 1000));
