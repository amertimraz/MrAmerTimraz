const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(Challenges)").all();

console.log('Challenges table schema:');
console.log('=======================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

const challenges = db.prepare('SELECT * FROM Challenges').all();

console.log('\nAll Challenges:');
console.log('================');
challenges.forEach(c => {
    console.log(`ID: ${c.Id}`);
    console.log(`Title: ${c.Title}`);
    console.log(`Description: ${c.Description}`);
    console.log('---');
});

db.close();
