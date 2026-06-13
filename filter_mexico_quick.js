import fs from 'fs';
import zlib from 'zlib';

const INPUT_GZ = 'en.openfoodfacts.org.products.csv.gz';
const OUTPUT_SQL = 'mexico_import_quick.sql';
const MAX_ROWS = 200;   // small test

console.log(`Super simple filter — max ${MAX_ROWS} rows...`);

let count = 0;
const writeStream = fs.createWriteStream(OUTPUT_SQL);

writeStream.write(`CREATE TABLE IF NOT EXISTS products (
    code TEXT PRIMARY KEY,
    product_name TEXT,
    brands TEXT,
    name_normalized TEXT,
    is_mexican_barcode INTEGER DEFAULT 0,
    data_source TEXT
);\n\n`);

const gunzip = zlib.createGunzip();
let buffer = '';

gunzip.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  const lines = buffer.split('\n');
  buffer = lines.pop();   // keep incomplete line

  for (let line of lines) {
    if (count >= MAX_ROWS) return;
    line = line.trim();
    if (!line) continue;

    const fields = line.split('\t');
    if (fields.length < 10) continue;   // safety

    const code = fields[0].trim();                    // first column = code
    const productName = (fields[10] || '').trim();    // product_name is usually column 11 (index 10)
    const brands = (fields[18] || '').trim();         // brands is usually column 19
    const countriesTags = (fields[40] || '').toLowerCase(); // countries_tags
    const countries = (fields[39] || '').toLowerCase();

    const isMexican = countriesTags.includes('en:mexico') || countries.includes('mexico');
    const is750 = code.startsWith('750');

    if (isMexican || is750) {
      const nameNorm = productName.toLowerCase();

      const escapedName = productName.replace(/'/g, "''");
      const escapedBrands = brands.replace(/'/g, "''");

      writeStream.write(
        `INSERT OR IGNORE INTO products VALUES ('${code}', '${escapedName}', '${escapedBrands}', '${nameNorm}', ${is750 ? 1 : 0}, '${isMexican ? 'countries' : 'barcode_heuristic'}');\n`
      );

      count++;
    }
  }
});

gunzip.on('end', () => {
  writeStream.end();
  console.log(`✅ Simple filter finished! Exported ${count} products to ${OUTPUT_SQL}`);
});

fs.createReadStream(INPUT_GZ).pipe(gunzip);