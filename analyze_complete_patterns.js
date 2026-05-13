const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get complete correct snippets with full context
const completeSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, c.Description, c.TargetOutput, cs.Code, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND cs.AnalysisType = 'Correct' AND NOT (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex
`).all();

console.log('Analyzing complete correct snippets to understand full code patterns...');
console.log('========================================================================\n');

// Group by pattern type
const patterns = {
  simpleVars: [],
  withIf: [],
  withFor: [],
  withConsole: []
};

completeSnippets.forEach(s => {
  if (s.Code.includes('for (let')) {
    patterns.withFor.push(s);
  } else if (s.Code.includes('if')) {
    patterns.withIf.push(s);
  } else if (s.Code.includes('console.log')) {
    patterns.withConsole.push(s);
  } else {
    patterns.simpleVars.push(s);
  }
});

console.log(`Total complete snippets: ${completeSnippets.length}`);
console.log(`Pattern - with for loops: ${patterns.withFor.length}`);
console.log(`Pattern - with if statements: ${patterns.withIf.length}`);
console.log(`Pattern - simple variables: ${patterns.simpleVars.length}`);

// Show examples of each pattern
console.log('\n=== Examples of for loop patterns ===');
patterns.withFor.slice(0, 3).forEach((s, i) => {
  console.log(`${i+1}. ${s.Title}`);
  console.log(`   Code:\n${s.Code}`);
  console.log('---');
});

console.log('\n=== Examples of if statement patterns ===');
patterns.withIf.slice(0, 3).forEach((s, i) => {
  console.log(`${i+1}. ${s.Title}`);
  console.log(`   Code:\n${s.Code}`);
  console.log('---');
});

db.close();
