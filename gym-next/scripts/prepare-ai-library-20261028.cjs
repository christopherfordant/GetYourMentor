// Encoding/resizing only: originals were created and inspected with built-in image_gen.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
async function main() {
  const rows = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const output = path.resolve(__dirname, '../public/design_assets/ai-2026-10-28');
  fs.mkdirSync(output, { recursive: true });
  const manifest = [];
  for (const row of rows) {
    const original = await sharp(row.source).metadata();
    const variants = [];
    for (const width of [640, 1280]) {
      const filename = `${row.id}-${width}.webp`;
      const file = path.join(output, filename);
      if (fs.existsSync(file)) throw new Error(`Refusing to overwrite ${file}`);
      await sharp(row.source).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
      const bytes = fs.readFileSync(file);
      const metadata = await sharp(file).metadata();
      variants.push({ filename, width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    }
    manifest.push({ id: row.id, origin: 'OpenAI built-in image_gen, 2026-10-28; fictional adults', originalWidth: original.width, originalHeight: original.height, variants });
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ assets: manifest.length, variants: manifest.length * 2, bytes: manifest.flatMap(a => a.variants).reduce((n, a) => n + a.bytes, 0) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
