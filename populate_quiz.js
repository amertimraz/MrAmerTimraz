const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'Backend', 'EduPlatform.API', 'EduPlatform.db');
const db = new Database(dbPath);

const quizId = 4; // 3rd Prep CS Final Revision

const questions = [
  // --- Section 1: True/False (Most Important) ---
  { text: 'الخطأ الذي يظهر أثناء تشغيل أو تنفيذ برنامج VB.NET يُطلق عليه Syntax Error.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'false', explanation: 'الخطأ أثناء التشغيل يسمى Runtime Error، أما Syntax Error فهو خطأ في القواعد.' },
  { text: 'الأمر Rem يستخدم لكتابة ملاحظات داخل الكود ولا يتم ترجمتها.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'جملة التكرار For...Next تستخدم لتكرار كود عدد محدد من المرات.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'الأمر Const يستخدم للإعلان عن الثوابت في VB.NET.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'إذا كانت قيمة المتغير أو الثابت تاريخ أو وقت توضع بين علامتي ##.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'Me يُعبّر عن نافذة النموذج الحالية (Form).', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'المتغيرات في لغة VB.NET مخازن بذاكرة الكمبيوتر لها اسم ونوع وقيمتها تتغير أثناء سير البرنامج.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'التهديد الإلكتروني عبارة عن إرسال رسائل إلكترونية تحمل تهديد أو وعيد لشخص أو أكثر.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'Select Case تستخدم عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'التخفي الإلكتروني هو استخدام أسماء مستعارة لإخفاء هوية المتعدي الإلكتروني.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'true', explanation: '' },
  { text: 'جميع أنواع البيانات التي يتم حفظها في الذاكرة تشغل نفس المساحة التخزينية.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'false', explanation: 'كل نوع بيان له مساحة تخزينية مختلفة (مثل Byte يشغل 1 بايت، بينما Integer يشغل 4).' },
  { text: '55City يعتبر اسم متغير صحيح في VB.NET.', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'false', explanation: 'اسم المتغير لا يجب أن يبدأ برقم.' },
  { text: 'الإعلان عن دالة (Function) يبدأ بـ (Sub) وينتهي بـ (End Sub).', type: 'TrueFalse', options: '["صح", "خطأ"]', correctAnswer: 'false', explanation: 'الدالة تبدأ بـ Function وتنتهي بـ End Function، أما Sub فهو للإجراءات.' },

  // --- Section 2: MCQ (Choose Correct) ---
  { text: 'الصيغة الصحيحة للإعلان عن متغير اسمه City يخزن اسم المدينة:', type: 'MCQ', options: '["Dim City As Integer", "Dim City As String", "Dim City As Byte"]', correctAnswer: '1', explanation: 'String يستخدم لتخزين النصوص.' },
  { text: 'الكلمة المحجوزة التي تُستخدم لإنشاء سطر جديد في VB.NET:', type: 'MCQ', options: '["Me", "Rem", "vbCrLf"]', correctAnswer: '2', explanation: '' },
  { text: 'نوع البيان الذي له الحد الأدنى (0) والحد الأقصى (255):', type: 'MCQ', options: '["Integer", "Byte", "Long"]', correctAnswer: '1', explanation: '' },
  { text: 'الأمر الذي يُستخدم للإعلان عن المتغيرات في لغة VB.NET:', type: 'MCQ', options: '["Const", "Dim", "Rem"]', correctAnswer: '1', explanation: 'Dim للمتغيرات، و Const للثوابت.' },
  { text: 'يتم تشغيل برنامج VB.NET بالضغط على مفتاح:', type: 'MCQ', options: '["F4", "F5", "F7"]', correctAnswer: '1', explanation: '' },
  { text: 'الخطأ الذي يظهر بسبب صياغة تعبيرات حسابية أو منطقية بصورة خاطئة يسمى:', type: 'MCQ', options: '["Syntax Error", "Logical Error", "Runtime Error"]', correctAnswer: '1', explanation: 'الخطأ المنطقي يعطي نتائج خاطئة لكن البرنامج يعمل.' },
  { text: 'عند تنفيذ الكود:\nIf X=50 Then MsgBox("ناجح")\nوكانت قيمة X=50 فإن:', type: 'MCQ', options: '["يظهر صندوق رسالة ناجح", "يظهر صندوق رسالة راسب", "يتوقف البرنامج"]', correctAnswer: '0', explanation: '' },
  { text: 'أحد أشكال التعدي الإلكتروني هو:', type: 'MCQ', options: '["الاستثناء الإلكتروني", "التشهير الإلكتروني", "التخفي الإلكتروني"]', correctAnswer: '2', explanation: '' },
  { text: 'الناتج النهائي للمعادلة:\nY = 12-(2+4)/2', type: 'MCQ', options: '["Y = 3", "Y = 7", "Y = 9"]', correctAnswer: '2', explanation: '12 - (6)/2 = 12 - 3 = 9' },
  { text: 'معامل المقارنة الذي يعبر عن "أقل من أو يساوي":', type: 'MCQ', options: '["<>", ">=", "<="]', correctAnswer: '2', explanation: '' },
  { text: 'جملة التكرار المناسبة لتكرار كود لعدد محدد من المرات:', type: 'MCQ', options: '["For...Next", "Do While...Loop", "If...Then"]', correctAnswer: '0', explanation: '' },
  { text: 'قيمة أسماء المواد الدراسية تُصنّف كـ:', type: 'MCQ', options: '["رقمية صحيحة", "رقمية غير صحيحة", "متنوعة (String)"]', correctAnswer: '2', explanation: '' },

  // --- Section 3: Fill in blanks (Converted to MCQ) ---
  { text: '...... أماكن محجوزة في ذاكرة الكمبيوتر لها اسم ونوع وقيمتها تتغير أثناء البرنامج.', type: 'MCQ', options: '["المتغيرات", "الثوابت", "الإجراءات"]', correctAnswer: '0', explanation: '' },
  { text: 'يُستخدم الأمر ...... للإعلان عن الثوابت في لغة VB.NET.', type: 'MCQ', options: '["Dim", "Const", "Sub"]', correctAnswer: '1', explanation: '' },
  { text: 'جملة ...... تستخدم لتكرار كود معين لعدد محدد من المرات.', type: 'MCQ', options: '["If", "For...Next", "Select Case"]', correctAnswer: '1', explanation: '' },
  { text: 'الثوابت في VB.NET مخازن في ذاكرة الكمبيوتر لها اسم وقيمة ثابتة ...... أثناء سير البرنامج.', type: 'MCQ', options: '["لا تتغير", "تتغير", "تُحذف"]', correctAnswer: '0', explanation: '' },
  { text: '...... عبارة عن سلوك عدواني متعمد من شخص لآخر عبر وسائل الاتصال الإلكترونية.', type: 'MCQ', options: '["التعدي الإلكتروني", "التخفي", "الاستثناء"]', correctAnswer: '0', explanation: '' },
  { text: 'عبارة عن نشر كلمات عدائية ومبتذلة من شخص معين عبر وسائل الاتصال الإلكترونية ......', type: 'MCQ', options: '["المضايقة الإلكترونية", "السب الإلكتروني", "التهديد"]', correctAnswer: '1', explanation: '' },
  { text: 'جملة التخصيص (Assignment) هي جملة تضع قيمة في متغير أو ثابت وبينهما علامة ......', type: 'MCQ', options: '["+", "*", "="]', correctAnswer: '2', explanation: '' },
  { text: '...... يستخدمه المبرمج لكتابة ملاحظات داخل الكود ولا يتم ترجمتها.', type: 'MCQ', options: '["Dim", "Rem", "Me"]', correctAnswer: '1', explanation: '' },
  { text: 'الكلمة المحجوزة ...... تستخدم في إنشاء سطر جديد داخل صندوق النص.', type: 'MCQ', options: '["vbCrLf", "vbNewLine", "كلاهما صحيح"]', correctAnswer: '2', explanation: '' },
  { text: '...... يُعبّر عن نافذة النموذج الحالية في VB.NET.', type: 'MCQ', options: '["Form1", "Me", "This"]', correctAnswer: '1', explanation: '' },
  { text: 'إذا كانت قيمة الثابت تاريخاً أو وقتاً فإنها توضع بين علامتي ......', type: 'MCQ', options: '["\" \"", "# #", "& &"]', correctAnswer: '1', explanation: '' },
  { text: '...... جملة تستخدم لتكرار كود معين لعدد من المرات غير معروف نهايته مسبقاً بناءً على شرط معين.', type: 'MCQ', options: '["For...Next", "Do While...Loop", "If...Then"]', correctAnswer: '1', explanation: '' },

  // --- Section 4: Code Analysis ---
  { text: 'اقرأ الكود التالي:\n```vb\nFor i = 1 To 5\n    MsgBox(i)\nNext\n```\nاسم المتغير المستخدم في الحلقة التكرارية هو:', type: 'MCQ', options: '["i", "MsgBox", "Next"]', correctAnswer: '0', explanation: '' },
  { text: 'اقرأ الكود التالي:\n```vb\nFor i = 1 To 5\n    MsgBox(i)\nNext\n```\nعدد مرات تكرار الكود هي:', type: 'MCQ', options: '["1", "4", "5"]', correctAnswer: '2', explanation: 'من 1 إلى 5 تعني 5 مرات.' },
  { text: 'اقرأ الكود التالي:\n```vb\nFor M = 1 To 3\n    MsgBox(M)\nNext\n```\nالكود الذي يتم تكراره هو:', type: 'MCQ', options: '["For M = 1", "MsgBox(M)", "Next"]', correctAnswer: '1', explanation: '' },
  { text: 'اقرأ الكود التالي:\n```vb\nIf X >= 50 Then\n    MsgBox("ناجح")\nElse\n    MsgBox("راسب")\nEnd If\n```\nالتعبير الشرطي في جملة If هو:', type: 'MCQ', options: '["If X >= 50", "X >= 50", "MsgBox"]', correctAnswer: '1', explanation: '' },
  { text: 'اقرأ الكود التالي:\n```vb\nFor X = 4 To 12 Step 2\n    MsgBox(X)\nNext\n```\nقيمة الزيادة (Step) في الحلقة هي:', type: 'MCQ', options: '["4", "12", "2"]', correctAnswer: '2', explanation: '' },
  { text: 'اقرأ الكود التالي:\n```vb\nIf N Mod 2 = 0 Then\n    MsgBox("الرقم زوجي")\nElse\n    MsgBox("الرقم فردي")\nEnd If\n```\nما وظيفة المعامل Mod في الكود؟', type: 'MCQ', options: '["القسمة", "باقي القسمة", "الضرب"]', correctAnswer: '1', explanation: '' }
];

try {
    const insert = db.prepare('INSERT INTO "InteractiveQuestions" (QuizId, Text, Type, Options, CorrectAnswer, Explanation, OrderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    db.transaction(() => {
        // Clear existing questions first
        db.prepare('DELETE FROM "InteractiveQuestions" WHERE QuizId = ?').run(quizId);
        
        questions.forEach((q, i) => {
            insert.run(quizId, q.text, q.type, q.options, q.correctAnswer, q.explanation, i);
        });
    })();
    
    console.log(`Successfully inserted ${questions.length} questions into Quiz ID ${quizId}`);
} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
