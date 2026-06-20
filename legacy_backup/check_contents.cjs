const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('index.html', 'utf8'));

console.log('Profile HTML:', $('#screen-profile').html()?.trim()?.substring(0, 100));
console.log('Studio HTML:', $('#screen-studio').html()?.trim()?.substring(0, 100));
