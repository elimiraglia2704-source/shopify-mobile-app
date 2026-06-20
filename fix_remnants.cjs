const fs = require('fs');

let txt = fs.readFileSync('index.html', 'utf8');

// The remnants look like:
//    <!-- ── CATALOGO ── -->
//    <section class="screen" 
// Or just <section class="screen" \n

txt = txt.replace(/\s*<!-- ── CATALOGO ── -->\s*<section class="screen" \s*/g, '\n');
txt = txt.replace(/\s*<!-- ── ELISEE CLUB 1X2 ── -->\s*<section class="screen" \s*/g, '\n');
txt = txt.replace(/\s*<!-- ── VIP LOUNGE ── -->\s*<section class="screen" \s*/g, '\n');
txt = txt.replace(/\s*<section class="screen" \s*/g, '');

fs.writeFileSync('index.html', txt);
console.log('Remnants fixed');
