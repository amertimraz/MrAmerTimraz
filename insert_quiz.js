const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'Backend', 'EduPlatform.API', 'EduPlatform.db');
const db = new Database(dbPath);

try {
    const title = 'مراجعة الحاسب الآلي - الصف الثالث الإعدادي (تيرم ثاني)';
    const subject = 'حاسب آلي';
    const grade = 'الثالث الإعدادي';
    const description = 'مراجعة نهائية شاملة لأهم نقاط المنهج بأسلوب تفاعلي حديث.';
    const theme = 'CyberTech'; // This will trigger the special design
    const slug = '3rd-prep-cs-final-revision';
    
    // Check if exists
    const existing = db.prepare('SELECT Id FROM "InteractiveQuizzes" WHERE Slug = ?').get(slug);
    
    if (existing) {
        console.log('Quiz already exists with ID:', existing.Id);
    } else {
        const stmt = db.prepare(`
            INSERT INTO "InteractiveQuizzes" 
            (Title, Subject, Grade, Description, Theme, Slug, CreatedAt, ViewCount, StageCount, QuestionsPerStage, McqPerStage, TfPerStage, GoldenEvery, TimerEnabled, TimerDuration, ShowSupportButton, AllowSkipWithoutRegistration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            title, subject, grade, description, theme, slug,
            new Date().toISOString(), 0, 3, 0, 0, 0, 10, 0, 30, 1, 1
        );
        
        console.log('Successfully created new quiz with ID:', info.lastInsertRowid);
    }
} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
