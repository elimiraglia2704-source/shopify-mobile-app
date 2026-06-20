const fs = require('fs');
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

let html = '';
nations.forEach(n => {
  const code = isoMap[n.toLowerCase()];
  html += `          <div class="team-card" onclick="go('catalog'); document.getElementById('search-input').value='${n}'; document.getElementById('search-input').dispatchEvent(new Event('input'))">
            <div class="square-bg" style="overflow:hidden; display:flex; align-items:center; justify-content:center; background:transparent; padding: 0;">
              <img src="https://flagcdn.com/w160/${code}.png" alt="${n}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border: 2px solid #333;">
            </div>
            <p style="font-size: 12px; margin-top: 8px; text-align:center;">${n}</p>
          </div>\n`;
});

console.log(html);
