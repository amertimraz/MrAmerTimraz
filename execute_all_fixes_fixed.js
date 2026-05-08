const Database = require('better-sqlite3');
const fs = require('fs');

console.log('🚀 Executing ALL TOEFL Level 2 fixes...');
console.log('==========================================\n');

const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// 1. Apply Complete Fixes (19 snippets)
console.log('📝 STEP 1: Applying Complete Fixes...');
console.log('=====================================\n');

const completeFixes = [
  // Question 22
  { id: 85, code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood != lunchMenu) {\n  console.log("غداء اليوم هو " + lunchMenu);\n} else {\n  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");\n}' },
  { id: 86, code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood == lunchMenu) {\n  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");\n} else {\n  console.log("غداء اليوم هو " + lunchMenu);\n}' },
  { id: 87, code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood != lunchMenu) {\n  console.log("غداء اليوم هو " + lunchMenu + " الذي أحبه");\n}' },
  { id: 88, code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood == lunchMenu) {\n  console.log("غداء اليوم هو " + favoriteFood);\n}' },
  
  // Question 25
  { id: 97, code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday != "الخميس") {\n  console.log("اليوم ليس يوم تخفيضات");\n} else {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime < 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}' },
  { id: 98, code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday != "الخميس") {\n  console.log("اليوم ليس يوم تخفيضات");\n} else {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime > 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}' },
  { id: 99, code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday == "الخميس") {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime < 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}' },
  { id: 100, code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday == "الخميس") {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime > 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}' },
  
  // Question 26
  { id: 101, code: 'let weekday = "الجمعة";\n\nif ((weekday == "الإثنين") && (weekday == "الجمعة")) {\n  console.log("يوم القائمة الخاصة");\n} else {\n  console.log("يوم القائمة العادية");\n}' },
  { id: 102, code: 'let weekday = "الجمعة";\n\nif ((weekday == "الإثنين") || (weekday == "الجمعة")) {\n  console.log("يوم القائمة الخاصة");\n}' },
  
  // Question 30
  { id: 113, code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);' },
  { id: 114, code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);' },
  { id: 115, code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount > 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);' },
  { id: 116, code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount + discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);' },
  
  // Question 36
  { id: 131, code: 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];\nconsole.log("سأطلب " + menuList[1]);' },
  { id: 132, code: 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];\nconsole.log("سأطلب " + menuList[2]);' },
  
  // Question 41
  { id: 142, code: 'let menuList = ["سندويش", "سلطة", "قهوة"];\nconsole.log("قائمة اليوم هي كالتالي");\nconsole.log(menuList);' },
  
  // Question 60
  { id: 181, code: 'let studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];\n\nconsole.log("المواد التي سيتم دراستها اليوم كما يلي");\nfor (let i = 0; i < 3; i++) {\n  if (studySubjects[i] == "رياضيات") {\n    console.log("تخطي");\n  } else {\n    console.log(studySubjects[i]);\n  }\n}' },
  
  // Question 69
  { id: 199, code: 'let reservations = [3, 8, 5];\n\nconsole.log("تحقق من حالة الحجز الحالية");\nfor (let i = 0; i < reservations.length; i++) {\n  console.log("تم حجز " + [i] + " أشخاص");\n}' }
];

let completeSuccess = 0;
let completeFailed = 0;

completeFixes.forEach(fix => {
  try {
    const stmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
    const result = stmt.run(fix.code, fix.id);
    if (result.changes > 0) {
      console.log(`✓ Updated snippet ${fix.id}`);
      completeSuccess++;
    } else {
      console.log(`✗ Snippet ${fix.id} not found`);
      completeFailed++;
    }
  } catch (error) {
    console.log(`✗ Error updating snippet ${fix.id}: ${error.message}`);
    completeFailed++;
  }
});

console.log(`\nComplete Fixes: ${completeSuccess} successful, ${completeFailed} failed\n`);

// 2. Apply Reversed Format (8 questions)
console.log('🔄 STEP 2: Applying Reversed Format...');
console.log('========================================\n');

const reversedFixes = [
  {
    questionId: 22,
    description: '--- Question 22: Question 22 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood != lunchMenu) {\n  console.log("غداء اليوم هو " + lunchMenu);\n} else {\n  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");\n}\n```',
    snippets: [
      { id: 85, code: 'غداء اليوم هو السوشي' },
      { id: 86, code: 'غداء اليوم هو الهامبرغر الذي أحبه' },
      { id: 87, code: 'غداء اليوم هو السوشي الذي أحبه' },
      { id: 88, code: 'غداء اليوم هو الهامبرغر' }
    ]
  },
  {
    questionId: 25,
    description: '--- Question 25: Question 25 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday == "الخميس") {\n  console.log("اليوم هو يوم تخفيضات");\n} else {\n  console.log("اليوم ليس يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime < 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}\n```',
    snippets: [
      { id: 97, code: 'اليوم ليس يوم تخفيضات\nسيفتح قريباً' },
      { id: 98, code: 'اليوم ليس يوم تخفيضات\nمفتوح' },
      { id: 99, code: 'اليوم هو يوم تخفيضات\nسيفتح قريباً' },
      { id: 100, code: 'اليوم هو يوم تخفيضات\nمفتوح' }
    ]
  },
  {
    questionId: 26,
    description: '--- Question 26: Question 26 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet weekday = "الجمعة";\n\nif ((weekday == "الإثنين") || (weekday == "الجمعة")) {\n  console.log("يوم القائمة الخاصة");\n} else {\n  console.log("يوم القائمة العادية");\n}\n```',
    snippets: [
      { id: 101, code: 'يوم القائمة العادية' },
      { id: 102, code: 'يوم القائمة الخاصة' }
    ]
  },
  {
    questionId: 30,
    description: '--- Question 30: Question 30 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);\n```',
    snippets: [
      { id: 113, code: 'المبلغ الإجمالي هو كالتالي\n11000' },
      { id: 114, code: 'سنمنحك قسيمة\nسيتم تطبيق خصم 1000 ين\nالمبلغ الإجمالي هو كالتالي\n11000' },
      { id: 115, code: 'سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n11000' },
      { id: 116, code: 'سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n12000' }
    ]
  },
  {
    questionId: 36,
    description: '--- Question 36: Question 36 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet menuList = ["كاري", "دجاج مشوي", "بارفيه"];\nconsole.log("سأطلب " + menuList[2]);\n```',
    snippets: [
      { id: 131, code: 'سأطلب الدجاج المشوي' },
      { id: 132, code: 'سأطلب بارفيه' }
    ]
  },
  {
    questionId: 41,
    description: '--- Question 41: Question 41 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet menuList = ["سندويش", "سلطة", "قهوة"];\nconsole.log("قائمة اليوم هي كالتالي");\nfor (let i = 0; i < 3; i++) {\n  console.log(menuList[i]);\n}\n```',
    snippets: [
      { id: 141, code: 'قائمة اليوم هي كالتالي\nسندويش\nسلطة\nقهوة' },
      { id: 142, code: 'قائمة اليوم هي كالتالي\nسندويش,سلطة,قهوة' },
      { id: 143, code: 'قائمة اليوم هي كالتالي\nقهوة\nسلطة\nسندويش' }
    ]
  },
  {
    questionId: 60,
    description: '--- Question 60: Question 60 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];\nconsole.log("المواد التي سيتم دراستها اليوم كما يلي");\nfor (let i = 0; i < 3; i++) {\n  console.log(studySubjects[i]);\n}\n```',
    snippets: [
      { id: 180, code: 'المواد التي سيتم دراستها اليوم كما يلي\nعلوم\nرياضيات\nاللغة الإنجليزية' },
      { id: 181, code: 'المواد التي سيتم دراستها اليوم كما يلي\nعلوم\nتخطي\nاللغة الإنجليزية' }
    ]
  },
  {
    questionId: 69,
    description: '--- Question 69: Question 69 ---\nما هو المخرج الصحيح للكود التالي؟\n\n```javascript\nlet reservations = [3, 8, 5];\nconsole.log("تحقق من حالة الحجز الحالية");\nfor (let i = 0; i < reservations.length; i++) {\n  console.log("تم حجز " + reservations[i] + " أشخاص");\n}\n```',
    snippets: [
      { id: 198, code: 'تحقق من حالة الحجز الحالية\nتم حجز 3 أشخاص\nتم حجز 8 أشخاص\nتم حجز 5 أشخاص' },
      { id: 199, code: 'تحقق من حالة الحجز الحالية\nتم حجز 0 أشخاص\nتم حجز 1 أشخاص\nتم حجز 2 أشخاص' }
    ]
  }
];

let reversedSuccess = 0;
let reversedFailed = 0;

reversedFixes.forEach(fix => {
  try {
    // Update question description
    const questionStmt = db.prepare('UPDATE Challenges SET Description = ? WHERE Id = ? AND TestId = 2');
    const questionResult = questionStmt.run(fix.description, fix.questionId);
    
    if (questionResult.changes > 0) {
      console.log(`✓ Updated question ${fix.questionId} description`);
      
      // Update snippets
      fix.snippets.forEach(snippet => {
        try {
          const snippetStmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');
          const snippetResult = snippetStmt.run(snippet.code, snippet.id);
          if (snippetResult.changes > 0) {
            console.log(`  ✓ Updated snippet ${snippet.id}`);
          } else {
            console.log(`  ✗ Snippet ${snippet.id} not found`);
            reversedFailed++;
          }
        } catch (error) {
          console.log(`  ✗ Error updating snippet ${snippet.id}: ${error.message}`);
          reversedFailed++;
        }
      });
      
      reversedSuccess++;
    } else {
      console.log(`✗ Question ${fix.questionId} not found`);
      reversedFailed++;
    }
  } catch (error) {
    console.log(`✗ Error updating question ${fix.questionId}: ${error.message}`);
    reversedFailed++;
  }
});

console.log(`\nReversed Format: ${reversedSuccess} successful, ${reversedFailed} failed\n`);

// 3. Verification
console.log('🔍 STEP 3: Verification...');
console.log('========================\n');

const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM Challenges WHERE TestId = 2').get().count;
const questionsWithCode = db.prepare("SELECT COUNT(*) as count FROM Challenges WHERE TestId = 2 AND Description LIKE '%```%'").get().count;
const incompleteSnippets = db.prepare(`
  SELECT COUNT(*) as count 
  FROM ChallengeSnippets cs 
  JOIN Challenges c ON cs.ChallengeId = c.Id 
  WHERE c.TestId = 2 AND cs.Code LIKE '%...%'
`).get().count;
const shortSnippets = db.prepare(`
  SELECT COUNT(*) as count 
  FROM ChallengeSnippets cs 
  JOIN Challenges c ON cs.ChallengeId = c.Id 
  WHERE c.TestId = 2 AND LENGTH(cs.Code) < 50
`).get().count;

console.log('📊 Final Results:');
console.log(`Total Questions: ${totalQuestions}`);
console.log(`Questions with Code: ${questionsWithCode}`);
console.log(`Incomplete Snippets: ${incompleteSnippets}`);
console.log(`Short Snippets: ${shortSnippets}`);

if (incompleteSnippets === 0 && shortSnippets === 0) {
  console.log('\n🎉 SUCCESS: All fixes applied successfully!');
  console.log('✅ The website should now display all questions correctly.');
} else {
  console.log('\n⚠️  Some issues remain. Please check the results above.');
}

console.log('\n🌐 Check the website: https://mr-amer-timraz.vercel.app/challenges/tofas-test-2');

db.close();
