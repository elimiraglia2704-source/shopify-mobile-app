const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// 1. Generate valid UTF-8 flags
const nations = [
  'Argentina', 'Arabia Saudita', 'Austria', 'Brasile', 'Cameroon', 'Colombia',
  'Colombia Goalkeeper', 'Croazia', 'Danimarca', 'Francia', 'Galles', 'Germania',
  'Giappone', 'Grecia', 'Inghilterra', 'Irlanda', 'Irlanda del Nord', 'Italia',
  'Messico', 'Nigeria', 'Norvegia', 'Olanda', 'Polonia', 'Portogallo',
  'Repubblica Ceca', 'Scozia', 'Senegal', 'Spagna', 'Spagna Goalkeeper',
  'Svezia', 'Svizzera', 'Svizzera Azzurro', 'Svizzera Gialla', 'Svizzera Rosa',
  'Turchia', 'USA', 'Ucraina', 'Ungheria', 'Uruguay'
];

const isoMap = {
  'argentina': 'ar', 'arabia saudita': 'sa', 'austria': 'at', 'brasile': 'br',
  'cameroon': 'cm', 'colombia': 'co', 'colombia goalkeeper': 'co', 'croazia': 'hr',
  'danimarca': 'dk', 'francia': 'fr', 'galles': 'gb-wls', 'germania': 'de',
  'giappone': 'jp', 'grecia': 'gr', 'inghilterra': 'gb-eng', 'irlanda': 'ie',
  'irlanda del nord': 'gb-nir', 'italia': 'it', 'messico': 'mx', 'nigeria': 'ng',
  'norvegia': 'no', 'olanda': 'nl', 'polonia': 'pl', 'portogallo': 'pt',
  'repubblica ceca': 'cz', 'scozia': 'gb-sct', 'senegal': 'sn', 'spagna': 'es',
  'spagna goalkeeper': 'es', 'svezia': 'se', 'svizzera': 'ch', 'svizzera azzurro': 'ch',
  'svizzera gialla': 'ch', 'svizzera rosa': 'ch', 'turchia': 'tr', 'usa': 'us',
  'ucraina': 'ua', 'ungheria': 'hu', 'uruguay': 'uy'
};

let flagsHtml = '';
nations.forEach(n => {
  const code = isoMap[n.toLowerCase()];
  flagsHtml += `          <div class="team-card" onclick="go('catalog'); document.getElementById('search-input').value='${n}'; document.getElementById('search-input').dispatchEvent(new Event('input'))">\n            <div class="square-bg" style="overflow:hidden; display:flex; align-items:center; justify-content:center; background:transparent; padding: 0;">\n              <img src="https://flagcdn.com/w160/${code}.png" alt="${n}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border: 2px solid #333;">\n            </div>\n            <p style="font-size: 12px; margin-top: 8px; text-align:center;">${n}</p>\n          </div>\n`;
});

// We need to restore index.html from HEAD first
const { execSync } = require('child_process');
execSync('git checkout HEAD -- index.html');
txt = fs.readFileSync('index.html', 'utf8');

// The h-scrollable-squares in HEAD might be broken.
// Wait, HEAD is broken with 3 duplicates from before.
// Actually, I should checkout the last CLEAN commit which is 3e3c607!
// Wait! `3e3c607` is HEAD!
// And in `3e3c607`, list_screens.cjs returned 3 duplicates!
// Why did 3e3c607 have 3 duplicates? Because my `fix_head.cjs` didn't run on it!
// It was `clean_inject.cjs` that created the duplicates in `v24`!
// Yes, `db6b964` (v24) had the duplicates!
// `2d248c7` (v23) HAD 2 CATALOG SCREENS!
// `067eac2` had duplicates too!
// `8eab11d` had exactly 1 of each screen.

// If `index.html` in HEAD has duplicates, I must just strip the duplicates manually.
// First, find the first screen-catalog.
const c1 = txt.indexOf('id="screen-catalog"');
// Find the SECOND screen-catalog.
const c2 = txt.indexOf('id="screen-catalog"', c1 + 1);

// Wait! If I just extract the flags from 8eab11d and the REST of HEAD?
// Better: in HEAD, just remove the SECOND screen-catalog, SECOND screen-betting, SECOND screen-vip.
// And replace the FIRST h-scrollable-squares content with flagsHtml!

// Remove second screen-catalog
if (c2 !== -1) {
    const endC2 = txt.indexOf('</section>', c2);
    txt = txt.substring(0, c2) + txt.substring(endC2 + '</section>'.length);
}

// Remove second screen-betting
const b1 = txt.indexOf('id="screen-betting"');
const b2 = txt.indexOf('id="screen-betting"', b1 + 1);
if (b2 !== -1) {
    const endB2 = txt.indexOf('</section>', b2);
    txt = txt.substring(0, b2) + txt.substring(endB2 + '</section>'.length);
}

// Remove second screen-vip
const v1 = txt.indexOf('id="screen-vip"');
const v2 = txt.indexOf('id="screen-vip"', v1 + 1);
if (v2 !== -1) {
    const endV2 = txt.indexOf('</section>', v2);
    txt = txt.substring(0, v2) + txt.substring(endV2 + '</section>'.length);
}

// Now replace h-scrollable-squares
const startTag = '<div class="h-scrollable-squares">';
const startIdx = txt.indexOf(startTag);
if (startIdx !== -1) {
    // Find the closing </div> of h-scrollable-squares.
    // In HEAD, the content might be empty or garbage.
    // Let's just find the first </div> AFTER startIdx.
    // Actually, in HEAD it was just empty: <div class="h-scrollable-squares">\n\n        </div>\n    </section>\n
    // Let's just use regex to replace everything inside h-scrollable-squares until the next </div>
    const before = txt.substring(0, startIdx + startTag.length);
    const endIdx = txt.indexOf('</div>', startIdx);
    const after = txt.substring(endIdx);
    
    txt = before + '\n' + flagsHtml + '\n' + after;
}

// Update version
txt = txt.replace(/app\.js\?v=\d+/g, 'app.js?v=28');

fs.writeFileSync('index.html', txt);
console.log('Fixed index.html cleanly');
