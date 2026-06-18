import { Jimp } from 'jimp';

async function createIcon(size, input, output, bgColor = null) {
  try {
    const logo = await Jimp.read(input);
    const bg = bgColor ? new Jimp({ width: size, height: size, color: bgColor }) : new Jimp({ width: size, height: size, color: 0x00000000 });
    
    const logoSize = Math.floor(size * 0.8); 
    logo.resize({ w: logoSize, h: logoSize });
    
    const x = Math.floor((size - logoSize) / 2);
    const y = Math.floor((size - logoSize) / 2);
    bg.composite(logo, x, y);
    
    await bg.write(output);
    console.log(`Created ${output}`);
  } catch (e) {
    console.error(`Error creating ${output}:`, e);
  }
}

async function run() {
  // Sfondo scuro per Android Adaptive Icons (evita il quadrato bianco)
  await createIcon(192, 'public/logo-total-white.png', 'public/icon-192-maskable.png', '#0a0010');
  await createIcon(512, 'public/logo-total-white.png', 'public/icon-512-maskable.png', '#0a0010');
  
  // Sfondo trasparente per chi supporta icone libere: USIAMO IL LOGO NERO
  // Così se Android ci mette uno sfondo bianco dietro, la tigre nera si vedrà benissimo!
  await createIcon(192, 'public/logo-total-black.png', 'public/icon-192-any.png', null);
  await createIcon(512, 'public/logo-total-black.png', 'public/icon-512-any.png', null);
}

run();
