-- Fix questions with incomplete snippets (only output text instead of full code)

-- Question 22: تحدي منطق 'لا يساوي'
-- The snippets should contain full code, not just output text
UPDATE ChallengeSnippets SET Code = 'let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood != lunchMenu) {
  console.log("غداء اليوم هو " + lunchMenu);
} else {
  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");
}' WHERE Id = 85;

UPDATE ChallengeSnippets SET Code = 'let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood == lunchMenu) {
  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");
} else {
  console.log("غداء اليوم هو " + lunchMenu);
}' WHERE Id = 86;

UPDATE ChallengeSnippets SET Code = 'let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood != lunchMenu) {
  console.log("غداء اليوم هو " + lunchMenu + " الذي أحبه");
}' WHERE Id = 87;

UPDATE ChallengeSnippets SET Code = 'let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood == lunchMenu) {
  console.log("غداء اليوم هو " + favoriteFood);
}' WHERE Id = 88;

-- Question 25: تحدي الوقت والمواعيد
UPDATE ChallengeSnippets SET Code = 'let weekday = "الخميس";
let currentTime = 8;

if (weekday != "الخميس") {
  console.log("اليوم ليس يوم تخفيضات");
} else {
  console.log("اليوم هو يوم تخفيضات");
}

if ((currentTime > 10) && (currentTime < 22)) {
  console.log("مفتوح");
} else {
  console.log("سيفتح قريباً");
}' WHERE Id = 97;

UPDATE ChallengeSnippets SET Code = 'let weekday = "الخميس";
let currentTime = 8;

if (weekday != "الخميس") {
  console.log("اليوم ليس يوم تخفيضات");
} else {
  console.log("اليوم هو يوم تخفيضات");
}

if ((currentTime > 10) && (currentTime > 22)) {
  console.log("مفتوح");
} else {
  console.log("سيفتح قريباً");
}' WHERE Id = 98;

UPDATE ChallengeSnippets SET Code = 'let weekday = "الخميس";
let currentTime = 8;

if (weekday == "الخميس") {
  console.log("اليوم هو يوم تخفيضات");
}

if ((currentTime > 10) && (currentTime < 22)) {
  console.log("مفتوح");
} else {
  console.log("سيفتح قريباً");
}' WHERE Id = 99;

UPDATE ChallengeSnippets SET Code = 'let weekday = "الخميس";
let currentTime = 8;

if (weekday == "الخميس") {
  console.log("اليوم هو يوم تخفيضات");
}

if ((currentTime > 10) && (currentTime > 22)) {
  console.log("مفتوح");
} else {
  console.log("سيفتح قريباً");
}' WHERE Id = 100;

-- Question 26: تحدي القائمة اليومية (||)
UPDATE ChallengeSnippets SET Code = 'let weekday = "الجمعة";

if ((weekday == "الإثنين") && (weekday == "الجمعة")) {
  console.log("يوم القائمة الخاصة");
} else {
  console.log("يوم القائمة العادية");
}' WHERE Id = 101;

UPDATE ChallengeSnippets SET Code = 'let weekday = "الجمعة";

if ((weekday == "الإثنين") || (weekday == "الجمعة")) {
  console.log("يوم القائمة الخاصة");
}' WHERE Id = 102;

-- Question 30: تحدي نظام القسائم والخصومات
UPDATE ChallengeSnippets SET Code = 'let totalAmount = 12000;
let discount = 1000;

if (totalAmount >= 10000) {
  totalAmount = totalAmount - discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);' WHERE Id = 113;

UPDATE ChallengeSnippets SET Code = 'let totalAmount = 12000;
let discount = 1000;

if (totalAmount >= 10000) {
  console.log("سنمنحك قسيمة");
  totalAmount = totalAmount - discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);' WHERE Id = 114;

UPDATE ChallengeSnippets SET Code = 'let totalAmount = 12000;
let discount = 1000;

if (totalAmount > 10000) {
  console.log("سنمنحك قسيمة");
  totalAmount = totalAmount - discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);' WHERE Id = 115;

UPDATE ChallengeSnippets SET Code = 'let totalAmount = 12000;
let discount = 1000;

if (totalAmount >= 10000) {
  console.log("سنمنحك قسيمة");
  totalAmount = totalAmount + discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);' WHERE Id = 116;

-- Question 36: تحدي قائمة الطعام والمصفوفات
UPDATE ChallengeSnippets SET Code = 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];
console.log("سأطلب " + menuList[1]);' WHERE Id = 131;

UPDATE ChallengeSnippets SET Code = 'let menuList = ["كاري", "دجاج مشوي", "بارفيه"];
console.log("سأطلب " + menuList[2]);' WHERE Id = 132;

-- Question 41: تحدي قائمة اليوم والمصفوفات
UPDATE ChallengeSnippets SET Code = 'let menuList = ["سندويش", "سلطة", "قهوة"];
console.log("قائمة اليوم هي كالتالي");
console.log(menuList);' WHERE Id = 142;

-- Question 60: تحدي جدول الدراسة اليومي
UPDATE ChallengeSnippets SET Code = 'let studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];

console.log("المواد التي سيتم دراستها اليوم كما يلي");
for (let i = 0; i < 3; i++) {
  if (studySubjects[i] == "رياضيات") {
    console.log("تخطي");
  } else {
    console.log(studySubjects[i]);
  }
}' WHERE Id = 181;

-- Question 69: تحدي حالة الحجز التفصيلية
UPDATE ChallengeSnippets SET Code = 'let reservations = [3, 8, 5];

console.log("تحقق من حالة الحجز الحالية");
for (let i = 0; i < reservations.length; i++) {
  console.log("تم حجز " + [i] + " أشخاص");
}' WHERE Id = 199; 
