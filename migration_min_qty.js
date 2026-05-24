const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Adding min_order_quantity to products table...');
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER NOT NULL DEFAULT 1;
    `);
    console.log('Column added successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

run();
