const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// Define all the fixes
const fixes = [
  // Question 22: تحدي منطق 'لا يساوي'
  {
    id: 85,
    code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood != lunchMenu) {\n  console.log("غداء اليوم هو " + lunchMenu);\n} else {\n  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");\n}'
  },
  {
    id: 86,
    code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood == lunchMenu) {\n  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");\n} else {\n  console.log("غداء اليوم هو " + lunchMenu);\n}'
  },
  {
    id: 87,
    code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood != lunchMenu) {\n  console.log("غداء اليوم هو " + lunchMenu + " الذي أحبه");\n}'
  },
  {
    id: 88,
    code: 'let favoriteFood = "الهامبرغر";\nlet lunchMenu = "السوشي";\n\nif (favoriteFood == lunchMenu) {\n  console.log("غداء اليوم هو " + favoriteFood);\n}'
  },
  // Question 25: تحدي الوقت والمواعيد
  {
    id: 97,
    code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday != "الخميس") {\n  console.log("اليوم ليس يوم تخفيضات");\n} else {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime < 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}'
  },
  {
    id: 98,
    code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday != "الخميس") {\n  console.log("اليوم ليس يوم تخفيضات");\n} else {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime > 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}'
  },
  {
    id: 99,
    code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday == "الخميس") {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime < 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}'
  },
  {
    id: 100,
    code: 'let weekday = "الخميس";\nlet currentTime = 8;\n\nif (weekday == "الخميس") {\n  console.log("اليوم هو يوم تخفيضات");\n}\n\nif ((currentTime > 10) && (currentTime > 22)) {\n  console.log("مفتوح");\n} else {\n  console.log("سيفتح قريباً");\n}'
  },
  // Question 26: تحدي القائمة اليومية (||)
  {
    id: 101,
    code: 'let weekday = "الجمعة";\n\nif ((weekday == "الإثنين") && (weekday == "الجمعة")) {\n  console.log("يوم القائمة الخاصة");\n} else {\n  console.log("يوم القائمة العادية");\n}'
  },
  {
    id: 102,
    code: 'let weekday = "الجمعة";\n\nif ((weekday == "الإثنين") || (weekday == "الجمعة")) {\n  console.log("يوم القائمة الخاصة");\n}'
  },
  // Question 30: تحدي نظام القسائم والخصومات
  {
    id: 113,
    code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);'
  },
  {
    id: 114,
    code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);'
  },
  {
    id: 115,
    code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount > 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount - discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);'
  },
  {
    id: 116,
    code: 'let totalAmount = 12000;\nlet discount = 1000;\n\nif (totalAmount >= 10000) {\n  console.log("سنمنحك قسيمة");\n  totalAmount = totalAmount + discount;\n}\nconsole.log("المبلغ الإجمالي هو كالتالي");\nconsole.log(totalAmount);'
  },
  // Question 36: تحدي قائمة الطعام والمصفوفات
  {
    id: 131,
    code: 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];\nconsole.log("سأطلب " + menuList[1]);'
  },
  {
    id: 132,
    code: 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];\nconsole.log("سأطلب " + menuList[2]);'
  },
  // Question 41: تحدي قائمة اليوم والمصفوفات
  {
    id: 142,
    code: 'let menuList = ["سندويش", "سلطة", "قهوة"];\nconsole.log("قائمة اليوم هي كالتالي");\nconsole.log(menuList);'
  },
  // Question 60: تحدي جدول الدراسة اليومي
  {
    id: 181,
    code: 'let studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];\n\nconsole.log("المواد التي سيتم دراستها اليوم كما يلي");\nfor (let i = 0; i < 3; i++) {\n  if (studySubjects[i] == "رياضيات") {\n    console.log("تخطي");\n  } else {\n    console.log(studySubjects[i]);\n  }\n}'
  },
  // Question 69: تحدي حالة الحجز التفصيلية
  {
    id: 199,
    code: 'let reservations = [3, 8, 5];\n\nconsole.log("تحقق من حالة الحجز الحالية");\nfor (let i = 0; i < reservations.length; i++) {\n  console.log("تم حجز " + [i] + " أشخاص");\n}'
  }
];

console.log('Updating snippets with full code...');
console.log('==================================\n');

const updateStmt = db.prepare('UPDATE ChallengeSnippets SET Code = ? WHERE Id = ?');

let successCount = 0;
let errorCount = 0;

fixes.forEach(fix => {
  try {
    updateStmt.run(fix.code, fix.id);
    successCount++;
    console.log(`✓ Updated snippet ${fix.id}`);
  } catch (error) {
    errorCount++;
    console.error(`✗ Failed to update snippet ${fix.id}:`, error.message);
  }
});

console.log(`\n${successCount} snippets updated successfully`);
console.log(`${errorCount} snippets failed to update`);

db.close();
