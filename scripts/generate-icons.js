const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { size: 32, name: 'icon-light-32x32.png' },
  { size: 32, name: 'icon-dark-32x32.png' },
  { size: 180, name: 'apple-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const { size, name } of sizes) {
    const outputPath = path.join(publicDir, name);
    
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`Generated ${name} (${size}x${size})`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);

