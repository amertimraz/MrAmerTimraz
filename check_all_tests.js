const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT DISTINCT TestId FROM Questions').all();

console.log('Distinct TestIds in Questions table:');
console.log('====================================');

questions.forEach(q => {
    console.log(`TestId: ${q.TestId}`);
});

db.close();
