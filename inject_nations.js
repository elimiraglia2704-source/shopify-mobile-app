import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const newBlock = fs.readFileSync('new_nations.html', 'utf8');

const startTag = '<div class="h-scrollable-squares">';
const startIndex = html.indexOf(startTag);
// find the matching end tag for this div. Since it's the </div> after the Inghilterra block
const endIndex = html.indexOf('</div>', html.indexOf('<p>Inghilterra</p>')) + 6;

const newHtml = html.substring(0, startIndex) + newBlock.trim() + '\n' + html.substring(endIndex);

fs.writeFileSync('index.html', newHtml);
console.log('index.html updated successfully.');
