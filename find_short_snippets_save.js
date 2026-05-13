const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const snippets = db.prepare(`
  SELECT c.Id, c.Title, cs.Id as SnippetId, cs.AnalysisType, cs.Code, length(cs.Code) as CodeLength
  FROM Challenges c
  JOIN ChallengeSnippets cs ON c.Id = cs.ChallengeId
  WHERE c.TestId = 2
  ORDER BY c.OrderIndex, cs.OrderIndex
`).all();

let output = 'Short snippets (missing full code):\n';
output += '=====================================\n\n';

const shortSnippets = snippets.filter(s => s.CodeLength < 50);

shortSnippets.forEach((s, i) => {
  output += `${i+1}. Question ${s.Id}: ${s.Title}\n`;
  output += `   Snippet ${s.SnippetId} [${s.AnalysisType}] (${s.CodeLength} chars)\n`;
  output += `   Code: ${s.Code}\n`;
  output += '---\n';
});

output += `\nTotal short snippets: ${shortSnippets.length}\n`;

fs.writeFileSync('short_snippets_list.txt', output);
console.log('Saved to short_snippets_list.txt');

db.close();
