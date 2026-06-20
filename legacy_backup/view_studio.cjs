const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('index.html', 'utf8'));
console.log($('#screen-studio').html());
console.log($('#screen-profile').html());
