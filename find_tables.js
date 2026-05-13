const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

console.log('Tables in database:');
console.log('==================');

tables.forEach(t => {
    console.log(t.name);
});

db.close();
