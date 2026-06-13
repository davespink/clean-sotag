import fs from 'fs';
import zlib from 'zlib';
import csv from 'csv-parse';
import { pipeline } from 'stream/promises';

const INPUT_GZ = 'en.openfoodfacts.org.products.csv.gz';
const OUTPUT_SQL = 'mexico_import.sql';
const CHUNK_SIZE = 2000;

console.log("Starting Mexico filter (Node.js version)...");

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

const parser = csv.parse({
  delimiter: '\t',
  columns: true,
  relax_column_count: true
});

let batch = [];

parser.on('data', (row) => {
  const code = (row.code || '').trim();
  const countriesTags = (row.countries_tags || '').toLowerCase();
  const countries = (row.countries || '').toLowerCase();

  const isMexican = countriesTags.includes('en:mexico') || countries.includes('mexico');
  const is750 = code.startsWith('750');

  if (isMexican || is750) {
    const nameNorm = (row.product_name || '').toLowerCase().trim();

    batch.push({
      code,
      product_name: row.product_name || '',
      brands: row.brands || '',
      name_normalized: nameNorm,
      is_mexican_barcode: is750 ? 1 : 0,
      data_source: isMexican ? 'countries' : 'barcode_heuristic'
    });

    count++;

    if (batch.length >= CHUNK_SIZE) {
      flushBatch();
    }
  }
});

function flushBatch() {
  for (const p of batch) {
    const escapedName = p.product_name.replace(/'/g, "''");
    const escapedBrands = p.brands.replace(/'/g, "''");
    
    writeStream.write(
      `INSERT OR IGNORE INTO products VALUES ('${p.code}', '${escapedName}', '${escapedBrands}', '${p.name_normalized}', ${p.is_mexican_barcode}, '${p.data_source}');\n`
    );
  }
  batch = [];
}

parser.on('end', () => {
  flushBatch();
  writeStream.end();
  console.log(`✅ Finished! Exported ${count.toLocaleString()} Mexican/750 products to ${OUTPUT_SQL}`);
});

pipeline(
  fs.createReadStream(INPUT_GZ),
  zlib.createGunzip(),
  parser
).catch(err => console.error("Error:", err));