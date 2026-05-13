const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Check all questions and their snippets
const questions = db.prepare(`
  SELECT c.Id, c.Title, c.Description, c.TargetOutput,
         cs.Id as SnippetId, cs.AnalysisType, cs.Code, cs.AnalysisMessage
  FROM Challenges c
  LEFT JOIN ChallengeSnippets cs ON c.Id = cs.ChallengeId
  WHERE c.TestId = 2
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

let output = '';
output += 'Full Question Structure:\n';
output += '========================\n\n';

let currentQuestionId = null;
questions.forEach((row, i) => {
  if (row.Id !== currentQuestionId) {
    currentQuestionId = row.Id;
    output += `\n--- Question ${row.Id}: ${row.Title} ---\n`;
    output += `Description: ${row.Description}\n`;
    output += `TargetOutput: ${row.TargetOutput}\n`;
  }
  
  output += `\n  Snippet ${row.SnippetId} [${row.AnalysisType}]:\n`;
  output += `  Code: ${row.Code}\n`;
});

fs.writeFileSync('question_structure.txt', output);
console.log('Saved to question_structure.txt');

db.close();
