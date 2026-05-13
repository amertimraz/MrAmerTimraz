const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Creating SQL script for reversed question format...');
console.log('================================================\n');

// Get all questions that have been reversed (questions 22, 25, 26, 30, 36, 41, 60, 69)
const questionIds = [22, 25, 26, 30, 36, 41, 60, 69];
let sqlContent = '-- Fix Tofas Level 2 Questions - Reverse Format\n';
sqlContent += '-- Move code from snippets to question description\n';
sqlContent += '-- Move outputs from question to snippets\n\n';

questionIds.forEach(questionId => {
  const question = db.prepare(`
    SELECT 
      c.Id as QuestionId,
      c.Description as QuestionDescription,
      c.TargetOutput
    FROM Challenges c
    WHERE c.TestId = 2 AND c.Id = ?
  `).get(questionId);
  
  if (question) {
    const snippets = db.prepare(`
      SELECT 
        cs.Id as SnippetId,
        cs.Code as SnippetCode,
        cs.AnalysisType
      FROM ChallengeSnippets cs
      WHERE cs.ChallengeId = ?
      ORDER BY cs.Id
    `).all(questionId);
    
    // Generate SQL for this question
    sqlContent += '-- Question ' + questionId + ': Reverse format\n';
    sqlContent += 'UPDATE Challenges SET Description = ';
    
    // Escape the description for SQL
    const escapedDesc = (question.Description || '').replace(/'/g, "''");
    sqlContent += "'" + escapedDesc + "' WHERE Id = " + questionId + ' AND TestId = 2;\n\n';
    
    // Add snippet updates
    snippets.forEach(snippet => {
      const escapedCode = (snippet.Code || '').replace(/'/g, "''");
      sqlContent += 'UPDATE ChallengeSnippets SET Code = \'' + escapedCode + '\' WHERE Id = ' + snippet.SnippetId + ';\n';
    });
    
    sqlContent += '\n';
  } else {
    console.log('Question ' + questionId + ' not found');
  }
});

// Write to file
fs.writeFileSync('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/fix_tofas_level2_reversed.sql', sqlContent);
console.log('SQL script created: Backend/EduPlatform.API/fix_tofas_level2_reversed.sql');

db.close();
