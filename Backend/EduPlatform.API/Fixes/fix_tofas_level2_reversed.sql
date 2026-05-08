-- Fix Tofas Level 2 Questions - Reverse Format
-- Move code from snippets to question description
-- Move outputs from question to snippets

-- Question 22: Reverse format
UPDATE Challenges SET Description = '--- Question 22: Question 22 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let favoriteFood = "الهامبرغر";
let lunchMenu = "السوشي";

if (favoriteFood != lunchMenu) {
  console.log("غداء اليوم هو " + lunchMenu);
} else {
  console.log("غداء اليوم هو " + favoriteFood + " الذي أحبه");
}
```' WHERE Id = 22 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'غداء اليوم هو السوشي' WHERE Id = 85;
UPDATE ChallengeSnippets SET Code = 'غداء اليوم هو الهامبرغر الذي أحبه' WHERE Id = 86;
UPDATE ChallengeSnippets SET Code = 'غداء اليوم هو السوشي الذي أحبه' WHERE Id = 87;
UPDATE ChallengeSnippets SET Code = 'غداء اليوم هو الهامبرغر' WHERE Id = 88;

-- Question 25: Reverse format
UPDATE Challenges SET Description = '--- Question 25: Question 25 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let weekday = "الخميس";
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
}
```' WHERE Id = 25 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'اليوم ليس يوم تخفيضات
سيفتح قريباً' WHERE Id = 97;
UPDATE ChallengeSnippets SET Code = 'اليوم ليس يوم تخفيضات
مفتوح' WHERE Id = 98;
UPDATE ChallengeSnippets SET Code = 'اليوم هو يوم تخفيضات
سيفتح قريباً' WHERE Id = 99;
UPDATE ChallengeSnippets SET Code = 'اليوم هو يوم تخفيضات
مفتوح' WHERE Id = 100;

-- Question 26: Reverse format
UPDATE Challenges SET Description = '--- Question 26: Question 26 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let weekday = "الجمعة";

if ((weekday == "الإثنين") || (weekday == "الجمعة")) {
  console.log("يوم القائمة الخاصة");
} else {
  console.log("يوم القائمة العادية");
}
```' WHERE Id = 26 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'يوم القائمة العادية' WHERE Id = 101;
UPDATE ChallengeSnippets SET Code = 'يوم القائمة الخاصة' WHERE Id = 102;

-- Question 30: Reverse format
UPDATE Challenges SET Description = '--- Question 30: Question 30 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let totalAmount = 12000;
let discount = 1000;

if (totalAmount >= 10000) {
  console.log("سنمنحك قسيمة");
  totalAmount = totalAmount - discount;
}
console.log("المبلغ الإجمالي هو كالتالي");
console.log(totalAmount);
```' WHERE Id = 30 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'المبلغ الإجمالي هو كالتالي
11000' WHERE Id = 113;
UPDATE ChallengeSnippets SET Code = 'سنمنحك قسيمة
سيتم تطبيق خصم 1000 ين
المبلغ الإجمالي هو كالتالي
11000' WHERE Id = 114;
UPDATE ChallengeSnippets SET Code = 'سنمنحك قسيمة
المبلغ الإجمالي هو كالتالي
11000' WHERE Id = 115;
UPDATE ChallengeSnippets SET Code = 'سنمنحك قسيمة
المبلغ الإجمالي هو كالتالي
12000' WHERE Id = 116;

-- Question 36: Reverse format
UPDATE Challenges SET Description = '--- Question 36: Question 36 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let menuList = ["كاري", "دجاج مشوي", "بارفيه"];
console.log("سأطلب " + menuList[2]);
```' WHERE Id = 36 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'سأطلب الدجاج المشوي' WHERE Id = 131;
UPDATE ChallengeSnippets SET Code = 'سأطلب بارفيه' WHERE Id = 132;

-- Question 41: Reverse format
UPDATE Challenges SET Description = '--- Question 41: Question 41 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let menuList = ["سندويش", "سلطة", "قهوة"];
console.log("قائمة اليوم هي كالتالي");
for (let i = 0; i < 3; i++) {
  console.log(menuList[i]);
}
```' WHERE Id = 41 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'قائمة اليوم هي كالتالي
سندويش
سلطة
قهوة' WHERE Id = 141;
UPDATE ChallengeSnippets SET Code = 'قائمة اليوم هي كالتالي
سندويش,سلطة,قهوة' WHERE Id = 142;
UPDATE ChallengeSnippets SET Code = 'قائمة اليوم هي كالتالي
قهوة
سلطة
سندويش' WHERE Id = 143;

-- Question 60: Reverse format
UPDATE Challenges SET Description = '--- Question 60: Question 60 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let studySubjects = ["علوم", "رياضيات", "اللغة الإنجليزية"];
console.log("المواد التي سيتم دراستها اليوم كما يلي");
for (let i = 0; i < 3; i++) {
  console.log(studySubjects[i]);
}
```' WHERE Id = 60 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'المواد التي سيتم دراستها اليوم كما يلي
علوم
رياضيات
اللغة الإنجليزية' WHERE Id = 180;
UPDATE ChallengeSnippets SET Code = 'المواد التي سيتم دراستها اليوم كما يلي
علوم
تخطي
اللغة الإنجليزية' WHERE Id = 181;

-- Question 69: Reverse format
UPDATE Challenges SET Description = '--- Question 69: Question 69 ---
ما هو المخرج الصحيح للكود التالي؟

```javascript
let reservations = [3, 8, 5];
console.log("تحقق من حالة الحجز الحالية");
for (let i = 0; i < reservations.length; i++) {
  console.log("تم حجز " + reservations[i] + " أشخاص");
}
```' WHERE Id = 69 AND TestId = 2;

UPDATE ChallengeSnippets SET Code = 'تحقق من حالة الحجز الحالية
تم حجز 3 أشخاص
تم حجز 8 أشخاص
تم حجز 5 أشخاص' WHERE Id = 198;
UPDATE ChallengeSnippets SET Code = 'تحقق من حالة الحجز الحالية
تم حجز 0 أشخاص
تم حجز 1 أشخاص
تم حجز 2 أشخاص' WHERE Id = 199;
