const Database = require('better-sqlite3');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('🔍 Checking remaining short snippets...');
console.log('=====================================\n');

const shortSnippets = db.prepare(`
  SELECT 
    cs.Id as SnippetId,
    cs.Code as SnippetCode,
    cs.AnalysisType,
    cs.AnalysisMessage,
    c.Id as QuestionId,
    c.Description as QuestionDescription,
    c.TargetOutput
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2 AND LENGTH(cs.Code) < 50
  ORDER BY c.Id, cs.Id
`).all();

console.log(`Found ${shortSnippets.length} short snippets:\n`);

shortSnippets.forEach(snippet => {
  console.log(`--- Question ${snippet.QuestionId} ---`);
  console.log(`Snippet ${snippet.SnippetId}: [${snippet.AnalysisType}]`);
  console.log(`Code: "${snippet.Code}"`);
  console.log(`Target Output: "${snippet.TargetOutput}"`);
  console.log('');
});

db.close();
