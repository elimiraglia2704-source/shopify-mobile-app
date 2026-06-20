const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
const start = txt.indexOf('Acquista per nazionale');
const end = txt.indexOf('</section>', start);
const sub = txt.substring(start, end);
console.log('Number of flags:', sub.split('class="team-card"').length - 1);
const brasileStart = sub.indexOf('Brasile');
console.log('Contains Brasile?', brasileStart !== -1);
