const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get incomplete snippets
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, c.Description, c.TargetOutput, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Intelligent fixing based on patterns...');
console.log('=======================================\n');

const fixes = [];

incompleteSnippets.forEach(s => {
  let fixedCode = s.Code;
  let needsFix = false;
  let reason = '';

  // Pattern 1: Logic error - && when should be || for "OR" conditions
  if (s.AnalysisMessage.includes('لا يمكن') && s.AnalysisMessage.includes('في نفس الوقت') && s.Code.includes('&&')) {
    // This is often: if (x == A && x == B) - should be if (x == A || x == B)
    fixedCode = s.Code.replace(/&&/g, '||');
    needsFix = true;
    reason = 'Changed && to || for OR conditions';
  }

  // Pattern 2: Logic error - || when should be && for "AND" conditions
  if (s.AnalysisMessage.includes('استخدام (||) سيجعل الشرط صحيحاً') && s.Code.includes('||')) {
    fixedCode = s.Code.replace(/\|\|/g, '&&');
    needsFix = true;
    reason = 'Changed || to && for AND conditions';
  }

  // Pattern 3: Wrong comparison - == when should be !=
  if (s.AnalysisMessage.includes('لا يمكن') && s.AnalysisMessage.includes('أن يكون') && s.Code.includes('==')) {
    fixedCode = s.Code.replace(/==/g, '!=');
    needsFix = true;
    reason = 'Changed == to != for exclusion';
  }

  // Pattern 4: Wrong comparison - != when should be ==
  if (s.AnalysisMessage.includes('سيشتري فقط') || s.AnalysisMessage.includes('سيطبع فقط') || s.AnalysisMessage.includes('سيستبعد فقط')) {
    if (s.Code.includes('==')) {
      fixedCode = s.Code.replace(/==/g, '!=');
      needsFix = true;
      reason = 'Changed == to != for exclusion';
    }
  }

  // Pattern 5: Missing array index [i]
  if (s.AnalysisMessage.includes('المصفوفة') && s.Code.includes('==') && !s.Code.includes('[i]')) {
    // Find array variables and add [i]
    fixedCode = s.Code.replace(/([a-zA-Z]+List)\s*==/g, '$1[i] ==');
    needsFix = true;
    reason = 'Added [i] index to array variables';
  }

  // Pattern 6: Wrong operator for range check
  if (s.AnalysisMessage.includes('الكمية لا يمكن أن تكون') && s.Code.includes('&&')) {
    fixedCode = s.Code.replace(/&&/g, '||');
    needsFix = true;
    reason = 'Changed && to || for range exclusion';
  }

  if (needsFix && fixedCode !== s.Code) {
    fixes.push({
      id: s.Id,
      challengeId: s.ChallengeId,
      title: s.Title,
      analysisType: s.AnalysisType,
      analysis: s.AnalysisMessage,
      oldCode: s.Code,
      newCode: fixedCode,
      reason: reason
    });
  }
});

console.log(`Found ${fixes.length} intelligent fixes\n`);

fixes.slice(0, 20).forEach((f, i) => {
  console.log(`${i+1}. Snippet ID: ${f.id} - ${f.title} [${f.analysisType}]`);
  console.log(`   Reason: ${f.reason}`);
  console.log(`   Analysis: ${f.analysis}`);
  console.log(`   Old: ${f.oldCode}`);
  console.log(`   New: ${f.newCode}`);
  console.log('---');
});

console.log(`\nTotal intelligent fixes: ${fixes.length}`);

// Apply the fixes
if (fixes.length > 0) {
  console.log('\nApplying fixes...');
  let appliedCount = 0;
  fixes.forEach(f => {
    const updateStmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
    updateStmt.run(f.newCode, f.id);
    appliedCount++;
  });
  console.log(`Applied ${appliedCount} fixes to database`);
}

db.close();
