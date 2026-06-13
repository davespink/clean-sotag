 CREATE TABLE IF NOT EXISTS products (
    code                    TEXT PRIMARY KEY,
    product_name            TEXT,
    brands                  TEXT,
    name_normalized         TEXT,
    is_mexican_barcode      INTEGER DEFAULT 0,
    data_source             TEXT,
    last_updated            TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aliases (
    alias        TEXT PRIMARY KEY,
    target_code  TEXT NOT NULL,
    confidence   REAL DEFAULT 0.0,
    votes        INTEGER DEFAULT 0,
    source       TEXT,
    created_at   TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_code      ON products(code);
CREATE INDEX IF NOT EXISTS idx_name_norm ON products(name_normalized);
 