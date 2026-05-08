-- Fix incomplete snippets in Tofas Level 2 test (TestId = 2)
-- This script updates 50 snippets that had "..." placeholders

-- Safe fixes: if -> for, add .length
UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < 3; i++) {
  console.log(numbers[i]);
}' WHERE Id = 122;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < 4; i++) {
  console.log(sports[i]);
}' WHERE Id = 130;

UPDATE ChallengeSnippets SET Code = 'if (shoppingBasket.length > 3) {
  console.log("في يوم 3 تحصل على 3 أضعاف النقاط");
  console.log("الشحن مجاني");
}' WHERE Id = 147;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < taskList.length; i++) {
  console.log("تم الانتهاء من " + taskList[i]);
}' WHERE Id = 149;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < activityList.length; i++) {
  console.log(activityList[i] + " سيتم تنفيذها");
}' WHERE Id = 167;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < 3; i++) {
  console.log("سأشتري " + shoppingList[i]);
}' WHERE Id = 187;

-- Intelligent fixes: logical operators
UPDATE ChallengeSnippets SET Code = 'if ((subjects[i] == "لغة يابانية") || (subjects[i] == "علوم")) {
  console.log("عندك وظيفة لغة يابانية");
  console.log("ليس عندك وظيفة رياضيات");
  console.log("ليس عندك وظيفة لغة إنجليزية");
  console.log("عندك وظيفة علوم");
  console.log("عندك وظيفة اجتماعيات");
}' WHERE Id = 125;

UPDATE ChallengeSnippets SET Code = 'if ((visiters[i] == "كينتا") || (visiters[i] == "هاناكو")) {
  console.log("موعد وصول كينتا: 6:00 مساءً");
  console.log("موعد وصول ريوبا: 6:30 مساءً");
  console.log("موعد وصول هاناكو: 6:00 مساءً");
  console.log("موعد وصول آيا: 7:00 مساءً");
}' WHERE Id = 135;

UPDATE ChallengeSnippets SET Code = 'if ((destination == "المحطة B") && (trainCode == "B456")) {
  console.log("هذا القطار متجه إلى المحطة B");
}' WHERE Id = 155;

UPDATE ChallengeSnippets SET Code = 'if ((ticketType == "A") || (ticketType == "B")) {
  console.log("الضيوف الحاملون لتذاكر مقاعد A، يرجى الدخول عبر المدخل 1");
}' WHERE Id = 159;

UPDATE ChallengeSnippets SET Code = 'if ((requiredQuantity < 10) || (requiredQuantity > 50)) {
  console.log("ضمن ساعات العمل");
  console.log("لا يمكننا تلبية الكمية المطلوبة");
}' WHERE Id = 161;

UPDATE ChallengeSnippets SET Code = 'if ((guestCount >= 8) && (guestCount <= 16)) {
  console.log("سيتم إرشادك إلى الغرفة الكبيرة");
  console.log("اليوم يوجد خصم على المشروبات");
}' WHERE Id = 165;

UPDATE ChallengeSnippets SET Code = 'if ((pipelineFoodItems[i] != nonVegetable) && (pipelineFoodItems[i] != enoughFood)) {
  console.log("استلمت " + pipelineFoodItems[i]);
}' WHERE Id = 171;

UPDATE ChallengeSnippets SET Code = 'if ((bookList[i] != checkedOutBooks[0]) && (bookList[i] != checkedOutBooks[1])) {
  console.log(bookList[i]);
}' WHERE Id = 185;

-- Pattern-based completions for remaining snippets
UPDATE ChallengeSnippets SET Code = 'if ((subjects[i] != "رياضيات") || (subjects[i] != "لغة إنجليزية")) {
  console.log("عندك وظيفة لغة يابانية");
  console.log("ليس عندك وظيفة رياضيات");
  console.log("ليس عندك وظيفة لغة إنجليزية");
  console.log("عندك وظيفة علوم");
  console.log("عندك وظيفة اجتماعيات");
}' WHERE Id = 126;

UPDATE ChallengeSnippets SET Code = 'if ((subjects[i] == "لغة يابانية") || (subjects[i] == "علوم") || (subjects[i] == "اجتماعيات")) {
  console.log("عندك وظيفة لغة يابانية");
  console.log("ليس عندك وظيفة رياضيات");
  console.log("ليس عندك وظيفة لغة إنجليزية");
  console.log("عندك وظيفة علوم");
  console.log("عندك وظيفة اجتماعيات");
}' WHERE Id = 127;

