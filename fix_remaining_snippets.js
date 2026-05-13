const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get the remaining incomplete snippets
const remainingSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, c.Description, c.TargetOutput, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Fixing remaining 4 snippets...');
console.log('================================\n');

const fixes = [];

remainingSnippets.forEach(s => {
  let fixedCode = s.Code;
  let reason = '';

  // Fix 1: Snippet 146 - Complete the second if statement
  if (s.Id === 146) {
    fixedCode = `if (date == "3") {
  console.log("في يوم 3 تحصل على 3 أضعاف النقاط");
  console.log("الشحن مجاني");
}
if (shoppingBasket.length > 3) {
  console.log("في يوم 3 تحصل على 3 أضعاف النقاط");
  console.log("الشحن مجاني");
}`;
    reason = 'Completed second if statement';
  }

  // Fix 2: Snippet 167 - Complete for loop based on target output
  if (s.Id === 167) {
    fixedCode = `for (let i = 0; i < activityList.length; i++) {
  console.log(activityList[i] + " سيتم تنفيذها");
}`;
    reason = 'Completed for loop with console.log';
  }

  // Fix 3: Snippet 183 - Fix syntax error - array comparison
  if (s.Id === 183) {
    fixedCode = `for (let i = 0; i < students.length; i++) {
  if (students[i] != absentStudent) {
    console.log(students[i] + " حاضرة");
  }
}`;
    reason = 'Fixed: changed to for loop with array index comparison';
  }

  // Fix 4: Snippet 195 - Fix syntax error - missing .length
  if (s.Id === 195) {
    fixedCode = `if ((statusList.length >= 3) && (statusList[0] == "متوفر في المخزون")) {
  console.log("سنقوم بتنفيذ المهمة");
}`;
    reason = 'Fixed: added .length to statusList';
  }

  if (fixedCode !== s.Code) {
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

console.log(`Found ${fixes.length} fixes\n`);

fixes.forEach((f, i) => {
  console.log(`${i+1}. Snippet ID: ${f.id} - ${f.title} [${f.analysisType}]`);
  console.log(`   Reason: ${f.reason}`);
  console.log(`   Analysis: ${f.analysis}`);
  console.log(`   Old Code:\n${f.oldCode}`);
  console.log(`   New Code:\n${f.newCode}`);
  console.log('---');
});

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
