import { Jimp } from 'jimp';

async function createIcon(size, input, output) {
  try {
    // Read the original white logo
    const logo = await Jimp.read(input);
    
    // Create a new image with dark background
    const bg = new Jimp({ width: size, height: size, color: '#0a0010' });
    
    // Resize logo to fit inside the icon with some padding
    const logoSize = Math.floor(size * 0.65); 
    logo.resize({ w: logoSize, h: logoSize });
    
    // Composite logo onto background
    const x = Math.floor((size - logoSize) / 2);
    const y = Math.floor((size - logoSize) / 2);
    bg.composite(logo, x, y);
    
    // Save
    await bg.write(output);
    console.log(`Created ${output}`);
  } catch (e) {
    console.error(`Error creating ${output}:`, e);
  }
}

async function run() {
  await createIcon(192, 'public/logo-total-white.png', 'public/icon-192-bg.png');
  await createIcon(512, 'public/logo-total-white.png', 'public/icon-512-bg.png');
}

run();
