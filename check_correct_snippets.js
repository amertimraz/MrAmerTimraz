const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const snippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND cs.AnalysisType = 'Correct'
`).all();

console.log('Correct snippets (for reference):');
console.log('==================================');

snippets.slice(0, 10).forEach((s, i) => {
  console.log(`${i+1}. Challenge ID: ${s.ChallengeId} - ${s.Title}`);
  console.log(`   Snippet ID: ${s.Id}`);
  console.log(`   Code:\n${s.Code}`);
  console.log('---');
});

console.log(`\nTotal correct snippets: ${snippets.length}`);
db.close();
