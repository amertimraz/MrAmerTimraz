const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(ChallengeSnippets)").all();

console.log('ChallengeSnippets table schema:');
console.log('================================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

const snippets = db.prepare('SELECT * FROM ChallengeSnippets LIMIT 5').all();

console.log('\nSample data:');
console.log('=============');
snippets.forEach(s => {
    console.log(JSON.stringify(s, null, 2));
});

db.close();
