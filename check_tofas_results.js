const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(TofasTestResults)").all();

console.log('TofasTestResults table schema:');
console.log('=============================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

const results = db.prepare('SELECT * FROM TofasTestResults LIMIT 5').all();

console.log('\nSample data:');
console.log('=============');
results.forEach(r => {
    console.log(JSON.stringify(r, null, 2));
});

db.close();
