const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const quizId = 4; // 3rd Prep CS Final Revision

try {
    const questions = db.prepare('SELECT OrderIndex, Text, Type, Options, CorrectAnswer FROM "InteractiveQuestions" WHERE QuizId = ? ORDER BY OrderIndex').all(quizId);
    
    console.log(`Total questions in Quiz ID ${quizId}: ${questions.length}`);
    console.log('==========================================');
    
    // Show last 15 questions (including the new ones)
    const startIndex = Math.max(0, questions.length - 15);
    
    for (let i = startIndex; i < questions.length; i++) {
        const q = questions[i];
        console.log(`\nQuestion ${q.OrderIndex}:`);
        console.log(`Type: ${q.Type}`);
        console.log(`Text: ${q.Text}`);
        console.log(`Options: ${q.Options}`);
        console.log(`Correct: ${q.CorrectAnswer}`);
        console.log('---');
    }
    
    console.log(`\n✅ All questions are now available at: https://www.amertimraz.com/interactive-revision/slug/3rd-prep-cs-final-revision`);
    console.log(`📊 Total questions: ${questions.length}`);
    console.log(`🆔 Quiz ID: ${quizId}`);
    
} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
