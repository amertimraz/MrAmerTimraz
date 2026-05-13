const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const tofasTests = db.prepare('SELECT * FROM TofasTests').all();

console.log('Tofas Tests in database:');
console.log('========================');

tofasTests.forEach(t => {
    console.log(`ID: ${t.Id}`);
    console.log(`Title: ${t.Title}`);
    console.log(`Level: ${t.Level}`);
    console.log(`Description: ${t.Description}`);
    console.log('---');
});

db.close();
