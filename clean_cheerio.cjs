const fs = require('fs');
const cheerio = require('cheerio');

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
  flagsHtml += `\n          <div class="team-card" onclick="go('catalog'); document.getElementById('search-input').value='${n}'; document.getElementById('search-input').dispatchEvent(new Event('input'))">\n            <div class="square-bg" style="overflow:hidden; display:flex; align-items:center; justify-content:center; background:transparent; padding: 0;">\n              <img src="https://flagcdn.com/w160/${code}.png" alt="${n}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border: 2px solid #333;">\n            </div>\n            <p style="font-size: 12px; margin-top: 8px; text-align:center;">${n}</p>\n          </div>`;
});
flagsHtml += '\n        ';

const { execSync } = require('child_process');
execSync('git checkout HEAD -- index.html');

let txt = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(txt, { xmlMode: false, decodeEntities: false });

// 2. Remove duplicates
// Keep the FIRST screen-home, screen-catalog, screen-betting, screen-vip
// Wait, the flags are actually in the SECOND screen-catalog?!
// No, the FIRST screen-catalog has the flags!
// Actually, let's just find duplicates and remove them.
const removeDup = (id) => {
    const elems = $(`#${id}`);
    if (elems.length > 1) {
        for (let i = 1; i < elems.length; i++) {
            $(elems[i]).remove();
        }
    }
};

removeDup('screen-home');
removeDup('screen-catalog');
removeDup('screen-betting');
removeDup('screen-vip');

// 3. Inject flags
$('.h-scrollable-squares').first().html(flagsHtml);

// 4. Update script tag
let finalHtml = $.html();
finalHtml = finalHtml.replace(/app\.js\?v=\d+/g, 'app.js?v=29');

fs.writeFileSync('index.html', finalHtml);
console.log('Fixed using cheerio.');
