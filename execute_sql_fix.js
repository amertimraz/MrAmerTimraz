const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Read and execute the SQL file
const sql = fs.readFileSync('f:/Amer/Mr Amer Platform/fix_incomplete_questions.sql', 'utf8');

// Split by semicolon and execute each statement
const statements = sql.split(';').filter(s => s.trim().length > 0);

console.log(`Executing ${statements.length} SQL statements...\n`);

let successCount = 0;
let errorCount = 0;

statements.forEach((stmt, i) => {
  try {
    db.exec(stmt + ';');
    successCount++;
    // Extract the question name from the comment
    const commentMatch = stmt.match(/--\s*Question\s*\d+:\s*(.+)/);
    if (commentMatch) {
      console.log(`✓ ${commentMatch[1]}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Statement ${i + 1} failed:`, error.message);
    console.error('SQL:', stmt.substring(0, 100));
  }
});

console.log(`\n${successCount} statements executed successfully`);
console.log(`${errorCount} statements failed`);

db.close();
