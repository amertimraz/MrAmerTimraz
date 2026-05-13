const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT Id, Title, Description, TargetOutput FROM Challenges WHERE TestId = 2 ORDER BY OrderIndex').all();

console.log('Questions for Tofas Level 2 (TestId = 2):');
console.log('==========================================');

questions.forEach((q, i) => {
    console.log(`${i+1}. ID: ${q.Id}`);
    console.log(`   Title: ${q.Title}`);
    console.log(`   Description: ${q.Description}`);
    console.log(`   TargetOutput: ${q.TargetOutput}`);
    console.log('---');
});

db.close();
