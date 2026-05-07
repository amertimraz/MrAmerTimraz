const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'Backend', 'EduPlatform.API', 'EduPlatform.db');
const db = new Database(dbPath);
const tableInfo = db.prepare('PRAGMA table_info("InteractiveQuizzes")').all();
console.log(JSON.stringify(tableInfo, null, 2));
db.close();
