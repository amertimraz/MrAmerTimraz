const Database = require('better-sqlite3');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('🔧 Fixing undefined snippets...');
console.log('===============================\n');

// Fix the undefined snippets with the correct output values
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
    const stmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
    const result = stmt.run(fix.code, fix.id);
    if (result.changes > 0) {
      console.log(`✓ Fixed snippet ${fix.id}`);
      success++;
    } else {
      console.log(`✗ Snippet ${fix.id} not found`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ Error fixing snippet ${fix.id}: ${error.message}`);
    failed++;
  }
});

console.log(`\nResults: ${success} successful, ${failed} failed\n`);

// Verification
const remainingShort = db.prepare(`
  SELECT COUNT(*) as count 
  FROM ChallengeSnippets cs 
  JOIN Challenges c ON cs.ChallengeId = c.Id 
  WHERE c.TestId = 2 AND LENGTH(cs.Code) < 50
`).get().count;

console.log(`🔍 Remaining short snippets: ${remainingShort}`);

if (remainingShort === 0) {
  console.log('\n🎉 SUCCESS: All snippets are now fixed!');
  console.log('✅ The website should display all questions correctly now.');
} else {
  console.log('\n⚠️  Some issues remain.');
}

console.log('\n🌐 Check the website: https://mr-amer-timraz.vercel.app/challenges/tofas-test-2');

db.close();
