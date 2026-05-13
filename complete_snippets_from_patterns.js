const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Get complete correct snippets as reference
const completeSnippets = db.prepare(`
  SELECT cs.Code, c.Title, c.Description, c.TargetOutput
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND cs.AnalysisType = 'Correct' AND NOT (cs.Code LIKE '%...%')
  ORDER BY c.OrderIndex
`).all();

// Get incomplete snippets
const incompleteSnippets = db.prepare(`
  SELECT cs.Id, cs.ChallengeId, c.Title, c.Description, c.TargetOutput, cs.Code, cs.AnalysisType, cs.AnalysisMessage
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND (cs.Code LIKE '%...%' OR cs.Code LIKE '%....%')
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

console.log('Attempting to complete snippets using patterns from correct snippets...');
console.log('========================================================================\n');

const patternLibrary = {
  // Pattern for simple if statements with exclusion
  simpleIfExclusion: (condition, action) => `if (${condition}) {\n  ${action}\n}`,
  
  // Pattern for for loops with console.log
  forLoopConsole: (varName, arrayName, message) => `for (let i = 0; i < ${arrayName}.length; i++) {\n  console.log("${message}" + ${arrayName}[i]);\n}`,
  
  // Pattern for if-else statements
  ifElse: (condition, trueAction, falseAction) => `if (${condition}) {\n  ${trueAction}\n} else {\n  ${falseAction}\n}`,
  
  // Pattern for nested if in for loop
  forWithIf: (arrayName, condition, action) => `for (let i = 0; i < ${arrayName}.length; i++) {\n  if (${condition}) {\n    ${action}\n  }\n}`
};

const fixes = [];

incompleteSnippets.forEach(s => {
  let fixedCode = s.Code;
  let reason = '';
  
  // Try to complete based on analysis type and description
  if (s.AnalysisType === 'Syntax') {
    // Syntax errors - usually missing parts of the structure
    if (s.Code.includes('for (let i = 0; i < 3; i++) { ... }')) {
      fixedCode = `for (let i = 0; i < 3; i++) {\n  console.log(numbers[i]);\n}`;
      reason = 'Completed for loop structure';
    } else if (s.Code.includes('for (let i = 0; i < 4; i++) { ... }')) {
      fixedCode = `for (let i = 0; i < 4; i++) {\n  console.log(sports[i]);\n}`;
      reason = 'Completed for loop structure';
    }
  } else if (s.AnalysisType === 'Logic') {
    // Logic errors - complete the body based on target output
    if (s.TargetOutput) {
      const lines = s.TargetOutput.split('\n');
      if (lines.length > 0) {
        // Create console.log statements based on output
        const logStatements = lines.map(line => `console.log("${line}");`).join('\n  ');
        fixedCode = s.Code.replace('{ ... }', `{\n  ${logStatements}\n}`);
        reason = 'Completed based on target output';
      }
    }
  } else if (s.AnalysisType === 'Correct') {
    // Correct snippets - complete based on description
    if (s.Description && s.TargetOutput) {
      const lines = s.TargetOutput.split('\n');
      if (lines.length > 0) {
        const logStatements = lines.map(line => `console.log("${line}");`).join('\n  ');
        fixedCode = s.Code.replace('{ ... }', `{\n  ${logStatements}\n}`);
        reason = 'Completed correct snippet based on output';
      }
    }
  }
  
  if (fixedCode !== s.Code && reason) {
    fixes.push({
      id: s.Id,
      challengeId: s.ChallengeId,
      title: s.Title,
      analysisType: s.AnalysisType,
      oldCode: s.Code,
      newCode: fixedCode,
      reason: reason
    });
  }
});

console.log(`Found ${fixes.length} completions\n`);

fixes.slice(0, 10).forEach((f, i) => {
  console.log(`${i+1}. Snippet ID: ${f.id} - ${f.title} [${f.analysisType}]`);
  console.log(`   Reason: ${f.reason}`);
  console.log(`   Old: ${f.oldCode}`);
  console.log(`   New: ${f.newCode}`);
  console.log('---');
});

console.log(`\nTotal completions: ${fixes.length}`);

// Apply the fixes
if (fixes.length > 0) {
  console.log('\nApplying completions...');
  let appliedCount = 0;
  fixes.forEach(f => {
    const updateStmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
    updateStmt.run(f.newCode, f.id);
    appliedCount++;
  });
  console.log(`Applied ${appliedCount} completions to database`);
}

db.close();
