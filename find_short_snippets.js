const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Find snippets that are too short (likely just output text, not full code)
const snippets = db.prepare(`
  SELECT c.Id, c.Title, cs.Id as SnippetId, cs.AnalysisType, cs.Code, length(cs.Code) as CodeLength
  FROM Challenges c
  JOIN ChallengeSnippets cs ON c.Id = cs.ChallengeId
  WHERE c.TestId = 2
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Snippets that are too short (likely missing code):');
console.log('===================================================\n');

const shortSnippets = snippets.filter(s => s.CodeLength < 50);

shortSnippets.forEach((s, i) => {
  console.log(`${i+1}. Question ${s.Id}: ${s.Title}`);
  console.log(`   Snippet ${s.SnippetId} [${s.AnalysisType}] (${s.CodeLength} chars)`);
  console.log(`   Code: ${s.Code}`);
  console.log('---');
});

console.log(`\nTotal short snippets: ${shortSnippets.length}`);

db.close();
