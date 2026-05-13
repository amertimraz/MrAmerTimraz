const Database = require('better-sqlite3');
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

console.log('Full Question Structure:');
console.log('========================\n');

let currentQuestionId = null;
questions.forEach((row, i) => {
  if (row.Id !== currentQuestionId) {
    currentQuestionId = row.Id;
    console.log(`\n--- Question ${row.Id}: ${row.Title} ---`);
    console.log(`Description: ${row.Description}`);
    console.log(`TargetOutput: ${row.TargetOutput}`);
  }
  
  console.log(`\n  Snippet ${row.SnippetId} [${row.AnalysisType}]:`);
  console.log(`  Code: ${row.Code.substring(0, 150)}${row.Code.length > 150 ? '...' : ''}`);
});

db.close();
