const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Analyzing question types for Tofas Level 2...');
console.log('==========================================\n');

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

questions.forEach(row => {
  if (!currentQuestion || currentQuestion.QuestionId !== row.QuestionId) {
    // Print previous question analysis
    if (currentQuestion) {
      analyzeQuestion(currentQuestion, snippets);
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

// Print last question
if (currentQuestion) {
  analyzeQuestion(currentQuestion, snippets);
}

function analyzeQuestion(question, snippets) {
  console.log(`--- Question ${question.QuestionId} ---`);
  console.log(`Description: ${question.Description}`);
  console.log(`Target Output: ${question.TargetOutput}\n`);
  
  // Check if question description contains code
  const hasCodeInDescription = question.Description.includes('let ') || 
                              question.Description.includes('if ') || 
                              question.Description.includes('for ') ||
                              question.Description.includes('console.log');
  
  // Check if snippets are just output text
  const snippetsAreOutput = snippets.every(s => 
    !s.Code.includes('let ') && 
    !s.Code.includes('if ') && 
    !s.Code.includes('for ') &&
    !s.Code.includes('console.log')
  );
  
  console.log('Snippets:');
  snippets.forEach((snippet, index) => {
    console.log(`  ${index + 1}. [${snippet.AnalysisType}] ${snippet.Code.substring(0, 50)}...`);
  });
  
  if (hasCodeInDescription) {
    console.log('\n⚠️  Question contains code - snippets should be OUTPUTS');
  } else if (snippetsAreOutput) {
    console.log('\n⚠️  Snippets are outputs - question should contain CODE');
  } else {
    console.log('\n✅ Correct format: question text + code snippets');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

db.close();
