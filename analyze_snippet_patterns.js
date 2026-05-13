const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get complete correct snippets to understand patterns
const correctSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND cs.AnalysisType = 'Correct'
  ORDER BY c.OrderIndex
`).all();

console.log('Analyzing complete correct snippets for patterns...');
console.log('===================================================\n');

correctSnippets.slice(0, 5).forEach((s, i) => {
  console.log(`${i+1}. Challenge: ${s.Title}`);
  console.log(`   Code:\n${s.Code}`);
  console.log(`   Analysis: ${s.AnalysisMessage}`);
  console.log('---');
});

// Now get incomplete snippets that need completion
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log(`\nTotal correct snippets: ${correctSnippets.length}`);
console.log(`Total incomplete snippets: ${incompleteSnippets.length}`);

// Show some incomplete snippets that need completion
console.log('\nIncomplete snippets that need completion:');
console.log('===========================================');
incompleteSnippets.slice(0, 5).forEach((s, i) => {
  console.log(`${i+1}. Challenge: ${s.Title} [${s.AnalysisType}]`);
  console.log(`   Current Code: ${s.Code}`);
  console.log(`   Analysis: ${s.AnalysisMessage}`);
  console.log('---');
});

db.close();
