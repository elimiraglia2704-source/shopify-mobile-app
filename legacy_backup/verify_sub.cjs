const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');
let sub = txt.substring(txt.indexOf('<!-- ── CATALOGO ── -->'), txt.indexOf('id="screen-profile"'));
console.log(sub.match(/<section/g));
console.log(sub.match(/<\/section>/g));
