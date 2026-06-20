const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// Replace `    </div></section>` with `    </div>` if it appears right before `<!-- ── CATALOGO ── -->`
// Wait, the exact string is:
/*
        </div>
    </div></section>


    <!-- ── CATALOGO ── -->
*/

txt = txt.replace('</div></section>\n\n\n    <!-- ── CATALOGO ── -->', '</div>\n\n\n    <!-- ── CATALOGO ── -->');

// Now we need to add `</section>` right before `<!-- ── DETTAGLIO PRODOTTO ── -->`
txt = txt.replace('    <!-- ── DETTAGLIO PRODOTTO ── -->', '    </section>\n\n    <!-- ── DETTAGLIO PRODOTTO ── -->');

// Bump version to 35
txt = txt.replace(/app\.js\?v=\d+/g, 'app.js?v=35');

fs.writeFileSync('index.html', txt);
console.log('Fixed screen-catalog closure!');
