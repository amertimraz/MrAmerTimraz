const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Read and execute the SQL file
const sql = fs.readFileSync('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/fix_tofas_level2_complete.sql', 'utf8');

console.log('Executing complete fix for Tofas Level 2 snippets...');
console.log('=====================================================\n');

// Split by semicolon and execute each statement
const statements = sql.split(';').filter(s => s.trim().length > 0);

let successCount = 0;
let errorCount = 0;

statements.forEach((stmt, i) => {
  try {
    const result = db.exec(stmt + ';');
    successCount++;
    // Extract the question name from the comment
    const commentMatch = stmt.match(/--\s*Question\s*\d+:\s*(.+)/);
    if (commentMatch) {
      console.log(`✓ ${commentMatch[1]}`);
    }
  } catch (error) {
    errorCount++;
    console.error(`✗ Statement ${i + 1} failed:`, error.message);
  }
});

console.log(`\n${successCount} statements executed successfully`);
console.log(`${errorCount} statements failed`);

// Verify the fixes
console.log('\nVerifying fixes...');
const shortSnippets = db.prepare(`
  SELECT COUNT(*) as count
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND length(cs.Code) < 50
`).get();

console.log(`Remaining short snippets: ${shortSnippets.count}`);

db.close();
