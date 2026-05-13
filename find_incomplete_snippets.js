const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const snippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2
`).all();

console.log('Incomplete snippets with "..." in code:');
console.log('========================================');

const incompleteSnippets = snippets.filter(s => 
  s.Code.includes('...') || s.Code.includes('....')
);

console.log(`Found ${incompleteSnippets.length} incomplete snippets out of ${snippets.length} total\n`);

incompleteSnippets.forEach((s, i) => {
  console.log(`${i+1}. Challenge ID: ${s.ChallengeId} - ${s.Title}`);
  console.log(`   Snippet ID: ${s.Id} [${s.AnalysisType}]`);
  console.log(`   Code: ${s.Code}`);
  console.log('---');
});

db.close();
