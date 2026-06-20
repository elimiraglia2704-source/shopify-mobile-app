import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const marker = '<!-- SEZIONE 3: Acquista per nazionale -->';
const firstIndex = html.indexOf(marker);
const secondIndex = html.indexOf(marker, firstIndex + 1);

if (secondIndex !== -1) {
  // Trova la fine del div h-scrollable-squares del secondo blocco
  // Sappiamo che l'ultimo paese è Italia
  const endMarker = '<p>Italia</p>\n          </div>\n        </div>';
  const endIndex = html.indexOf(endMarker, secondIndex);
  
  if (endIndex !== -1) {
    const end = endIndex + endMarker.length;
    // Rimuovi dal secondo index a end
    html = html.substring(0, secondIndex) + html.substring(end);
    
    // Bump version to v20
    html = html.replace(/app\.js\?v=\d+/, 'app.js?v=20');
    
    fs.writeFileSync('index.html', html);
    console.log("Removed duplicate section and bumped to v20");
  } else {
    console.log("Could not find end of second block");
  }
} else {
  console.log("Second block not found");
}
