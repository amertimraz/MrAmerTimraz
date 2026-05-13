const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Creating SQL script for reversed question format...');
console.log('================================================\n');

// Get all questions that have been reversed
const questions = db.prepare(`
  SELECT 
    c.Id as QuestionId,
    c.Description as QuestionDescription,
    c.TargetOutput,
    cs.Id as SnippetId,
    cs.Code as SnippetCode,
    cs.AnalysisType
  FROM Challenges c
  JOIN ChallengeSnippets cs ON c.Id = cs.ChallengeId
  WHERE c.TestId = 2 AND c.Description LIKE '%```%'
  ORDER BY c.Id, cs.Id
`).all();

let sqlContent = '-- Fix Tofas Level 2 Questions - Reverse Format\n';
sqlContent += '-- Move code from snippets to question description\n';
sqlContent += '-- Move outputs from question to snippets\n\n';

let currentQuestion = null;
let snippets = [];

questions.forEach(row => {
  if (!currentQuestion || currentQuestion.QuestionId !== row.QuestionId) {
    // Process previous question
    if (currentQuestion) {
      sqlContent += generateQuestionSQL(currentQuestion, snippets);
    }
    
    currentQuestion = {
      QuestionId: row.QuestionId,
      Description: row.QuestionDescription,
      TargetOutput: row.TargetOutput
    };
    snippets = [];
  }
  
  snippets.push({
    SnippetId: row.SnippetId,
    Code: row.SnippetCode,
    AnalysisType: row.AnalysisType
  });
});

// Process last question
if (currentQuestion) {
  sqlContent += generateQuestionSQL(currentQuestion, snippets);
}

// Write to file
fs.writeFileSync('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/fix_tofas_level2_reversed.sql', sqlContent);
console.log('SQL script created: Backend/EduPlatform.API/fix_tofas_level2_reversed.sql');

db.close();

function generateQuestionSQL(question, snippets) {
  let sql = '-- Question ' + question.QuestionId + ': Reverse format\n';
  sql += 'UPDATE Challenges SET Description = ';
  
  // Escape the description for SQL
  const escapedDesc = question.Description.replace(/'/g, "''");
  sql += "'" + escapedDesc + "' WHERE Id = " + question.QuestionId + ' AND TestId = 2;\n\n';
  
  // Add snippet updates
  snippets.forEach(snippet => {
    const escapedCode = snippet.Code.replace(/'/g, "''");
    sql += 'UPDATE ChallengeSnippets SET Code = \'' + escapedCode + '\' WHERE Id = ' + snippet.SnippetId + ';\n';
  });
  
  sql += '\n';
  return sql;
}
