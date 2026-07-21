import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const ASSETS = join(import.meta.dirname, '..', 'public', 'assets');

// Define responsive variants per category
// [suffix, maxWidth] — only generate if original is wider
const VARIANTS = [
  ['-sm', 400],   // mobile icons / small cards
  ['-md', 800],   // tablet / mid-size
  // original = full size (no suffix)
];

// Image groups with their target sizes
const GROUPS = {
  // Hero images — displayed large
  hero: {
    files: ['monumento.webp', 'abrazo.webp'],
    maxWidth: 1200,
  },
  // Category icons — displayed at 40-90px
  icons: {
    files: [
      'mujer.webp', 'ninez.webp', 'mayores.webp', 'comunidad.webp',
      'inclusion.webp', 'salud.webp', 'trabajo.webp', 'deportes.webp',
      'turismo.webp', 'cultura.webp', 'educacion.webp',
    ],
    maxWidth: 320,
  },
  // Turismo card covers — displayed at ~250px wide
  turismo: {
    files: [
      'granja.webp', 'kayak.webp', 'molino.webp',
      'termas.webp', 'balneario.webp', 'molinoforclaz.webp',
    ],
    maxWidth: 800,
  },
  // Ayuda cards — displayed at ~100px
  ayuda: {
    files: [
      'apoyo.webp', 'bienestar.webp', 'talleres.webp', 'hablar.webp',
    ],
    maxWidth: 400,
  },
  // Always generate small for everything else that's > 100KB
  large: {
    files: ['corazon.webp', 'ninez.webp', 'salud.webp', 'educacion.webp', 'cultura.webp'],
    maxWidth: 800,
  },
};

async function getOriginalSize(filePath) {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width, height: meta.height };
}

async function generateVariant(src, dest, maxWidth) {
  const srcMeta = await sharp(src).metadata();
  if (srcMeta.width <= maxWidth) return false;

  await sharp(src)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);

  const destMeta = await sharp(dest).metadata();
  const srcSize = (await import('fs')).statSync(src).size;
  const destSize = (await import('fs')).statSync(dest).size;
  console.log(`  ${basename(dest)} → ${destMeta.width}w, ${(destSize/1024).toFixed(0)}KB (was ${(srcSize/1024).toFixed(0)}KB)`);
  return true;
}

async function main() {
  const files = await readdir(ASSETS);
  const webpFiles = files.filter(f => f.endsWith('.webp'));
  let totalGenerated = 0;

  // Collect all unique files to process
  const allFiles = new Set();
  for (const group of Object.values(GROUPS)) {
    for (const f of group.files) {
      if (webpFiles.includes(f)) allFiles.add(f);
    }
  }

  // Also find any large originals > 100KB that aren't in any group
  for (const f of webpFiles) {
    if (!allFiles.has(f)) {
      const stat = await import('fs').then(fs => fs.statSync(join(ASSETS, f)));
      if (stat.size > 100 * 1024) {
        allFiles.add(f);
      }
    }
  }

  for (const file of allFiles) {
    const srcPath = join(ASSETS, file);
    const name = basename(file, extname(file));

    for (const [suffix, maxWidth] of VARIANTS) {
      const destPath = join(ASSETS, `${name}${suffix}.webp`);
      try {
        const created = await generateVariant(srcPath, destPath, maxWidth);
        if (created) totalGenerated++;
      } catch (err) {
        console.error(`  ERROR ${file}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone: ${totalGenerated} responsive variants generated`);
}

main();
