const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get all incomplete snippets
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Fixing incomplete snippets...');
console.log('=============================\n');

// Fix patterns based on analysis
const fixes = [];

incompleteSnippets.forEach(s => {
  let fixedCode = s.Code;
  let needsFix = false;

  // Fix 1: Syntax error - using if instead of for
  if (s.AnalysisMessage.includes('استخدام if بدلاً من for')) {
    fixedCode = s.Code.replace('if (let', 'for (let');
    needsFix = true;
  }

  // Fix 2: Logic error - using && instead of ||
  if (s.AnalysisMessage.includes('لا يمكن') && s.AnalysisMessage.includes('في نفس الوقت') && s.Code.includes('&&')) {
    fixedCode = s.Code.replace(/&&/g, '||');
    needsFix = true;
  }

  // Fix 3: Logic error - using || instead of &&
  if (s.AnalysisMessage.includes('استخدام (||) سيجعل') && s.Code.includes('||')) {
    fixedCode = s.Code.replace(/\|\|/g, '&&');
    needsFix = true;
  }

  // Fix 4: Missing .length
  if (s.AnalysisMessage.includes('.length') && !s.Code.includes('.length')) {
    fixedCode = s.Code.replace(/([a-zA-Z]+)(\s*[><=!]=?\s*\d+)/g, '$1.length$2');
    needsFix = true;
  }

  // Fix 5: Wrong comparison
  if (s.AnalysisMessage.includes('لا يمكن') && s.Code.includes('==')) {
    fixedCode = s.Code.replace(/==/g, '!=');
    needsFix = true;
  }

  if (needsFix) {
    fixes.push({
      id: s.Id,
      challengeId: s.ChallengeId,
      title: s.Title,
      oldCode: s.Code,
      newCode: fixedCode,
      analysis: s.AnalysisMessage
    });
  }
});

console.log(`Found ${fixes.length} snippets that can be auto-fixed\n`);

fixes.slice(0, 10).forEach((f, i) => {
  console.log(`${i+1}. Challenge ID: ${f.challengeId} - ${f.title}`);
  console.log(`   Snippet ID: ${f.id}`);
  console.log(`   Analysis: ${f.analysis}`);
  console.log(`   Old Code: ${f.oldCode}`);
  console.log(`   New Code: ${f.newCode}`);
  console.log('---');
});

console.log(`\nTotal auto-fixable snippets: ${fixes.length}`);
console.log(`Remaining manual fixes needed: ${incompleteSnippets.length - fixes.length}`);

db.close();
