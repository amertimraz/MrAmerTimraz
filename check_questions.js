const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT Text, Type, Options, CorrectAnswer FROM InteractiveQuestions WHERE QuizId = 4').all();

console.log('Total questions:', questions.length);
console.log('==========================================');

questions.forEach((q, i) => {
    console.log(`${i+1}. [${q.Type}] ${q.Text}`);
    console.log(`   Options: ${q.Options}`);
    console.log(`   Correct: ${q.CorrectAnswer}`);
    console.log('---');
});

db.close();
