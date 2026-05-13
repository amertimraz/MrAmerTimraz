const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(Questions)").all();

console.log('Questions table schema:');
console.log('======================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

db.close();
