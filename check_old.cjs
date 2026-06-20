const fs = require('fs');
console.log('42656cb count:', fs.readFileSync('old42.html', 'utf8').split('app-shell').length - 1);
