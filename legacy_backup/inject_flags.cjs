const fs = require('fs');

// 1. Update index.html flags
const txt = fs.readFileSync('index.html', 'utf8');
const flagsHtml = fs.readFileSync('flags.html', 'utf8');

const startTag = '<div class="h-scrollable-squares">';
const startIdx = txt.indexOf(startTag);
if (startIdx === -1) throw new Error("Could not find start tag");

// Find the END of h-scrollable-squares
// It's followed by </div> then </section> or something.
// Actually, let's just find the first `</div>` that belongs to the parent.
// Since h-scrollable-squares has many `</div>` inside, we must find where the next section starts.
const nextSection = txt.indexOf('</section>', startIdx);
// Let's just find the last team-card's closing div before nextSection.
const endIdx = txt.lastIndexOf('</div>', nextSection - 1);
// Wait, the parent `h-scrollable-squares` also has a closing div. Let's just slice from startIdx + startTag.length to endIdx.
// To be safe, let's use a regex or string replacement carefully.
// Let's just replace the whole section from startTag to `</section>` with startTag + flagsHtml + '</div>\n</section>'
const finalHtml = txt.substring(0, startIdx + startTag.length) + '\n' + flagsHtml + '\n        </div>\n    </section>\n' + txt.substring(nextSection + '</section>'.length);

fs.writeFileSync('index.html', finalHtml);

// 2. Clear cache in app.js on boot to force refresh
let appJs = fs.readFileSync('src/app.js', 'utf8');
// Add cacheClear() at the beginning of init()
if (!appJs.includes('sessionStorage.clear()')) {
  appJs = appJs.replace('function init() {', "function init() {\n  sessionStorage.clear(); // FORCE CLEAN CACHE FOR V24\n");
  fs.writeFileSync('src/app.js', appJs);
}

console.log("Injected flags and updated app.js");
