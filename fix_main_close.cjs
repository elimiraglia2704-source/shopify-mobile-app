const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// The problematic string I injected in replace_inner.cjs was:
// '    </main></div>\n\n      <div class="products-grid catalog-grid" id="catalog-products"></div>'
// Wait, the products grid is inside screen-catalog!
// So screen-catalog is ALSO orphaned? No, screen-catalog started at 229!
// Wait! If `</main></div>` is placed before `catalog-products`, then EVERYTHING below that point is outside `<main>`.

// Let's remove ALL `</main></div>` that appear before `<nav class="bottom-nav">`
// Wait, there should only be ONE `</main>` and `</div>` (for app-shell).
// Let's just do a clean regex replacement.
// 1. Remove `</main></div>` entirely from the document.
txt = txt.replace(/<\/main><\/div>/g, '');
// What about `</main>\s*<\/div>`?
txt = txt.replace(/<\/main>[\s\n]*<\/div>/g, '');

// 2. Add `</main></div>` right before `<nav class="bottom-nav">`
txt = txt.replace('<nav class="bottom-nav">', '  </main></div>\n\n  <nav class="bottom-nav">');

// Also update the version to bust cache
txt = txt.replace(/app\.js\?v=\d+/g, 'app.js?v=32');

fs.writeFileSync('index.html', txt);
console.log('Fixed app-main structure!');
