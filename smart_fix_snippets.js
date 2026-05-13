const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get all incomplete snippets with their context
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, c.Description, c.TargetOutput, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Smart fixing incomplete snippets...');
console.log('===================================\n');

const fixes = [];

incompleteSnippets.forEach(s => {
  let fixedCode = s.Code;
  let needsFix = false;

  // Pattern 1: if (let i = ...) should be for (let i = ...)
  if (s.Code.match(/if\s*\(\s*let\s+i\s*=/)) {
    fixedCode = s.Code.replace('if (let', 'for (let');
    needsFix = true;
  }

  // Pattern 2: Logic errors with && when should be !=
  // "لا يمكن أن يكون X و Y في نفس الوقت"
  if (s.AnalysisMessage.includes('لا يمكن') && s.AnalysisMessage.includes('في نفس الوقت') && s.Code.includes('&&')) {
    // Keep the structure but change && to logic that makes sense
    // Actually, this should often be != instead of ==
    fixedCode = s.Code.replace(/==/g, '!=');
    needsFix = true;
  }

  // Pattern 3: Logic errors with || when should be &&
  // "استخدام (||) سيجعل الشرط صحيحاً"
  if (s.AnalysisMessage.includes('استخدام (||) سيجعل') && s.Code.includes('||')) {
    fixedCode = s.Code.replace(/\|\|/g, '&&');
    needsFix = true;
  }

  // Pattern 4: Missing .length for array comparison
  if (s.AnalysisMessage.includes('.length') && !s.Code.includes('.length')) {
    // Find pattern like "array < number" and change to "array.length < number"
    fixedCode = s.Code.replace(/([a-zA-Z]+)(\s*[><=!]=?\s*\d+)/g, (match, varName, operator) => {
      if (['i', 'j', 'k'].includes(varName)) return match; // Don't change loop variables
      return `${varName}.length${operator}`;
    });
    needsFix = true;
  }

  // Pattern 5: Wrong comparison operator
  if (s.AnalysisMessage.includes('لا يمكن') && s.AnalysisMessage.includes('أن يكون') && s.Code.includes('==')) {
    fixedCode = s.Code.replace(/==/g, '!=');
    needsFix = true;
  }

  // Pattern 6: For loop missing initialization
  if (s.Code === 'for (i < 3) { ... }') {
    fixedCode = 'for (let i = 0; i < 3; i++) { ... }';
    needsFix = true;
  }

  // Pattern 7: Array comparison instead of element comparison
  if (s.AnalysisMessage.includes('المصفوفة') && s.Code.includes('==') && !s.Code.includes('[i]')) {
    // Add [i] to array variables
    fixedCode = s.Code.replace(/([a-zA-Z]+List)\s*==/g, '$1[i] ==');
    needsFix = true;
  }

  if (needsFix) {
    fixes.push({
      id: s.Id,
      challengeId: s.ChallengeId,
      title: s.Title,
      description: s.Description,
      targetOutput: s.TargetOutput,
      oldCode: s.Code,
      newCode: fixedCode,
      analysis: s.AnalysisMessage,
      analysisType: s.AnalysisType
    });
  }
});

console.log(`Found ${fixes.length} snippets that can be auto-fixed\n`);

// Show fixes
fixes.slice(0, 15).forEach((f, i) => {
  console.log(`${i+1}. Challenge ID: ${f.challengeId} - ${f.title}`);
  console.log(`   Snippet ID: ${f.id} [${f.analysisType}]`);
  console.log(`   Description: ${f.description}`);
  console.log(`   Target Output: ${f.targetOutput}`);
  console.log(`   Analysis: ${f.analysis}`);
  console.log(`   Old Code: ${f.oldCode}`);
  console.log(`   New Code: ${f.newCode}`);
  console.log('---');
});

console.log(`\nTotal auto-fixable: ${fixes.length}`);
console.log(`Remaining manual fixes: ${incompleteSnippets.length - fixes.length}`);

// Show remaining manual fixes
const remaining = incompleteSnippets.filter(s => !fixes.find(f => f.id === s.id));
if (remaining.length > 0) {
  console.log('\nRemaining snippets that need manual fixes:');
  console.log('===========================================');
  remaining.slice(0, 10).forEach((s, i) => {
    console.log(`${i+1}. ${s.title} [${s.AnalysisType}]`);
    console.log(`   Code: ${s.Code}`);
    console.log(`   Analysis: ${s.AnalysisMessage}`);
  });
}

db.close();
