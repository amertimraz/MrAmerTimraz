const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(TofasTests)").all();

console.log('TofasTests table schema:');
console.log('=======================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

const tests = db.prepare('SELECT * FROM TofasTests').all();

console.log('\nAll Tofas Tests:');
console.log('================');
tests.forEach(t => {
    console.log(`ID: ${t.Id}`);
    console.log(`Title: ${t.Title}`);
    console.log(`Slug: ${t.Slug}`);
    console.log(`Description: ${t.Description}`);
    console.log('---');
});

db.close();
