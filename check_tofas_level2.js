const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT Id, QuestionText, QuestionType, Options, CorrectAnswer FROM Questions WHERE TestId = 2').all();

console.log('Total questions for TestId = 2:', questions.length);
console.log('==========================================');

questions.forEach((q, i) => {
    console.log(`${i+1}. ID: ${q.Id} [${q.QuestionType}] ${q.QuestionText}`);
    console.log(`   Options: ${q.Options}`);
    console.log(`   Correct: ${q.CorrectAnswer}`);
    console.log('---');
});

db.close();
