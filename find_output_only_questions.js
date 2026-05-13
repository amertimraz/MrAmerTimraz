const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Finding questions where snippets are outputs only...');
console.log('================================================\n');

// Get all questions with their snippets
const questions = db.prepare(`
  SELECT 
    c.Id as QuestionId,
    c.Description as QuestionDescription,
    c.TargetOutput,
    cs.Id as SnippetId,
    cs.Code as SnippetCode,
    cs.AnalysisType,
    cs.AnalysisMessage
  FROM Challenges c
  JOIN ChallengeSnippets cs ON c.Id = cs.ChallengeId
  WHERE c.TestId = 2
  ORDER BY c.Id, cs.Id
`).all();

let currentQuestion = null;
let snippets = [];
const outputOnlyQuestions = [];

questions.forEach(row => {
  if (!currentQuestion || currentQuestion.QuestionId !== row.QuestionId) {
    // Analyze previous question
    if (currentQuestion) {
      analyzeQuestion(currentQuestion, snippets, outputOnlyQuestions);
    }
    
    currentQuestion = {
      QuestionId: row.QuestionId,
      Description: row.QuestionDescription,
      TargetOutput: row.TargetOutput
    };
    snippets = [];
  }
  
  snippets.push({
    SnippetId: row.SnippetId,
    Code: row.SnippetCode,
    AnalysisType: row.AnalysisType,
    AnalysisMessage: row.AnalysisMessage
  });
});

// Analyze last question
if (currentQuestion) {
  analyzeQuestion(currentQuestion, snippets, outputOnlyQuestions);
}

console.log('\n=== QUESTIONS THAT NEED TO BE REVERSED ===');
console.log('(Question should contain code, snippets should be outputs)\n');

outputOnlyQuestions.forEach(q => {
  console.log(`Question ${q.QuestionId}: ${q.Title}`);
  console.log(`Current Description: ${q.Description.substring(0, 100)}...`);
  console.log(`Target Output: ${q.TargetOutput}`);
  console.log('Snippets are outputs only - need to reverse format\n');
});

console.log(`Total questions to fix: ${outputOnlyQuestions.length}`);

db.close();

function analyzeQuestion(question, snippets, outputOnlyQuestions) {
  // Check if snippets are just output text (no code)
  const snippetsAreOutput = snippets.every(s => 
    !s.Code.includes('let ') && 
    !s.Code.includes('if ') && 
    !s.Code.includes('for ') &&
    !s.Code.includes('console.log') &&
    !s.Code.includes('var ') &&
    !s.Code.includes('const ') &&
    !s.Code.includes('while ') &&
    !s.Code.includes('switch ')
  );
  
  if (snippetsAreOutput) {
    // Extract title from description
    const titleMatch = question.Description.match(/--- Question \d+: (.+) ---/);
    const title = titleMatch ? titleMatch[1] : `Question ${question.QuestionId}`;
    
    outputOnlyQuestions.push({
      QuestionId: question.QuestionId,
      Title: title,
      Description: question.Description,
      TargetOutput: question.TargetOutput,
      Snippets: snippets
    });
  }
}
