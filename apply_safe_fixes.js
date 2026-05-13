const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get incomplete snippets
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Applying safe fixes...');
console.log('=====================\n');

let appliedCount = 0;
const safeFixes = [];

incompleteSnippets.forEach(s => {
  let fixedCode = s.Code;
  let isSafeFix = false;

  // SAFE FIX 1: Syntax error - if (let i = ...) should be for (let i = ...)
  if (s.AnalysisMessage.includes('استخدام if بدلاً من for') && s.Code.match(/if\s*\(\s*let\s+i\s*=/)) {
    fixedCode = s.Code.replace('if (let', 'for (let');
    isSafeFix = true;
  }

  // SAFE FIX 2: Missing .length for array
  if (s.AnalysisMessage.includes('.length') && !s.Code.includes('.length') && s.Code.includes('for (let i = 0; i < ')) {
    // Pattern: for (let i = 0; i < array; i++) -> for (let i = 0; i < array.length; i++)
    fixedCode = s.Code.replace(/i < ([a-zA-Z]+);/g, 'i < $1.length;');
    isSafeFix = true;
  }

  // SAFE FIX 3: if (shoppingBasket > 3) -> if (shoppingBasket.length > 3)
  if (s.AnalysisMessage.includes('يجب استخدام خاصية .length') && s.Code.includes('> 3')) {
    fixedCode = s.Code.replace(/([a-zA-Z]+)\s*>\s*(\d+)/g, '$1.length > $2');
    isSafeFix = true;
  }

  // SAFE FIX 4: for (i < 3) -> for (let i = 0; i < 3; i++)
  if (s.Code === 'for (i < 3) { ... }') {
    fixedCode = 'for (let i = 0; i < 3; i++) { ... }';
    isSafeFix = true;
  }

  if (isSafeFix && fixedCode !== s.Code) {
    // Apply the fix
    const updateStmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
    updateStmt.run(fixedCode, s.Id);
    
    safeFixes.push({
      id: s.Id,
      challengeId: s.ChallengeId,
      title: s.Title,
      oldCode: s.Code,
      newCode: fixedCode
    });
    appliedCount++;
  }
});

console.log(`Applied ${appliedCount} safe fixes:\n`);

safeFixes.forEach((f, i) => {
  console.log(`${i+1}. Snippet ID: ${f.id} - ${f.title}`);
  console.log(`   Old: ${f.oldCode}`);
  console.log(`   New: ${f.newCode}`);
  console.log('---');
});

console.log(`\nTotal safe fixes applied: ${appliedCount}`);
console.log(`Remaining snippets with "..." still need manual fixes`);

db.close();