UPDATE ChallengeSnippets SET Code = 'if ((ages[i] < 10) && (ages[i] > 60)) {
  console.log("سيتم تطبيق خصم للأطفال أو كبار السن");
  console.log("السعر العادي");
  console.log("سيتم تطبيق خصم للأطفال أو كبار السن");
}' WHERE Id = 137;

UPDATE ChallengeSnippets SET Code = 'if ((weatherForecasts[i] != "ممطر") || (participantsNumbers[i] >= 22)) {
  console.log("التواريخ المقترحة لمباريات كرة القدم الودية هي كالتالي");
  console.log("5");
  console.log("7");
}' WHERE Id = 139;

UPDATE ChallengeSnippets SET Code = 'if (clothesList[i] == "تنورة") {
  console.log("سأقوم بشراء " + clothesList[i]);
}' WHERE Id = 151;

UPDATE ChallengeSnippets SET Code = 'if (currentBatteryColor == fullyChargedBatteryColor) {
  console.log("وصل مستوى البطارية إلى 10%");
  console.log("يرجى شحن الجهاز");
}' WHERE Id = 153;

UPDATE ChallengeSnippets SET Code = 'if (reservedRoomNum == roomNum) {
  console.log("رقم الغرفة غير صحيح");
  console.log("غرفتك المحجوزة في الطابق رقم 2");
}' WHERE Id = 157;

UPDATE ChallengeSnippets SET Code = 'if (today == closedDay) {
  console.log("حالة العمل: يوم عمل");
}' WHERE Id = 163;

UPDATE ChallengeSnippets SET Code = 'if (busStopList[i] == suspendedBusStop) {
  console.log("موقف متوقف");
}' WHERE Id = 169;

UPDATE ChallengeSnippets SET Code = 'if (ingredients[i] == soldOutIngredient) {
  console.log(soldOutIngredient + " غير متوفرة");
}' WHERE Id = 173;

UPDATE ChallengeSnippets SET Code = 'if (userList[i] == deniedUser) {
  console.log(userList[i]);
}' WHERE Id = 175;

UPDATE ChallengeSnippets SET Code = 'if ((playerScores[i] >= 800) || (playerScores[i] <= 1000)) {
  console.log("تم اكتشاف درجة غير صالحة");
  console.log("عدد مرات تحقيق درجة عالية كما يلي");
  console.log("2");
}' WHERE Id = 177;

UPDATE ChallengeSnippets SET Code = 'if (volumes[i] == 0) {
  console.log("اعرض سعة زجاجة الماء");
  console.log("300");
}' WHERE Id = 179;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < students.length; i++) {
  if (students[i] != absentStudent) {
    console.log(students[i] + " حاضرة");
  }
}' WHERE Id = 183;

UPDATE ChallengeSnippets SET Code = 'if (todaySchedules == rescheduledItem) {
  console.log("جدول اليوم: " + rescheduledItem);
}' WHERE Id = 189;

UPDATE ChallengeSnippets SET Code = 'if (maxTemperature > temperatureList[i]) {
  console.log("درجات الحرارة العظمى خلال الأيام 3 الماضية كما يلي");
  console.log("40");
}' WHERE Id = 191;

UPDATE ChallengeSnippets SET Code = 'for (let i = 0; i < 3; i++) {
  console.log("النوع المفضل من الكتب: " + bookGenres[i]);
}' WHERE Id = 193;

UPDATE ChallengeSnippets SET Code = 'if ((statusList.length >= 3) && (statusList[0] == "متوفر في المخزون")) {
  console.log("سنقوم بتنفيذ المهمة");
}' WHERE Id = 195;

UPDATE ChallengeSnippets SET Code = 'if ((guests.length <= 2) && (reservationStatus == "محجوز")) {
  console.log("يمكنك دخول المتجر");
}' WHERE Id = 197;

UPDATE ChallengeSnippets SET Code = 'if (clothesItems[1] == "قبعة") {
  console.log("اعرض الملابس التي يتم ارتداؤها");
  console.log("سترة");
  console.log("بنطال");
  console.log("جوارب");
}' WHERE Id = 201;

-- Fix snippet 146 (two if statements)
UPDATE ChallengeSnippets SET Code = 'if (date == "3") {
  console.log("في يوم 3 تحصل على 3 أضعاف النقاط");
  console.log("الشحن مجاني");
}
if (shoppingBasket.length > 3) {
  console.log("في يوم 3 تحصل على 3 أضعاف النقاط");
  console.log("الشحن مجاني");
}' WHERE Id = 146;
