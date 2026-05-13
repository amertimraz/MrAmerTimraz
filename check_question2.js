const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const question = db.prepare(`
  SELECT * FROM Challenges WHERE Id = 22
`).get();

const snippets = db.prepare(`
  SELECT * FROM ChallengeSnippets WHERE ChallengeId = 22 ORDER BY OrderIndex
`).all();

console.log('Question 2 Data:');
console.log('=================');
console.log(`Title: ${question.Title}`);
console.log(`Description: ${question.Description}`);
console.log(`TargetOutput: ${question.TargetOutput}`);
console.log('\nSnippets:');
console.log('---------');

snippets.forEach((s, i) => {
  console.log(`\n${i+1}. [${s.AnalysisType}]`);
  console.log(`Code:\n${s.Code}`);
  console.log(`Analysis: ${s.AnalysisMessage}`);
});

db.close();
