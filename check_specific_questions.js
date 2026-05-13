const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Checking specific questions mentioned by user...');
console.log('===========================================\n');

// Check questions that might have the wrong format
const questionsToCheck = [22, 25, 26, 30, 36, 41, 60, 69];

questionsToCheck.forEach(questionId => {
  const question = db.prepare(`
    SELECT 
      c.Id as QuestionId,
      c.Description as QuestionDescription,
      c.TargetOutput
    FROM Challenges c
    WHERE c.TestId = 2 AND c.Id = ?
  `).get(questionId);
  
  if (question) {
    const snippets = db.prepare(`
      SELECT 
        cs.Id as SnippetId,
        cs.Code as SnippetCode,
        cs.AnalysisType,
        cs.AnalysisMessage
      FROM ChallengeSnippets cs
      WHERE cs.ChallengeId = ?
      ORDER BY cs.Id
    `).all(questionId);
    
    console.log(`--- Question ${questionId} ---`);
    console.log(`Description: ${question.QuestionDescription}`);
    console.log(`Target Output: ${question.TargetOutput}\n`);
    
    console.log('Snippets:');
    snippets.forEach((snippet, index) => {
      const code = snippet.Code || '';
      const codePreview = code.length > 100 ? 
        code.substring(0, 100) + '...' : 
        code;
      console.log(`  ${index + 1}. [${snippet.AnalysisType}] ${codePreview}`);
    });
    
    // Check if this should be reversed
    const hasCodeInSnippets = snippets.some(s => {
      const code = s.Code || '';
      return code.includes('let ') || 
             code.includes('if ') || 
             code.includes('for ') ||
             code.includes('console.log');
    });
    
    if (!hasCodeInSnippets) {
      console.log('\n⚠️  This question might need to be reversed:');
      console.log('   - Move code to question description');
      console.log('   - Move outputs to snippets');
    } else {
      console.log('\n✅ Format looks correct');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  } else {
    console.log(`Question ${questionId} not found\n`);
  }
});

db.close();
