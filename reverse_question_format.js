const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

console.log('Reversing question format: Moving code to description, outputs to snippets...');
console.log('========================================================================\n');

// Questions that need to be reversed based on analysis
const questionsToReverse = [22, 25, 26, 30, 36, 41, 60, 69];

// Define the correct code for each question based on the images
const questionCodes = {
  22: `let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood != lunchMenu) {
  console.log("غداء اليوم هو " + lunchMenu);
} else {
  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");
}`,
  
  25: `let weekday = "الخميس";
let currentTime = 8;

if (weekday == "الخميس") {
  console.log("اليوم هو يوم تخفيضات");
} else {
  console.log("اليوم ليس يوم تخفيضات");
}

if ((currentTime > 10) && (currentTime < 22)) {
  console.log("مفتوح");
} else {
  console.log("سيفتح قريباً");
}`,
  
  26: `let weekday = "الجمعة";

if ((weekday == "الإثنين") || (weekday == "الجمعة")) {
  console.log("يوم القائمة الخاصة");
} else {
  console.log("يوم القائمة العادية");
}`,
  
  30: `let totalAmount = 12000;
let discount = 1000;

if (totalAmount >= 10000) {
  console.log("سنمنحك قسيمة");
  totalAmount = totalAmount - discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);`,
  
  36: `let menuList = ["كاري", "دجاج مشوي", "بارفيه"];
console.log("سأطلب " + menuList[2]);`,
  
  41: `let menuList = ["سندويش", "سلطة", "قهوة"];
console.log("قائمة اليوم هي كالتالي");
for (let i = 0; i < 3; i++) {
  console.log(menuList[i]);
}`,
  
  60: `let studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];
console.log("المواد التي سيتم دراستها اليوم كما يلي");
for (let i = 0; i < 3; i++) {
  console.log(studySubjects[i]);
}`,
  
  69: `let reservations = [3, 8, 5];
console.log("تحقق من حالة الحجز الحالية");
for (let i = 0; i < reservations.length; i++) {
  console.log("تم حجز " + reservations[i] + " أشخاص");
}`
};

// Define the correct outputs for each snippet
const snippetOutputs = {
  22: {
    85: "غداء اليوم هو السوشي",
    86: "غداء اليوم هو الهامبرغر الذي أحبه",
    87: "غداء اليوم هو السوشي الذي أحبه",
    88: "غداء اليوم هو الهامبرغر"
  },
  25: {
    97: "اليوم ليس يوم تخفيضات\nسيفتح قريباً",
    98: "اليوم ليس يوم تخفيضات\nمفتوح",
    99: "اليوم هو يوم تخفيضات\nسيفتح قريباً",
    100: "اليوم هو يوم تخفيضات\nمفتوح"
  },
  26: {
    101: "يوم القائمة العادية",
    102: "يوم القائمة الخاصة"
  },
  30: {
    113: "المبلغ الإجمالي هو كالتالي\n11000",
    114: "سنمنحك قسيمة\nسيتم تطبيق خصم 1000 ين\nالمبلغ الإجمالي هو كالتالي\n11000",
    115: "سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n11000",
    116: "سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n12000"
  },
  36: {
    131: "سأطلب الدجاج المشوي",
    132: "سأطلب بارفيه"
  },
  41: {
    141: "قائمة اليوم هي كالتالي\nسندويش\nسلطة\nقهوة",
    142: "قائمة اليوم هي كالتالي\nسندويش,سلطة,قهوة",
    143: "قائمة اليوم هي كالتالي\nقهوة\nسلطة\nسندويش"
  },
  60: {
    180: "المواد التي سيتم دراستها اليوم كما يلي\nعلوم\nرياضيات\nاللغة الإنجليزية",
    181: "المواد التي سيتم دراستها اليوم كما يلي\nعلوم\nتخطي\nاللغة الإنجليزية"
  },
  69: {
    198: "تحقق من حالة الحجز الحالية\nتم حجز 3 أشخاص\nتم حجز 8 أشخاص\nتم حجز 5 أشخاص",
    199: "تحقق من حالة الحجز الحالية\nتم حجز 0 أشخاص\nتم حجز 1 أشخاص\nتم حجز 2 أشخاص"
  }
};

questionsToReverse.forEach(questionId => {
  console.log(`Processing Question ${questionId}...`);
  
  // Update question description to include the code
  const updateQuestion = db.prepare(`
    UPDATE Challenges 
    SET Description = ? 
    WHERE Id = ? AND TestId = 2
  `);
  
  const question = db.prepare(`
    SELECT Description, TargetOutput 
    FROM Challenges 
    WHERE Id = ? AND TestId = 2
  `).get(questionId);
  
  if (question && questionCodes[questionId]) {
    // Extract the title from the description
    const titleMatch = question.Description.match(/--- Question \d+: (.+) ---/);
    const title = titleMatch ? titleMatch[1] : `Question ${questionId}`;
    
    // Create new description with code
    const newDescription = `--- Question ${questionId}: ${title} ---
ما هو المخرج الصحيح للكود التالي؟

\`\`\`javascript
${questionCodes[questionId]}
\`\`\``;
    
    updateQuestion.run(newDescription, questionId);
    console.log(`  ✓ Updated question description`);
    
    // Update snippets with outputs
    if (snippetOutputs[questionId]) {
      const updateSnippet = db.prepare(`
        UPDATE ChallengeSnippets 
        SET Code = ? 
        WHERE Id = ?
      `);
      
      Object.entries(snippetOutputs[questionId]).forEach(([snippetId, output]) => {
        updateSnippet.run(output, parseInt(snippetId));
        console.log(`  ✓ Updated snippet ${snippetId}`);
      });
    }
    
    console.log(`  ✓ Question ${questionId} reversed successfully\n`);
  } else {
    console.log(`  ✗ Question ${questionId} not found or no code defined\n`);
  }
});

console.log('All questions reversed successfully!');
console.log('Format is now: Question with code → Snippets with outputs');

db.close();
