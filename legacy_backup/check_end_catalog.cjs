const { execSync } = require('child_process');
const txt = execSync('git show 8eab11d:index.html', { encoding: 'utf8' });
const catalogStart = txt.indexOf('id="screen-catalog"');
const catalogEnd = txt.indexOf('</section>', catalogStart);
console.log(txt.substring(catalogEnd - 500, catalogEnd + 20));
