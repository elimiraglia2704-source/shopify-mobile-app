const { execSync } = require('child_process');
const txt = execSync('git show 2d248c7:index.html', { encoding: 'utf8' });
console.log('Length:', txt.length);
console.log('Catalog screens:', txt.split('id="screen-catalog"').length - 1);
