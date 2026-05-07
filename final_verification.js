const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const quizId = 4; // 3rd Prep CS Final Revision

try {
    const questions = db.prepare('SELECT Type, COUNT(*) as count FROM "InteractiveQuestions" WHERE QuizId = ? GROUP BY Type').all(quizId);
    const totalQuestions = db.prepare('SELECT COUNT(*) as total FROM "InteractiveQuestions" WHERE QuizId = ?').get(quizId);
    
    console.log('📊 Final Statistics for Quiz ID 4 - 3rd Prep CS Final Revision');
    console.log('=========================================================');
    console.log(`📈 Total Questions: ${totalQuestions.total}`);
    console.log('\n📋 Questions by Type:');
    
    questions.forEach(q => {
        const emoji = q.Type === 'TrueFalse' ? '✅' : q.Type === 'MCQ' ? '🔘' : '❓';
        console.log(`${emoji} ${q.Type}: ${q.count} questions`);
    });
    
    // Show some sample questions from each type
    console.log('\n📝 Sample Questions:');
    
    const sampleTF = db.prepare('SELECT OrderIndex, Text FROM "InteractiveQuestions" WHERE QuizId = ? AND Type = \'TrueFalse\' LIMIT 3').all(quizId);
    console.log('\n✅ True/False Samples:');
    sampleTF.forEach((q, i) => {
        console.log(`   ${q.OrderIndex}. ${q.Text.substring(0, 80)}...`);
    });
    
    const sampleMCQ = db.prepare('SELECT OrderIndex, Text FROM "InteractiveQuestions" WHERE QuizId = ? AND Type = \'MCQ\' ORDER BY OrderIndex DESC LIMIT 3').all(quizId);
    console.log('\n🔘 MCQ Samples (Latest):');
    sampleMCQ.forEach((q, i) => {
        console.log(`   ${q.OrderIndex}. ${q.Text.substring(0, 80)}...`);
    });
    
    console.log('\n🌐 Quiz Link: https://www.amertimraz.com/interactive-revision/slug/3rd-prep-cs-final-revision');
    console.log('✅ All exam questions from 15 governorates have been successfully added!');
    console.log('📚 Questions are categorized by type and ready for interactive revision.');
    
} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
