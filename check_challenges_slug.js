const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const challenges = db.prepare('SELECT * FROM Challenges').all();

console.log('All Challenges:');
console.log('===============');

challenges.forEach(c => {
    console.log(`ID: ${c.Id}`);
    console.log(`Title: ${c.Title}`);
    console.log(`Slug: ${c.Slug}`);
    console.log(`Description: ${c.Description}`);
    console.log('---');
});

db.close();
