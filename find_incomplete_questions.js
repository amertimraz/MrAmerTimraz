const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const questions = db.prepare('SELECT Id, Text, Type, Options, CorrectAnswer FROM InteractiveQuestions WHERE QuizId = 4').all();

console.log('Incomplete questions with "..." in text or options:');
console.log('==================================================');

const incompleteQuestions = questions.filter(q => {
    return q.Text.includes('...') || 
           (q.Options && q.Options.includes('...')) ||
           q.Text.includes('....') || 
           (q.Options && q.Options.includes('....'));
});

console.log(`Found ${incompleteQuestions.length} incomplete questions out of ${questions.length} total\n`);

incompleteQuestions.forEach((q, i) => {
    console.log(`${i+1}. ID: ${q.Id}`);
    console.log(`   Type: ${q.Type}`);
    console.log(`   Text: ${q.Text}`);
    console.log(`   Options: ${q.Options}`);
    console.log(`   Correct: ${q.CorrectAnswer}`);
    console.log('---');
});

db.close();
