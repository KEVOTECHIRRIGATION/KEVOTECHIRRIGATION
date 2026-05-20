const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255)    NOT NULL,
        category    VARCHAR(100)    NOT NULL,
        description TEXT,
        image       TEXT,
        price       NUMERIC(10, 2)  NOT NULL DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ products');

    // Customers (optional accounts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(255)   NOT NULL,
        email         VARCHAR(255)   UNIQUE,
        phone         VARCHAR(20)    NOT NULL,
        address       TEXT,
        county        VARCHAR(100),
        password_hash VARCHAR(255),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ customers');

    // Customer auth sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id          SERIAL PRIMARY KEY,
        token       VARCHAR(64)  UNIQUE NOT NULL,
        customer_id INTEGER      REFERENCES customers(id) ON DELETE CASCADE,
        expires_at  TIMESTAMP    NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS customer_sessions_token_idx ON customer_sessions (token);`);
    console.log('✓ customer_sessions');

    // Checkout sessions (30-min time-limited cart snapshots)
    await client.query(`
      CREATE TABLE IF NOT EXISTS checkout_sessions (
        id          SERIAL PRIMARY KEY,
        token       VARCHAR(64)    UNIQUE NOT NULL,
        cart_items  JSONB          NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL,
        expires_at  TIMESTAMP      NOT NULL,
        used        BOOLEAN        DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS checkout_sessions_token_idx ON checkout_sessions (token);`);
    console.log('✓ checkout_sessions');

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id                   SERIAL PRIMARY KEY,
        phone_number         VARCHAR(20)    NOT NULL,
        items                JSONB          NOT NULL,
        total_price          NUMERIC(10, 2) NOT NULL,
        status               VARCHAR(50)    DEFAULT 'PENDING',
        checkout_request_id  VARCHAR(100),
        mpesa_receipt_number VARCHAR(50),
        customer_id          INTEGER        REFERENCES customers(id),
        customer_name        VARCHAR(255),
        customer_email       VARCHAR(255),
        delivery_address     TEXT,
        county               VARCHAR(100),
        notes                TEXT,
        created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Add new columns to existing orders table if upgrading
    for (const col of [
      "ADD COLUMN IF NOT EXISTS checkout_request_id VARCHAR(100)",
      "ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(50)",
      "ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id)",
      "ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)",
      "ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)",
      "ADD COLUMN IF NOT EXISTS delivery_address TEXT",
      "ADD COLUMN IF NOT EXISTS county VARCHAR(100)",
      "ADD COLUMN IF NOT EXISTS notes TEXT",
    ]) {
      await client.query(`ALTER TABLE orders ${col}`).catch(() => {});
    }
    await client.query(`CREATE INDEX IF NOT EXISTS orders_checkout_request_id_idx ON orders (checkout_request_id);`);
    console.log('✓ orders');

    await client.query('COMMIT');
    console.log('\n✅ Database initialised successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Init failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
