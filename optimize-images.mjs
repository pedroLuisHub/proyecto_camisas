import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';
const maxWidth = 800;  // Max width for product images
const jpegQuality = 75; // Good balance between quality and size

// Images to optimize (all large PNGs that are product images)
const imagesToOptimize = [
  'cam_eco_py.png',
  'cam_eco_br.png',
  'conjunto_eco_py.png',
  'conjunto_premium_py.png',
  'conjunto_eco_br.png',
  'proximamente_ar.png',
  'proximamente_br.png',
  'proximamente_pl.png',
];

async function optimizeImage(filename) {
  const inputPath = path.join(imagesDir, filename);
  const outputName = filename.replace('.png', '.jpg');
  const outputPath = path.join(imagesDir, outputName);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filename}`);
    return null;
  }

  const inputStats = fs.statSync(inputPath);
  const inputSizeMB = (inputStats.size / (1024 * 1024)).toFixed(2);

  try {
    await sharp(inputPath)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(1);

    console.log(`✅ ${filename} (${inputSizeMB} MB) → ${outputName} (${outputSizeKB} KB)`);
    return { original: filename, optimized: outputName };
  } catch (err) {
    console.error(`❌ Error optimizando ${filename}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🔄 Optimizando imágenes...\n');
  
  const results = [];
  for (const img of imagesToOptimize) {
    const result = await optimizeImage(img);
    if (result) results.push(result);
  }

  console.log(`\n✨ ${results.length} imágenes optimizadas.`);
  console.log('\n📝 Actualiza main.js con estos nuevos nombres de archivo:');
  results.forEach(r => {
    console.log(`   ${r.original} → ${r.optimized}`);
  });
}

main();
