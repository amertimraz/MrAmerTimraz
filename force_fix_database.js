const Database = require('better-sqlite3');

console.log('🔥 FORCE FIX: Direct database update...');
console.log('========================================\n');

// Try multiple database paths
const dbPaths = [
  'f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db',
  './Backend/EduPlatform.API/EduPlatform.db',
  '../Backend/EduPlatform.API/EduPlatform.db'
];

let db = null;
for (const path of dbPaths) {
  try {
    db = new Database(path);
    console.log(`✓ Connected to database: ${path}`);
    break;
  } catch (error) {
    console.log(`✗ Failed to connect to ${path}: ${error.message}`);
  }
}

if (!db) {
  console.log('❌ Could not connect to any database');
  process.exit(1);
}

// Check current state
const currentState = db.prepare(`
  SELECT 
    COUNT(*) as totalSnippets,
    SUM(CASE WHEN Code = 'undefined' THEN 1 ELSE 0 END) as undefinedSnippets,
    SUM(CASE WHEN LENGTH(Code) < 50 THEN 1 ELSE 0 END) as shortSnippets
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2
`).get();

console.log('📊 Current database state:');
console.log(`Total snippets: ${currentState.totalSnippets}`);
console.log(`Undefined snippets: ${currentState.undefinedSnippets}`);
console.log(`Short snippets: ${currentState.shortSnippets}\n`);

// Force update with transaction
console.log('🔧 Applying force fixes...');
const transaction = db.transaction(() => {
  const fixes = [
    // Question 22
    { id: 85, code: 'غداء اليوم هو السوشي' },
    { id: 86, code: 'غداء اليوم هو الهامبرغر الذي أحبه' },
    { id: 87, code: 'غداء اليوم هو السوشي الذي أحبه' },
    { id: 88, code: 'غداء اليوم هو الهامبرغر' },
    
    // Question 25
    { id: 97, code: 'اليوم ليس يوم تخفيضات\nسيفتح قريباً' },
    { id: 98, code: 'اليوم ليس يوم تخفيضات\nمفتوح' },
    { id: 99, code: 'اليوم هو يوم تخفيضات\nسيفتح قريباً' },
    { id: 100, code: 'اليوم هو يوم تخفيضات\nمفتوح' },
    
    // Question 26
    { id: 101, code: 'يوم القائمة العادية' },
    { id: 102, code: 'يوم القائمة الخاصة' },
    
    // Question 30
    { id: 113, code: 'المبلغ الإجمالي هو كالتالي\n11000' },
    { id: 115, code: 'سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n11000' },
    { id: 116, code: 'سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n12000' },
    
    // Question 36
    { id: 131, code: 'سأطلب الدجاج المشوي' },
    { id: 132, code: 'سأطلب بارفيه' },
    
    // Question 41
    { id: 141, code: 'قائمة اليوم هي كالتالي\nسندويش\nسلطة\nقهوة' },
    { id: 142, code: 'قائمة اليوم هي كالتالي\nسندويش,سلطة,قهوة' },
    { id: 143, code: 'قائمة اليوم هي كالتالي\nقهوة\nسلطة\nسندويش' }
  ];

  let success = 0;
  let failed = 0;

  fixes.forEach(fix => {
    try {
      // First check if snippet exists
      const check = db.prepare('SELECT Id FROM ChallengeSnippets WHERE Id = ?').get(fix.id);
      if (!check) {
        console.log(`✗ Snippet ${fix.id} not found`);
        failed++;
        return;
      }

      // Update with explicit SQL
      const stmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
      const result = stmt.run(fix.code, fix.id);
      
      if (result.changes > 0) {
        console.log(`✓ Fixed snippet ${fix.id}`);
        success++;
      } else {
        console.log(`✗ No changes for snippet ${fix.id}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ Error fixing snippet ${fix.id}: ${error.message}`);
      failed++;
    }
  });

  return { success, failed };
});

const result = transaction();
console.log(`\n📊 Transaction results: ${result.success} successful, ${result.failed} failed`);

// Verify after update
const afterState = db.prepare(`
  SELECT 
    COUNT(*) as totalSnippets,
    SUM(CASE WHEN Code = 'undefined' THEN 1 ELSE 0 END) as undefinedSnippets,
    SUM(CASE WHEN LENGTH(Code) < 50 THEN 1 ELSE 0 END) as shortSnippets
  FROM ChallengeSnippets cs
  JOIN Challenges c ON cs.ChallengeId = c.Id
  WHERE c.TestId = 2
`).get();

console.log('\n📊 Database state after fix:');
console.log(`Total snippets: ${afterState.totalSnippets}`);
console.log(`Undefined snippets: ${afterState.undefinedSnippets}`);
console.log(`Short snippets: ${afterState.shortSnippets}`);

// Check specific snippets
console.log('\n🔍 Checking specific fixed snippets:');
const checkSpecific = db.prepare(`
  SELECT Id, Code, LENGTH(Code) as length
  FROM ChallengeSnippets 
  WHERE Id IN (85, 86, 87, 88, 97, 98, 99, 100, 101, 102, 113, 115, 116, 131, 132, 141, 142, 143)
  ORDER BY Id
`).all();

checkSpecific.forEach(snippet => {
  const preview = snippet.Code.length > 30 ? snippet.Code.substring(0, 30) + '...' : snippet.Code;
  console.log(`Snippet ${snippet.Id}: "${preview}" (${snippet.length} chars)`);
});

if (afterState.undefinedSnippets === 0 && afterState.shortSnippets === 0) {
  console.log('\n🎉 SUCCESS: All snippets are now fixed!');
  console.log('✅ The website should display all questions correctly now.');
} else {
  console.log('\n⚠️  Issues remain - may need to check database path or deployment.');
}

console.log('\n🌐 Check the website: https://mr-amer-timraz.vercel.app/challenges/tofas-test-2');

db.close();
