const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Incomplete snippets details:');
console.log('============================');

incompleteSnippets.slice(0, 15).forEach((s, i) => {
  console.log(`${i+1}. Challenge ID: ${s.ChallengeId} - ${s.Title}`);
  console.log(`   Snippet ID: ${s.Id} [${s.AnalysisType}]`);
  console.log(`   Analysis: ${s.AnalysisMessage}`);
  console.log(`   Current Code:\n${s.Code}`);
  console.log('---');
});

db.close();
