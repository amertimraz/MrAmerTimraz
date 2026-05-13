const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const quizzes = db.prepare('SELECT Id, Title, Description FROM Quizzes').all();

console.log('All Quizzes in database:');
console.log('========================');

quizzes.forEach(q => {
    console.log(`ID: ${q.Id}`);
    console.log(`Title: ${q.Title}`);
    console.log(`Description: ${q.Description}`);
    console.log('---');
});

db.close();
