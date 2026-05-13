const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const snippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, cs.Code, cs.AnalysisType, cs.AnalysisMessage, cs.OrderIndex
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Snippets for Tofas Level 2 (TestId = 2):');
console.log('==========================================');

let currentChallengeId = null;
snippets.forEach((s, i) => {
  if (s.ChallengeId !== currentChallengeId) {
    currentChallengeId = s.ChallengeId;
    console.log(`\n--- Challenge ID: ${s.ChallengeId} ---`);
  }
  console.log(`  Snippet ${s.OrderIndex} [${s.AnalysisType}]:`);
  console.log(`  Code: ${s.Code.substring(0, 100)}...`);
  console.log(`  Message: ${s.AnalysisMessage}`);
});

console.log(`\nTotal snippets: ${snippets.length}`);
db.close();
