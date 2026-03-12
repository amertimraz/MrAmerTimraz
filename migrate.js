const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

const SQLITE_PATH = path.join(__dirname, 'Backend', 'EduPlatform.API', 'EduPlatform.db');
const PG_URL = 'postgresql://postgres:YfyWqtDkYoOhJGzhjlpAHVgCrAnREsIV@yamanote.proxy.rlwy.net:44863/railway';

const TABLES = [
  'Users',
  'Courses',
  'Videos',
  'Tests',
  'Questions',
  'Results',
  'Enrollments',
  'Notifications',
  'PaymentRequests',
  'LibraryItems',
  'InteractiveQuizzes',
  'InteractiveQuestions',
];

async function migrate() {
  console.log('Connecting to SQLite...');
  const sqlite = new Database(SQLITE_PATH, { readonly: true });

  console.log('Connecting to PostgreSQL...');
  const pg = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  for (const table of TABLES) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
      if (rows.length === 0) {
        console.log(`  [SKIP] ${table} - empty`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colList = columns.map(c => `"${c}"`).join(', ');
      const valPlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      await pg.query(`DELETE FROM "${table}"`);

      for (const row of rows) {
        const values = columns.map(c => row[c]);
        await pg.query(
          `INSERT INTO "${table}" (${colList}) VALUES (${valPlaceholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }

      console.log(`  [OK] ${table} - ${rows.length} rows migrated`);
    } catch (err) {
      console.log(`  [ERROR] ${table}: ${err.message}`);
    }
  }

  await pg.end();
  sqlite.close();
  console.log('\nMigration complete!');
}

migrate().catch(console.error);
