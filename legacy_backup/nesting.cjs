const fs = require('fs');
const txt = fs.readFileSync('index.html', 'utf8');

const profileStart = txt.indexOf('id="screen-profile"');
const sub = txt.substring(0, profileStart);

let divIn = (sub.match(/<div/g) || []).length;
let divOut = (sub.match(/<\/div>/g) || []).length;
let secIn = (sub.match(/<section/g) || []).length;
let secOut = (sub.match(/<\/section>/g) || []).length;

console.log('Divs:', divIn, divOut, 'Diff:', divIn - divOut);
console.log('Sections:', secIn, secOut, 'Diff:', secIn - secOut);

// Let's trace section depth
let sectionDepth = 0;
let lastUnclosedSection = -1;
let openSections = [];

// A simpler way: we just want to know if screen-profile is inside screen-catalog.
// Find the first screen-catalog.
const cat1 = txt.indexOf('id="screen-catalog"');
if (cat1 !== -1 && cat1 < profileStart) {
    const endCat1 = txt.indexOf('</section>', cat1);
    console.log('First screen-catalog ends at:', endCat1, 'profile starts at:', profileStart);
}
