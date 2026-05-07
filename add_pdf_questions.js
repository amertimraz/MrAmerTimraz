const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

// أسئلة مقترحة من امتحانات المحافظات (بناءً على التحليل اليدوي)
const pdfQuestions = [
    // أسئلة من امتحانات الفائز والمحافظات الأخرى
    {
        text: 'ما هو الناتج النهائي للكود التالي:\nDim x As Integer = 10\nDim y As Integer = 5\nx = x + y\nMsgBox(x)',
        type: 'MCQ',
        options: '["10", "15", "20"]',
        correctAnswer: '1',
        explanation: 'x = 10 + 5 = 15'
    },
    {
        text: 'ما هي وظيفة الأمر vbCrLf في VB.NET؟',
        type: 'MCQ',
        options: '["إنشاء سطر جديد", "إنهاء البرنامج", "تعريف متغير"]',
        correctAnswer: '0',
        explanation: 'vbCrLf يستخدم للانتقال لسطر جديد'
    },
    {
        text: 'الكلمة المحجوزة التي تستخدم للإعلان عن ثابت في VB.NET هي:',
        type: 'MCQ',
        options: '["Dim", "Const", "Static"]',
        correctAnswer: '1',
        explanation: 'Const تستخدم للإعلان عن الثوابت'
    },
    {
        text: 'ما هو ناتج المعادلة: 5 + 3 * 2',
        type: 'MCQ',
        options: '["16", "11", "10"]',
        correctAnswer: '1',
        explanation: '3 * 2 = 6 ثم 5 + 6 = 11'
    },
    {
        text: 'جملة For...Next تستخدم للتكرار لعدد محدد من المرات.',
        type: 'TrueFalse',
        options: '["صح", "خطأ"]',
        correctAnswer: 'true',
        explanation: 'For...Next مخصصة للتكرار بعدد معروف'
    },
    {
        text: 'المعامل Mod يستخدم لحساب باقي القسمة.',
        type: 'TrueFalse',
        options: '["صح", "خطأ"]',
        correctAnswer: 'true',
        explanation: 'Mod يعطي باقي القسمة'
    },
    {
        text: 'اقرأ الكود:\nIf score >= 90 Then\n    grade = "A"\nElseIf score >= 80 Then\n    grade = "B"\nEnd If\nإذا كانت score = 85 فما قيمة grade؟',
        type: 'MCQ',
        options: '["A", "B", "لا قيمة"]',
        correctAnswer: '1',
        explanation: '85 >= 80 و 85 < 90 لذا grade = "B"'
    },
    {
        text: 'ما هو نوع البيانات المناسب لتخزين العمر (رقم صحيح موجب)؟',
        type: 'MCQ',
        options: '["String", "Integer", "Boolean"]',
        correctAnswer: '1',
        explanation: 'Integer最适合存储年龄'
    },
    {
        text: 'الأمر الذي يظهر رسالة للمستخدم في VB.NET هو:',
        type: 'MCQ',
        options: '["Print", "MsgBox", "Console.WriteLine"]',
        correctAnswer: '1',
        explanation: 'MsgBox يستخدم لعرض رسائل'
    },
    {
        text: 'ما هو ناتج الكود:\nDim i As Integer\nFor i = 1 To 3\n    MsgBox(i)\nNext',
        type: 'MCQ',
        options: '["يظهر 1 فقط", "يظهر 1,2,3", "يظهر 3 فقط"]',
        correctAnswer: '1',
        explanation: 'الحلقة تتكرر من 1 إلى 3'
    }
];

const quizId = 4; // 3rd Prep CS Final Revision

try {
    const insert = db.prepare('INSERT INTO "InteractiveQuestions" (QuizId, Text, Type, Options, CorrectAnswer, Explanation, OrderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // الحصول على أكبر OrderIndex موجود
    const maxOrder = db.prepare('SELECT MAX(OrderIndex) as maxOrder FROM "InteractiveQuestions" WHERE QuizId = ?').get(quizId);
    const startOrder = (maxOrder.maxOrder || 0) + 1;
    
    db.transaction(() => {
        pdfQuestions.forEach((q, i) => {
            const orderIndex = startOrder + i;
            insert.run(quizId, q.text, q.type, q.options, q.correctAnswer, q.explanation, orderIndex);
            console.log(`Added question ${orderIndex}: ${q.text.substring(0, 50)}...`);
        });
    })();
    
    console.log(`Successfully added ${pdfQuestions.length} new questions to Quiz ID ${quizId}`);
    console.log('Questions are now available in the interactive revision!');
    
} catch (err) {
    console.error('Error adding questions:', err.message);
} finally {
    db.close();
}
