const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'Backend', 'EduPlatform.API', 'EduPlatform.db');
const db = new Database(dbPath);

const addColumn = (table, col, type) => {
    try {
        db.prepare(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${type}`).run();
        console.log(`Added column ${col} to ${table}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            // console.log(`Column ${col} already exists`);
        } else {
            console.error(`Error adding ${col}:`, err.message);
        }
    }
};

addColumn('InteractiveQuizzes', 'Slug', 'TEXT');
addColumn('InteractiveQuizzes', 'TeacherWhatsappNumber', 'TEXT');
addColumn('InteractiveQuizzes', 'AllowSkipWithoutRegistration', 'BOOLEAN DEFAULT 1');
addColumn('InteractiveQuizzes', 'StageCount', 'INTEGER DEFAULT 3');
addColumn('InteractiveQuizzes', 'QuestionsPerStage', 'INTEGER DEFAULT 0');
addColumn('InteractiveQuizzes', 'McqPerStage', 'INTEGER DEFAULT 0');
addColumn('InteractiveQuizzes', 'TfPerStage', 'INTEGER DEFAULT 0');
addColumn('InteractiveQuizzes', 'GoldenEvery', 'INTEGER DEFAULT 10');
addColumn('InteractiveQuizzes', 'TimerEnabled', 'BOOLEAN DEFAULT 0');
addColumn('InteractiveQuizzes', 'TimerDuration', 'INTEGER DEFAULT 30');
addColumn('InteractiveQuizzes', 'ViewCount', 'INTEGER DEFAULT 0');

db.close();
