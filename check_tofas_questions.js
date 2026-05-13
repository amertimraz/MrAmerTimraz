const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT Id, Text, Type, Options, CorrectAnswer FROM Questions WHERE TofasTestId = 2').all();

console.log('Total questions for Tofas Level 2:', questions.length);
console.log('==========================================');

questions.forEach((q, i) => {
    console.log(`${i+1}. ID: ${q.Id} [${q.Type}] ${q.Text}`);
    console.log(`   Options: ${q.Options}`);
    console.log(`   Correct: ${q.CorrectAnswer}`);
    console.log('---');
});

db.close();
