const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// 1. Replace flags
const flagsHtml = fs.readFileSync('flags.html', 'utf8');
const startTag = '<div class="h-scrollable-squares">';
const endTag = '<!-- SEZIONE 4: Prodotti High Demand -->';

const startIdx = txt.indexOf(startTag);
const nextSection = txt.indexOf(endTag);

const before = txt.substring(0, startIdx + startTag.length);
const after = '\n        </div>\n\n        ' + txt.substring(nextSection);

txt = before + '\n' + flagsHtml + after;

// 2. Remove duplicate betting and vip screens
// We know from list_screens.cjs that betting is at 702 and 970.
// Let's just find the second betting screen and second vip screen and delete them.
// They are inside <main> presumably.
const b1 = txt.indexOf('id="screen-betting"');
const b2 = txt.indexOf('id="screen-betting"', b1 + 1);
if (b2 !== -1) {
    const endB2 = txt.indexOf('</section>', b2);
    txt = txt.substring(0, b2) + txt.substring(endB2 + '</section>'.length);
}

const v1 = txt.indexOf('id="screen-vip"');
const v2 = txt.indexOf('id="screen-vip"', v1 + 1);
if (v2 !== -1) {
    const endV2 = txt.indexOf('</section>', v2);
    txt = txt.substring(0, v2) + txt.substring(endV2 + '</section>'.length);
}

// 3. Update app.js version
txt = txt.replace(/app\.js\?v=\d+/g, 'app.js?v=26');

fs.writeFileSync('index.html', txt);
console.log('Fixed clean index.html');
