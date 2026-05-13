const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const snippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Sample snippets from database:');
console.log('=============================\n');

snippets.slice(0, 10).forEach((s, i) => {
  console.log(`${i+1}. ${s.Title} [${s.AnalysisType}]`);
  console.log(`   Code:\n${s.Code}`);
  console.log('---');
});

console.log(`\nTotal snippets: ${snippets.length}`);

db.close();
