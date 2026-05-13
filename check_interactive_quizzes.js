const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const schema = db.prepare("PRAGMA table_info(InteractiveQuizzes)").all();

console.log('InteractiveQuizzes table schema:');
console.log('==================================');

schema.forEach(col => {
    console.log(`Column: ${col.name}, Type: ${col.type}`);
});

const quizzes = db.prepare('SELECT * FROM InteractiveQuizzes').all();

console.log('\nAll Interactive Quizzes:');
console.log('=======================');
quizzes.forEach(q => {
    console.log(`ID: ${q.Id}`);
    console.log(`Title: ${q.Title}`);
    console.log(`Description: ${q.Description}`);
    console.log('---');
});

db.close();
