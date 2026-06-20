import fs from 'fs';

const countryCodes = {
  'Polonia': 'pl', 'Danimarca': 'dk', 'Irlanda': 'ie', 'Cameroon': 'cm',
  'Senegal': 'sn', 'Nigeria': 'ng', 'Olanda': 'nl', 'Norvegia': 'no',
  'Messico': 'mx', 'Arabia Saudita': 'sa', 'USA': 'us', 'Irlanda del Nord': 'gb-nir',
  'Repubblica Ceca': 'cz', 'Austria': 'at', 'Brasile': 'br', 'Ungheria': 'hu',
  'Ucraina': 'ua', 'Turchia': 'tr', 'Galles': 'gb-wls', 'Svezia': 'se',
  'Uruguay': 'uy', 'Scozia': 'gb-sct', 'Portogallo': 'pt', 'Colombia': 'co',
  'Spagna': 'es', 'Giappone': 'jp', 'Svizzera': 'ch', 'Inghilterra': 'gb-eng',
  'Croazia': 'hr', 'Argentina': 'ar', 'Germania': 'de', 'Francia': 'fr',
  'Grecia': 'gr', 'Italia': 'it'
};

let htmlString = '<div class="h-scrollable-squares">\n';
for (const [name, code] of Object.entries(countryCodes)) {
  htmlString += `          <div class="team-card" onclick="go('catalog'); document.getElementById('search-input').value='${name}'; document.getElementById('search-input').dispatchEvent(new Event('input'))">\n`;
  htmlString += `            <div class="square-bg" style="overflow:hidden; display:flex; align-items:center; justify-content:center; background:transparent; padding: 0;">\n`;
  htmlString += `              <img src="https://flagcdn.com/w160/${code}.png" alt="${name}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; border: 2px solid #333;">\n`;
  htmlString += `            </div>\n`;
  htmlString += `            <p style="font-size: 12px; margin-top: 8px;">${name}</p>\n`;
  htmlString += `          </div>\n`;
}
htmlString += '        </div>';

let html = fs.readFileSync('index.html', 'utf8');
const startTag = '<div class="h-scrollable-squares">';
const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf('</div>', html.indexOf('<p style="font-size: 12px; margin-top: 8px;">Italia</p>')) + 6;

if (startIndex !== -1 && endIndex !== -1) {
  html = html.substring(0, startIndex) + htmlString + html.substring(endIndex);
  
  // Bump version to v18
  html = html.replace(/app\.js\?v=\d+/, 'app.js?v=18');
  
  fs.writeFileSync('index.html', html);
  console.log("Updated index.html with circular HD flags and bumped version.");
} else {
  console.log("Could not find the block in index.html");
}
