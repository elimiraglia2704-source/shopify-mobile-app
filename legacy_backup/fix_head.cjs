const fs = require('fs');

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

// 2. Read current index.html
let txt = fs.readFileSync('index.html', 'utf8');

// 3. Fix the garbage flags section
const startTag = '<div class="h-scrollable-squares">';
const endTag = '<!-- SEZIONE 4: Prodotti High Demand -->';

const startIdx = txt.indexOf(startTag);
const nextSection = txt.indexOf(endTag);

if (startIdx !== -1 && nextSection !== -1) {
    const before = txt.substring(0, startIdx + startTag.length);
    const after = '\n        </div>\n      </div>\n\n        ' + txt.substring(nextSection);
    // Wait, <div class="h-scrollable-squares"> is inside a container or something?
    // Let's check original 8eab11d:
    // <div class="h-scrollable-squares">
    //   ... flags ...
    // </div>
    // <!-- SEZIONE 4 -->
    // So `after` should just be `\n        </div>\n\n        `
    
    txt = before + '\n' + flagsHtml + '\n        </div>\n\n        ' + txt.substring(nextSection);
}

// 4. Remove duplicate screens
function removeSecond(txt, searchStr) {
    const idx1 = txt.indexOf(searchStr);
    if (idx1 === -1) return txt;
    const idx2 = txt.indexOf(searchStr, idx1 + 1);
    if (idx2 === -1) return txt;
    
    const endIdx2 = txt.indexOf('</section>', idx2);
    if (endIdx2 !== -1) {
        return txt.substring(0, idx2) + txt.substring(endIdx2 + '</section>'.length);
    }
    return txt;
}

// screen-catalog
txt = removeSecond(txt, 'id="screen-catalog"');
// screen-betting
txt = removeSecond(txt, 'id="screen-betting"');
// screen-vip
txt = removeSecond(txt, 'id="screen-vip"');

// Wait! screen-home was duplicated too?!
// Let's check list_screens.cjs output from before:
// 190: <section class="screen active" id="screen-home">
// 723: <section class="screen active" id="screen-home">
txt = removeSecond(txt, 'id="screen-home"');

// 5. Update version
txt = txt.replace(/app\.js\?v=\d+/g, 'app.js?v=27');

fs.writeFileSync('index.html', txt);
console.log('Fixed index.html completely.');
