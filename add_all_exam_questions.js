const Database = require('better-sqlite3');
const db = new Database('f:/Amer/Mr Amer Platform/Backend/EduPlatform.API/EduPlatform.db');

const quizId = 4; // 3rd Prep CS Final Revision

// أسئلة الصواب والخطأ
const trueFalseQuestions = [
    { text: 'في لغة VB.NET مدى القيم لنوع البيانات (Byte) يبدأ بـ 0 وينتهي 255.', correctAnswer: 'true', explanation: 'Byte يأخذ قيم من 0 إلى 255' },
    { text: 'جملة التكرار For ... Next تستخدم لتكرار كود عدد محدد من المرات.', correctAnswer: 'true', explanation: 'For...Next مخصصة للتكرار بعدد معروف' },
    { text: 'في لغة VB.NET للتعبير عن التفرع برمجياً نستخدم جملة if ... Then فقط.', correctAnswer: 'false', explanation: 'يمكن استخدام If...Then...Else و Select Case أيضاً' },
    { text: 'من قواعد الاستخدام الآمن للإنترنت وضع كلمة مرور سهلة لبريدك الإلكتروني حتى تستطيع تذكرها.', correctAnswer: 'false', explanation: 'يجب استخدام كلمات مرور قوية وصعبة التخمين' },
    { text: 'إذا كانت قيمة المتغير أو الثابت تاريخ أو وقت توضع بين علامتي # #.', correctAnswer: 'true', explanation: 'التواريخ والأوقات توضع بين علامتي #' },
    { text: 'في لغة VB.NET ، يتم تشغيل البرنامج بالضغط على مفتاح (F5).', correctAnswer: 'true', explanation: 'F5 يستخدم لتشغيل البرنامج' },
    { text: 'المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.', correctAnswer: 'true', explanation: 'المضايقة الإلكترونية هي رسائل عدائية' },
    { text: 'تعتبر جملة الإعلان التالية جملة صحيحة Dim single as integer.', correctAnswer: 'false', explanation: 'يجب أن يبدأ اسم المتغير بحرف، single كلمة محجوزة' },
    { text: 'المعامل المنطقى <> يعبر عن أكبر من أو يساوى.', correctAnswer: 'false', explanation: '<> يعبر عن "لا يساوي"' },
    { text: 'جملة التخصيص عبارة عن طرفين بينهما علامة (+).', correctAnswer: 'false', explanation: 'جملة التخصيص تستخدم علامة =' },
    { text: 'الدالة Mod تعود بباقى القسمة.', correctAnswer: 'true', explanation: 'Mod تحسب باقي القسمة' },
    { text: 'vbCrLf تستخدم لإضافة سطر جديد.', correctAnswer: 'true', explanation: 'vbCrLf للانتقال لسطر جديد' },
    { text: 'Name هو اسم متغير صحيح.', correctAnswer: 'false', explanation: 'Name كلمة محجوزة في VB.NET' },
    { text: 'المدونات (Blogs) هي أحد الوسائط الإلكترونية التي يستخدمها المعتدى الإلكتروني.', correctAnswer: 'true', explanation: 'المدونات يمكن استخدامها للتعدي الإلكتروني' },
    { text: 'الأخطاء اللغوية هي أخطاء في الصيغة العامة لأوامر اللغة.', correctAnswer: 'true', explanation: 'Syntax Error هو خطأ في الصياغة' },
    { text: 'يقصد بالمتغيرات في لغة VB.NET مخازن بذاكرة الكمبيوتر لها اسم ونوع.', correctAnswer: 'true', explanation: 'المتغيرات هي أماكن محجوزة في الذاكرة' },
    { text: 'لتخصيص قيمة المتغير تستخدم <>.', correctAnswer: 'false', explanation: 'لتخصيص القيمة نستخدم =' },
    { text: 'تنفذ العمليات الحسابية داخل الأقواس من الخارج إلى الداخل.', correctAnswer: 'false', explanation: 'تنفذ من الداخل إلى الخارج' },
    { text: 'Const X As Single الخطأ في هذا الكود هو عدم تخصيص قيمة.', correctAnswer: 'true', explanation: 'الثابت يجب أن يأخذ قيمة عند الإعلان' },
    { text: 'التعبير الشرطي $B=A+3^{*}2$ يمكن استخدامه مع جملة IF.', correctAnswer: 'false', explanation: 'هذا التعبير غير صحيح رياضياً' },
    { text: 'يمكن أن يبدأ اسم الثابت أو المتغير بحرف أو رقم.', correctAnswer: 'false', explanation: 'يجب أن يبدأ بحرف فقط' },
    { text: 'من قواعد الاستخدام الآمن للإنترنت، إعداد كلمة مرور يسهل استنتاجها.', correctAnswer: 'false', explanation: 'يجب أن تكون كلمة المرور صعبة الاستنتاج' },
    { text: 'في حالة تحقق الشرط تنفذ الأوامر التالية لـ Then.', correctAnswer: 'true', explanation: 'عند تحقق الشرط تنفذ أوامر Then' },
    { text: 'من قواعد تسمية المتغيرات أو الثوابت في البرنامج أن يبدأ اسم المتغير بحرف أو رقم.', correctAnswer: 'false', explanation: 'يجب أن يبدأ بحرف فقط' },
    { text: 'الخطأ الذي يظهر أثناء تشغيل أو تنفيذ برنامج VB.Net يسمى خطأ لغوي Syntax Error.', correctAnswer: 'false', explanation: 'هذا يسمى Runtime Error' },
    { text: 'في جملة "IF... Then... else" إذا كانت قيمة التعبير الشرطي False يتم تنفيذ الأوامر التي تلى else.', correctAnswer: 'true', explanation: 'عند False يتم تنفيذ أوامر Else' },
    { text: 'الثوابت في لغة VB.Net عبارة عن مخازن في ذاكرة الكمبيوتر لها اسم وقيمة تتغير أثناء سير البرنامج.', correctAnswer: 'false', explanation: 'قيمة الثابت لا تتغير' },
    { text: 'الإجراء Procedure مجموعة من الأوامر والتعليمات تحت اسم معين عند استدعاؤه يتم تنفيذ الأوامر والتعليمات.', correctAnswer: 'true', explanation: 'Procedure هو مجموعة أوامر' },
    { text: 'في الجملة : For $X=1$ To 10 Step 3 قيمة المتغير X بعد انتهاء التكرار هي 12.', correctAnswer: 'false', explanation: 'ستكون 13 (1,4,7,10)' },
    { text: 'الكود التالي : Dim x As Byte = 300 يعتبر صحيحاً برمجياً.', correctAnswer: 'false', explanation: 'Byte أقصى قيمة 255' },
    { text: 'City55 اسم متغير خطأ لأنه يحتوى على رقم.', correctAnswer: 'false', explanation: 'صحيح لأنه يبدأ بحرف' },
    { text: 'في جملة If الشرطية يتم تنفيذ الجمل التي تلى Then عندما يكون ناتج الشرط True.', correctAnswer: 'true', explanation: 'True تنفذ Then' },
    { text: 'يتم الإعلان عن المتغيرات والثوابت على مستوى التصنيف أسفل سطر Public Class Form1.', correctAnswer: 'true', explanation: 'يمكن الإعلان على مستوى التصنيف' },
    { text: 'يستخدم المعامل & للربط بين قيم المتغيرات الحرفية.', correctAnswer: 'true', explanation: '& للربط النصي' },
    { text: '55City يعتبر اسم متغير خطأ لأنه يبدأ برقم.', correctAnswer: 'true', explanation: 'لا يمكن أن يبدأ اسم المتغير برقم' },
    { text: 'تستخدم جملة Select Case عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.', correctAnswer: 'true', explanation: 'Select Case مناسبة للتفرع المتعدد' },
    { text: 'عندما يكون لدينا كود معين نرغب في تكراره في أكثر من موضع داخل التصنيف نستخدم إجراء Function.', correctAnswer: 'true', explanation: 'Function لإعادة استخدام الكود' },
    { text: 'مواقع التواصل الاجتماعي تساعد في التعرف على أشخاص جدد يفضل مقابلتهم لتطوير العلاقة الاجتماعية.', correctAnswer: 'false', explanation: 'هذا ليس آمناً دائماً' },
    { text: 'تصنف قيمة مجموع درجات الطالب ضمن البيانات الرقمية الصحيحة.', correctAnswer: 'true', explanation: 'المجموع رقم صحيح' },
    { text: 'city55 اسم متغير غير صحيح حيث يحتوي علي رقم.', correctAnswer: 'false', explanation: 'صحيح لأنه يبدأ بحرف' },
    { text: 'تنفذ العمليات الحسابية داخل الأقواس من الخارج إلى الداخل.', correctAnswer: 'false', explanation: 'تنفذ من الداخل للخارج' },
    { text: 'الكلمة المحجوزة (vbCrLf) تستخدم في إنشاء سطر جديد.', correctAnswer: 'true', explanation: 'vbCrLf للسطر الجديد' },
    { text: 'جميع أنواع البيانات التي يتم حفظها في الذاكرة تشغل نفس المساحة التخزينية.', correctAnswer: 'false', explanation: 'كل نوع له مساحة مختلفة' },
    { text: 'لا يمكن كتابة جملة (If) في سطر واحد بدون (End If).', correctAnswer: 'true', explanation: 'If في سطر واحد لا تحتاج End If' },
    { text: 'تستخدم جملة (For... Next) عندما ترغب في تكرار (Code) معين عدد محدد من المرات.', correctAnswer: 'true', explanation: 'For...Next للتكرار المحدود' },
    { text: 'التعدي الإلكتروني يتم من خلال وسائط إلكترونية مثل مواقع التواصل الاجتماعي.', correctAnswer: 'true', explanation: 'وسائل التواصل قد تستخدم للتعدي' },
    { text: 'للاستخدام الآمن للإنترنت لا تشارك أحد كلمات السر.', correctAnswer: 'true', explanation: 'كلمات السر يجب أن تبقى سرية' },
    { text: 'الاستثناء الإلكتروني Exclusion عبارة عن تجاهل شخص أو أكثر من خلال وسائط إلكترونية.', correctAnswer: 'true', explanation: 'Exclusion هو التجاهل' },
    { text: 'يستخدم الأمر (Const) للإعلان عن الثوابت Constants.', correctAnswer: 'true', explanation: 'Const للثوابت' },
    { text: 'في جملة (If.. Then..Else) يتم تنفيذ الكود الذي يلي (Then) إذا لم يتحقق التعبير الشرطي.', correctAnswer: 'false', explanation: 'ينفذ إذا تحقق الشرط' },
    { text: 'عند الإعلان عن المتغيرات علي مستوي التصنيف لا نحتاج إلي الإعلان عنها علي مستوي إجراء الحدث.', correctAnswer: 'true', explanation: 'الإعلان على مستوى التصنيف يكفي' },
    { text: 'قيم الزيادة بعد (Step) قد تكون رقمية صحيحة أو عشرية أو حرفية.', correctAnswer: 'false', explanation: 'يجب أن تكون رقمية' },
    { text: 'إذا كانت قيمة المتغير أو الثابت حرفية توضع بين علامتي ("").', correctAnswer: 'true', explanation: 'النصوص توضع بين علامتي تنصيص' },
    { text: 'يمكن كتابة جملة (If.. Then.. Else) علي سطر واحد بدون كتابة Else.', correctAnswer: 'true', explanation: 'يمكن كتابة If...Then في سطر واحد' },
    { text: 'جميع أنواع البيانات التي يتم حفظها في ذاكرة الحاسب تشغل نفس المساحة التخزينية.', correctAnswer: 'false', explanation: 'كل نوع له مساحة مختلفة' },
    { text: 'يقصد بالتخصيص (Assignment) وضع أو تعيين قيمة لثابت أو متغير.', correctAnswer: 'true', explanation: 'Assignment هو التخصيص' },
    { text: 'الخطأ في نتيجة حساب أي معادلة يعتبر خطأ لغوي Syntax Error.', correctAnswer: 'false', explanation: 'هذا خطأ منطقي Logical Error' },
    { text: 'التخفي الإلكتروني (Anonymity) يعتبر صورة من صور التعدي الإلكتروني.', correctAnswer: 'true', explanation: 'Anonymity شكل من أشكال التعدي' },
    { text: 'تتميز لغة VB.NET بالتعامل مع أنواع مختلفة من البيانات.', correctAnswer: 'true', explanation: 'VB.NET تدعم أنواع بيانات متعددة' },
    { text: 'التخفى الإلكتروني لا يعتبر صورة من صور التعدى الالكتروني.', correctAnswer: 'false', explanation: 'هو صورة من صور التعدي' },
    { text: 'المتغيرات عبارة عن أماكن محجوزة في ذاكرة الكمبيوتر وعادة تتغير قيمتها أثناء سير البرنامج.', correctAnswer: 'true', explanation: 'هذا تعريف المتغيرات' },
    { text: 'جملة If.. Then.. Else تنتهي بـ End If.', correctAnswer: 'true', explanation: 'If...Else تنتهي بـ End If' },
    { text: 'المصطلح (Me) يعبر عن نافذة النموذج الحالية.', correctAnswer: 'true', explanation: 'Me يشير للنموذج الحالي' },
    { text: 'مدى القيم للمتغير من النوع Byte من صفر إلى (255).', correctAnswer: 'true', explanation: 'Byte من 0 إلى 255' },
    { text: 'الملاحقة الإلكترونية يقصد بها إرسال رسائل إلكترونية تحمل تهديد أو وعيد لشخص أو أكثر.', correctAnswer: 'false', explanation: 'هذا تعريف التهديد وليس الملاحقة' },
    { text: 'جملة التكرار For... Next أحد جمل التكرار لعدد غير محدد من المرات.', correctAnswer: 'false', explanation: 'For...Next لعدد محدد' },
    { text: 'يستخدم أمر Dim في الإعلان عن المتغيرات.', correctAnswer: 'true', explanation: 'Dim للإعلان عن المتغيرات' },
    { text: 'تستخدم جملة For... Next من أجل أغراض التفرع.', correctAnswer: 'false', explanation: 'For...Next للتكرار وليس التفرع' },
    { text: 'يستخدم الأمر Dim في الإعلان عن الثوابت.', correctAnswer: 'false', explanation: 'Dim للمتغيرات، Const للثوابت' },
    { text: '55City يعتبر اسم متغير صحيح.', correctAnswer: 'false', explanation: 'يبدأ برقم لذا غير صحيح' },
    { text: 'الخطأ الذي يظهر أثناء تشغيل أو تنفيذ برنامج VB.Net يطلق عليه خطأ لغوي Syntax Error.', correctAnswer: 'false', explanation: 'هذا Runtime Error' },
    { text: 'تماشيا مع قواعد الاستخدام الآمن يفضل أن تضع كلمة مرور سهلة للبريد الالكتروني الخاص بك لتتذكرها.', correctAnswer: 'false', explanation: 'يجب استخدام كلمة مرور قوية' },
    { text: 'Constants عبارة عن أماكن محجوزة في الذاكرة تأخذ قيمة ثابتة لا تتغير أثناء سير البرنامج مثل بعض الثوابت الرياضية كقيمة ط.', correctAnswer: 'true', explanation: 'هذا تعريف الثوابت' },
    { text: 'يصنف قيمة مجموع درجات الطالب ضمن البيانات الرقمية الصحيحة.', correctAnswer: 'true', explanation: 'المجموع رقم صحيح' },
    { text: 'عدد اختيارات التفرع الممكنة في جملة If.. Then.. Else هو 2.', correctAnswer: 'true', explanation: 'If...Else لها اختياران' },
    { text: 'أفضل جملة تستخدم عند معرفة عدد مرات التكرار مسبقاً هي For.. Next.', correctAnswer: 'true', explanation: 'For..Next أفضل للتكرار المعروف' },
    { text: 'التعدى الإلكتروني يتم من خلال وسائط إلكترونية مثل البريد الإلكتروني.', correctAnswer: 'true', explanation: 'البريد الإلكتروني وسيلة للتعدي' }
];

// أسئلة الاختيار من متعدد
const mcqQuestions = [
    { 
        text: 'الجملة التالية Const x As single بها خطأ من نوع', 
        options: '["الأخطاء اللغوية", "الأخطاء المنطقية", "أخطاء وقت التشغيل"]', 
        correctAnswer: '0', 
        explanation: 'عدم تخصيص قيمة للثابت خطأ لغوي' 
    },
    { 
        text: 'في جملة التكرار For... Next معدل الزيادة يجب أن يكون عدداً......... إذا كانت قيمة البداية أكبر من النهاية', 
        options: '["موجباً", "سالباً", "منطقياً"]', 
        correctAnswer: '1', 
        explanation: 'عند البداية أكبر من النهاية نحتاج زيادة سالبة' 
    },
    { 
        text: 'يستخدم الكود التالي ( = Me.Textbox1.Text) في ..... محتويات صندوق النص', 
        options: '["نسخ", "طباعة", "مسح"]', 
        correctAnswer: '0', 
        explanation: 'لقراءة محتويات صندوق النص' 
    },
    { 
        text: 'عبارة عن سلوك عدواني متعمد من شخص لآخر عبر وسائل الاتصال الإلكترونية', 
        options: '["البريد الإلكتروني", "التعدي الإلكتروني", "المنتديات الإلكترونية"]', 
        correctAnswer: '1', 
        explanation: 'التعدي الإلكتروني هو السلوك العدواني' 
    },
    { 
        text: 'الجملة التالية (For n = 2 to 10 Step 2) يأخذ العداد n الأعداد', 
        options: '["الفردية من 1 إلى 10", "الزوجية من 2 إلى 10", "الصحيحة من 2 إلى 10"]', 
        correctAnswer: '1', 
        explanation: 'تبدأ من 2 وتزداد 2 فتأخذ الأعداد الزوجية' 
    },
    { 
        text: 'في جملة التكرار For... Next يوضع الكود الذي يتم تكراره', 
        options: '["بين For و Next", "قبل For", "بعد Next"]', 
        correctAnswer: '0', 
        explanation: 'الكود المكرر يوضع بين For و Next' 
    },
    { 
        text: 'الصيغة الصحيحة للإعلان عن متغير العنوان City هي', 
        options: '["Dim City As String", "Dim City As Byte", "Dim City as Integer", "Dim City As Decimal"]', 
        correctAnswer: '0', 
        explanation: 'العنوان نص لذا نستخدم String' 
    },
    { 
        text: 'عند تنفيذ الكود: If X = 50 Then MsgBox ("ناجح") وكانت قيمة X تساوى 55 فإن', 
        options: '["يظهر صندوق رسالة به عبارة "ناجح"", "يحدث Runtime Error", "يظهر صندوق رسالة بدون نص", "يتوقف البرنامج"]', 
        correctAnswer: '3', 
        explanation: 'لا يتحقق الشرط فلا يظهر شيء' 
    },
    { 
        text: 'نوع البيان ......... الحد الأدنى له القيمة 0 والحد الأقصى 255', 
        options: '["Double", "String", "Integer", "Byte"]', 
        correctAnswer: '3', 
        explanation: 'Byte مداها من 0 إلى 255' 
    },
    { 
        text: 'يتوقف تنفيذ الحلقة التكرارية For m = 3 To 4 عندما تصل قيمة المتغير m إلى', 
        options: '["4", "3", "5"]', 
        correctAnswer: '1', 
        explanation: 'تتوقف بعد تنفيذ m=4' 
    },
    { 
        text: 'إذا كانت قيمة الثابت تاريخ أو وقت تكتب بين علامتي', 
        options: '[""" """, "&&", "##", "()"]', 
        correctAnswer: '2', 
        explanation: 'التواريخ توضع بين ##' 
    },
    { 
        text: 'يستخدم المبرمج الأمر ... في كتابة ملاحظات يمكن الرجوع إليها داخل الكود ولا يتم ترجمتها', 
        options: '["Rem", "Const"]', 
        correctAnswer: '0', 
        explanation: 'Rem للتعليقات' 
    },
    { 
        text: 'يمكن كتابة جملة الشرط If في سطر واحد بدون كتابة', 
        options: '["Then", "Else", "vbCrLf", "End If"]', 
        correctAnswer: '3', 
        explanation: 'If في سطر واحد لا تحتاج End If' 
    },
    { 
        text: 'الوسائط الإلكترونية عبارة عن التقنيات التي يستخدمها المعتدي الإلكتروني، وهي كثيرة منها', 
        options: '["Constant", "Email", "Variable", "Next"]', 
        correctAnswer: '1', 
        explanation: 'البريد الإلكتروني من وسائل التعدي' 
    },
    { 
        text: 'عند تنفيذ الصيغة الحسابية $Y=12-(2+4)/2$ يكون الناتج', 
        options: '["12", "7", "9", "3"]', 
        correctAnswer: '2', 
        explanation: '12 - (6)/2 = 12 - 3 = 9' 
    },
    { 
        text: 'ينفذ الكود الذي يلي Then في جملة IF... Then عندما يكون ناتج التعبير الشرطي', 
        options: '["False", "True", "Nothing", "Null"]', 
        correctAnswer: '1', 
        explanation: 'True تنفذ Then' 
    },
    { 
        text: 'قيمة أسماء المواد الدراسية يمكن تصنيفها كبيانات', 
        options: '["متنوعة", "رقمية غير صحيحة", "حرفية", "رقمية صحيحة"]', 
        correctAnswer: '2', 
        explanation: 'أسماء المواد نصوص' 
    },
    { 
        text: 'عند الإعلان عن الثابت الرياضي ( ط ) نستخدم الكود', 
        options: '["Const Pi As Single = 3.14", "Dim Pi As Single = 3.14", "Dim Pi As Single"]', 
        correctAnswer: '0', 
        explanation: 'للثابت نستخدم Const' 
    },
    { 
        text: 'عندما نرغب في تكرار كود (Code) محدد لعدد من المرات نستخدم جملة', 
        options: '["Do While", "For... Next", "Loop", "If ... Then"]', 
        correctAnswer: '1', 
        explanation: 'For...Next للتكرار المحدود' 
    },
    { 
        text: 'الناتج النهائي للمعادلة $Y=12-(2+4)/2$ هو', 
        options: '["7", "9", "12"]', 
        correctAnswer: '1', 
        explanation: '12 - 6/2 = 12 - 3 = 9' 
    },
    { 
        text: 'رسائل عدائية موجهة ضد شخص أو أكثر', 
        options: '["الملاحقة الالكترونية", "التشهير الالكتروني", "المضايقات الالكترونية"]', 
        correctAnswer: '2', 
        explanation: 'المضايقات هي الرسائل العدائية' 
    },
    { 
        text: 'نوع البيان (Integer) يشغل ... من حجم الذاكرة', 
        options: '["8 Byte", "2 Byte", "4 Byte"]', 
        correctAnswer: '2', 
        explanation: 'Integer يشغل 4 بايت' 
    },
    { 
        text: 'الحصول على نتائج خطأ بعد تشغيل برنامج VB.NET يطلق عليه', 
        options: '["خطأ منطقي", "خطأ لغوي", "خطأ أثناء التشغيل"]', 
        correctAnswer: '2', 
        explanation: 'Runtime Error يظهر بعد التشغيل' 
    },
    { 
        text: 'الكود العرض الأعداد الزوجية مرتبة تنازليا من (10) الى (2)', 
        options: '["for X = 10 to 1 step -2", "for X = 10 to 2 step -2", "كل ما سبق"]', 
        correctAnswer: '1', 
        explanation: 'من 10 إلى 2 بخطوة -2' 
    },
    { 
        text: 'القيمة الابتدائية (Initial Value) التي يتم تخزينها في المعلن عنه اختيارية', 
        options: '["المتغير", "الثابت", "كل ما سبق"]', 
        correctAnswer: '0', 
        explanation: 'المتغير لا يتطلب قيمة ابتدائية' 
    },
    { 
        text: 'رسالة الخطأ التالية (Name \'R\' is Not Declared) تشير إلى', 
        options: '["عدم التعرف علي المتغير R", "عدم الاعلان عن المتغير Name", "كل ما سبق"]', 
        correctAnswer: '0', 
        explanation: 'المتغير R غير معلن عنه' 
    },
    { 
        text: 'في الكود (If X <> 5 Then) لا يتحقق الشرط إذا كانت قيمة X تساوى', 
        options: '["5", "4", "6"]', 
        correctAnswer: '0', 
        explanation: '<> تعني لا يساوي' 
    },
    { 
        text: 'يتم تشغيل البرنامج بالضغط على مفتاح', 
        options: '["F5", "F4", "F7"]', 
        correctAnswer: '0', 
        explanation: 'F5 لتشغيل البرنامج' 
    },
    { 
        text: 'في الكود (If z = 10) العلامة (=) تشير إلى', 
        options: '["معامل التخصيص", "علامة منطقية", "لا شيء مما سبق"]', 
        correctAnswer: '0', 
        explanation: '= في If هي علامة منطقية للمقارنة' 
    },
    { 
        text: 'نوع البيان المناسب لقيمة مجموع درجات الطلاب (Std_Total) هو', 
        options: '["Short", "Single", "String"]', 
        correctAnswer: '0', 
        explanation: 'Short مناسب لمجموع الدرجات' 
    },
    { 
        text: 'في الكود (For i = 1 to 5) يتم تنفيذ الأوامر التي تلي Next اذا كانت قيمة ( i ) تساوي', 
        options: '["6", "4", "5"]', 
        correctAnswer: '0', 
        explanation: 'بعد تنفيذ i=5 تصبح 6 ثم تتوقف' 
    },
    { 
        text: 'عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر', 
        options: '["التشهير الإلكتروني", "التخفي الإلكتروني", "المضايقة الإلكترونية"]', 
        correctAnswer: '2', 
        explanation: 'المضايقة هي الرسائل العدائية' 
    },
    { 
        text: 'إذا وجد خطأ في حساب مساحة مستطيل في برنامج يعتبر هذا الخطأ', 
        options: '["Syntax Error", "Runtime Error", "Logical Error"]', 
        correctAnswer: '2', 
        explanation: 'خطأ في المنطق لا في الصياغة' 
    },
    { 
        text: 'قيمة أسعار الأدوات المكتبية يمكن تصنيفها كبيانات', 
        options: '["رقمية صحيحة", "رقمية غير صحيحة", "متنوعة"]', 
        correctAnswer: '1', 
        explanation: 'الأسعار قد تحتوي كسور' 
    },
    { 
        text: 'الصيغة الصحيحة للإعلان عن متغير النوع Gender هي', 
        options: '["Dim Gender As Decimal", "Dim Gender As Boolean", "Dim Gender As Integer"]', 
        correctAnswer: '1', 
        explanation: 'Boolean للنوع (ذكر/أنثى)' 
    },
    { 
        text: 'لتخصيص قيمة متغير نستخدم', 
        options: '["<>", "=", "&"]', 
        correctAnswer: '1', 
        explanation: '= للتخصيص' 
    },
    { 
        text: 'قيمة أسماء المواد الدراسية يمكن تصنيفها كبيانات', 
        options: '["متنوعة", "رقمية غير صحيحة", "حرفية"]', 
        correctAnswer: '2', 
        explanation: 'أسماء المواد نصوص' 
    },
    { 
        text: 'يفصل بين كل متغير والآخر بمعامل الربط', 
        options: '["<", "&", "="]', 
        correctAnswer: '1', 
        explanation: '& للربط النصي' 
    },
    { 
        text: 'يستخدم الأمر ... للإعلان عن الثوابت في لغة VB.NET', 
        options: '["Const", "Dim", "Name"]', 
        correctAnswer: '0', 
        explanation: 'Const للثوابت' 
    },
    { 
        text: 'تستخدم الكلمة المحجوزة ... في إنشاء سطر جديد', 
        options: '["Rem", "Me", "vbCrLf"]', 
        correctAnswer: '2', 
        explanation: 'vbCrLf للسطر الجديد' 
    },
    { 
        text: 'هو نشر معلومات عن شخص محدد أو أكثر بشكل مسيئ من خلال الوسائط الإلكترونية', 
        options: '["التهديد الإلكتروني", "التشهير الإلكتروني", "الملاحقة الإلكترونية"]', 
        correctAnswer: '1', 
        explanation: 'التشهير هو نشر معلومات مسيئة' 
    },
    { 
        text: 'تنفيذ مجموعة خطوات أو أخرى بناءً على إجابة سؤال معين', 
        options: '["التكرار", "قواعد التفرع", "لا شيء مما سبق"]', 
        correctAnswer: '1', 
        explanation: 'التفرع يعتمد على الشرط' 
    },
    { 
        text: 'إذا كانت قيمة الثابت تاريخ أو وقت توضع بين علامتي', 
        options: '["<>", """ """, "##"]', 
        correctAnswer: '2', 
        explanation: 'التواريخ بين ##' 
    },
    { 
        text: 'أمر يستخدم في الإعلان عن المتغيرات', 
        options: '["For", "Loop", "Dim"]', 
        correctAnswer: '2', 
        explanation: 'Dim للإعلان عن المتغيرات' 
    },
    { 
        text: 'المتغير من النوع ... يستخدم لتخزين الأعداد الصحيحة', 
        options: '["Double", "Decimal", "Integer"]', 
        correctAnswer: '2', 
        explanation: 'Integer للأعداد الصحيحة' 
    },
    { 
        text: 'يتكون التعبير الشرطي من', 
        options: '["جزئين", "ثلاثة أجزاء", "أربعة أجزاء"]', 
        correctAnswer: '0', 
        explanation: 'الطرف الأيسر والمعامل والطرف الأيمن' 
    },
    { 
        text: 'وظيفة الأمر (Me.TextBox1.Text = "") هو', 
        options: '["مسح محتويات صندوق النص", "إضافة محتوى لصندوق النص", "حذف صندوق النص"]', 
        correctAnswer: '0', 
        explanation: 'تفريغ صندوق النص' 
    },
    { 
        text: 'لابد أن تخصص لها قيمة ثابتة', 
        options: '["المتغيرات", "الثوابت", "التعبيرات الحسابية"]', 
        correctAnswer: '1', 
        explanation: 'الثوابت تتطلب قيمة' 
    },
    { 
        text: 'قيمة أسعار الأدوات المكتبية يمكن تصنيفها كبيانات', 
        options: '["متنوعة", "رقمية غير صحيحة", "حرفية"]', 
        correctAnswer: '1', 
        explanation: 'الأسعار قد تكون عشرية' 
    },
    { 
        text: 'تنتهى جميع جمل التفرع (IF ... Then) بـ', 
        options: '["Next", "End", "End if"]', 
        correctAnswer: '2', 
        explanation: 'If تنتهي بـ End If' 
    },
    { 
        text: 'الصيغة الصحيحة للإعلان عن متغير العنوان city هي', 
        options: '["Dim city As Decimal", "Dim city As Byte", "Dim city as string"]', 
        correctAnswer: '2', 
        explanation: 'العنوان نص' 
    },
    { 
        text: 'معامل المقارنة الذى يعبر عن أقل من أو يساوى هو', 
        options: '["<=", "><", ">="]', 
        correctAnswer: '0', 
        explanation: '<= تعني أقل من أو يساوي' 
    },
    { 
        text: 'جملة تستخدم في حالة تنفيذ كود code لعدد محدد من المرات هي', 
        options: '["If .. Then .. Else", "For .. Next", "Do While"]', 
        correctAnswer: '1', 
        explanation: 'For..Next للتكرار المحدود' 
    },
    { 
        text: 'من أشكال التعدى الإلكتروني', 
        options: '["المضايقات الإلكترونية", "التشهير الإلكتروني", "كل ما سبق"]', 
        correctAnswer: '2', 
        explanation: 'جميعها أشكال للتعدي' 
    },
    { 
        text: 'من أمثلة البيانات العددية الصحيحة', 
        options: '["Char", "Integer", "String"]', 
        correctAnswer: '1', 
        explanation: 'Integer أعداد صحيحة' 
    },
    { 
        text: 'يعتبر اسم متغير صحيح', 
        options: '["Total", "As", "77City"]', 
        correctAnswer: '0', 
        explanation: 'Total يبدأ بحرف وليس كلمة محجوزة' 
    },
    { 
        text: 'جملة التخصيص عبارة عن طرفين بينهما علامة', 
        options: '["&", "=", "#"]', 
        correctAnswer: '1', 
        explanation: '= للتخصيص' 
    },
    { 
        text: 'الصيغة الصحيحة للإعلان عن متغير العنوان City هي', 
        options: '["Dim City As Byte", "Dim City As Decimal", "Dim City As String"]', 
        correctAnswer: '2', 
        explanation: 'العنوان نص' 
    },
    { 
        text: 'إذا كانت قيمة الثابت تاريخ أو وقت فإنها توضع بين علامتي ... أثناء الإعلان عنه', 
        options: '[""" """, "##"]', 
        correctAnswer: '1', 
        explanation: 'التواريخ بين ##' 
    },
    { 
        text: 'يتم الفصل بين كل متغير وآخر بمعامل الربط', 
        options: '["#", "&", "*"]', 
        correctAnswer: '1', 
        explanation: '& للربط النصي' 
    },
    { 
        text: 'نشر معلومات عن شخص أو أكثر بشكل مسيء يطلق عليه', 
        options: '["الاستثناء الإلكتروني", "التهديد الإلكتروني", "التشهير الإلكتروني"]', 
        correctAnswer: '2', 
        explanation: 'التشهير هو نشر معلومات مسيئة' 
    },
    { 
        text: 'من أنواع البيانات المتنوعة التي لا تندرج تحت تصنيف البيانات الرقمية أو الحرفية', 
        options: '["Single", "Object", "Char"]', 
        correctAnswer: '1', 
        explanation: 'Object نوع متنوع' 
    },
    { 
        text: 'في جملة for... next يمكن لأي من قيمة البداية أو النهاية أو معدل الزيادة أن يكون متغیر (variable).', 
        options: '["صح", "خطأ"]', 
        correctAnswer: '0', 
        explanation: 'يمكن أن تكون متغيرات' 
    },
    { 
        text: 'الخطأ الذي يظهر بسبب صياغة تعبيرات حسابية أو منطقية بصورة خطأ يسمى', 
        options: '["Runtime Error", "Logical Error", "Syntax Error"]', 
        correctAnswer: '2', 
        explanation: 'Syntax Error خطأ في الصياغة' 
    },
    { 
        text: 'جملة ... أحد جمل التكرار المحدود حيث تستخدم عندما نرغب في تكرار Code معين عدد محدد من المرات', 
        options: '["If... Then", "Do while... Loop", "For... Next"]', 
        correctAnswer: '2', 
        explanation: 'For...Next للتكرار المحدود' 
    },
    { 
        text: 'عبارة عن تجاهل شخص أو أكثر من خلال وسائط إلكترونية', 
        options: '["التهديد الإلكتروني", "الملاحقة الإلكترونية", "الإستثناء الإلكتروني"]', 
        correctAnswer: '2', 
        explanation: 'الاستثناء هو التجاهل' 
    },
    { 
        text: 'من أنواع البيانات الحرفية', 
        options: '["Date", "Long", "String"]', 
        correctAnswer: '2', 
        explanation: 'String للبيانات الحرفية' 
    },
    { 
        text: 'الخطأ الذي يظهر بعد تشغيل برنامج بلغة VB.Net يسمى', 
        options: '["خطأ أثناء التشغيل", "خطأ منطقى", "خطأ لغوى"]', 
        correctAnswer: '0', 
        explanation: 'Runtime Error بعد التشغيل' 
    },
    { 
        text: 'صورة الطالب يمكن تصنيفها ضمن البيانات', 
        options: '["الحرفية", "الرقمية", "المتنوعة"]', 
        correctAnswer: '2', 
        explanation: 'الصور بيانات متنوعة' 
    },
    { 
        text: 'في لغة VB.Net هي مخازن بالذاكرة لها إسم وقيمة ثابتة', 
        options: '["المتغيرات", "الثوابت", "الأخطاء"]', 
        correctAnswer: '1', 
        explanation: 'الثوابت لها قيمة ثابتة' 
    }
];

// أسئلة المصطلحات العلمية (تحويلها لاختيار من متعدد)
const terminologyQuestions = [
    { 
        text: 'تستخدم لتكرار كود معين لعدد محدد من المرات غير معروف نهايته مسبقاً وإنما بناءً على شرط معين', 
        options: '["Do While...Loop", "For...Next", "If...Then"]', 
        correctAnswer: '0', 
        explanation: 'Do While تستخدم للتكرار غير المحدد' 
    },
    { 
        text: 'مجموعة من الأوامر تحت اسم معين يفضل أن يكون معبراً عن وظيفتها يتم تطبيقها على مدخلات "parameters" وتعود بقيمة', 
        options: '["Function", "Sub", "Property"]', 
        correctAnswer: '0', 
        explanation: 'Function تعود بقيمة' 
    },
    { 
        text: 'أماكن محجوزة في ذاكرة الكمبيوتر RAM عند الإعلان عنها يتحدد لها اسم ونوع وعادة ما تتغير قيمتها أثناء سير البرنامج', 
        options: '["المتغيرات", "الثوابت", "الإجراءات"]', 
        correctAnswer: '0', 
        explanation: 'المتغيرات تتغير قيمتها' 
    },
    { 
        text: 'نشر كلمات عدائية ومبتذلة ضد شخص أو أكثر من خلال أحد وسائط الاتصال الإلكتروني', 
        options: '["المضايقة الإلكترونية", "التشهير الإلكتروني", "التهديد الإلكتروني"]', 
        correctAnswer: '0', 
        explanation: 'المضايقة هي الكلمات العدائية' 
    },
    { 
        text: 'نوع بيانات الحد الأدنى له (0) والحد الأقصى (255)', 
        options: '["Byte", "Integer", "Short"]', 
        correctAnswer: '0', 
        explanation: 'Byte مداها 0-255' 
    },
    { 
        text: 'يقصد به تعيين قيمة لثابت أو متغير', 
        options: '["التخصيص", "الإعلان", "التهيئة"]', 
        correctAnswer: '0', 
        explanation: 'التخصيص هو تعيين القيمة' 
    },
    { 
        text: 'تقنيات يستخدمها المتعدي الإلكتروني', 
        options: '["الوسائط الإلكترونية", "لغات البرمجة", "قواعد البيانات"]', 
        correctAnswer: '0', 
        explanation: 'الوسائط الإلكترونية أدوات التعدي' 
    },
    { 
        text: 'أمر يستخدم في كتابة ملاحظات داخل الكود في لغة VB.NET ويمكن الرجوع إليها', 
        options: '["Rem", "Dim", "Const"]', 
        correctAnswer: '0', 
        explanation: 'Rem للتعليقات' 
    },
    { 
        text: 'أمر يستخدم في الإعلان عن المتغيرات في لغة VB.NET', 
        options: '["Dim", "Const", "Rem"]', 
        correctAnswer: '0', 
        explanation: 'Dim للإعلان عن المتغيرات' 
    },
    { 
        text: 'تجاهل شخص أو أكثر من خلال الوسائط الإلكترونية', 
        options: '["الاستثناء الإلكتروني", "الملاحقة الإلكترونية", "المضايقة الإلكترونية"]', 
        correctAnswer: '0', 
        explanation: 'الاستثناء هو التجاهل' 
    },
    { 
        text: 'جملة تستخدم لتكرار كود معين لعدد محدد من المرات', 
        options: '["For...Next", "Do While", "If...Then"]', 
        correctAnswer: '0', 
        explanation: 'For...Next للتكرار المحدود' 
    },
    { 
        text: 'أخطاء في الصيغة العامة لأوامر اللغة', 
        options: '["Syntax Error", "Runtime Error", "Logical Error"]', 
        correctAnswer: '0', 
        explanation: 'Syntax Error خطأ في الصياغة' 
    },
    { 
        text: 'أحد مفاتيح لوحة المفاتيح بالضغط عليه يتم تشغيل البرنامج في لغة VB.Net', 
        options: '["F5", "F4", "F7"]', 
        correctAnswer: '0', 
        explanation: 'F5 لتشغيل البرنامج' 
    },
    { 
        text: 'عبارة عن أماكن محجوزة في ذاكرة الكمبيوتر ( RAM ) عند الإعلان عنها يتحدد لها اسم ونوع، وتأخذ قيمة ثابتة لا تتغير أثناء سير البرنامج', 
        options: '["الثوابت", "المتغيرات", "الإجراءات"]', 
        correctAnswer: '0', 
        explanation: 'الثوابت قيمتها ثابتة' 
    },
    { 
        text: 'عبارة عن سلوك عدواني متعمد من شخص لآخر عبر وسائط الاتصال الإلكترونية', 
        options: '["التعدي الإلكتروني", "الاستخدام الآمن", "البرمجة"]', 
        correctAnswer: '0', 
        explanation: 'التعدي الإلكتروني سلوك عدواني' 
    },
    { 
        text: 'ثابت حرفي يستخدم لإضافة رمز مفتاح الإدخال وإنشاء سطر جديد', 
        options: '["vbCrLf", "vbTab", "vbNewLine"]', 
        correctAnswer: '0', 
        explanation: 'vbCrLf للسطر الجديد' 
    }
];

// أسئلة الإكمال (تحويلها لاختيار من متعدد)
const completionQuestions = [
    { 
        text: 'نوع من البيانات المتنوعة ...', 
        options: '["Decimal", "Long", "Boolean"]', 
        correctAnswer: '2', 
        explanation: 'Boolean نوع متنوع' 
    },
    { 
        text: '... تعبر عن نافذة النموذج الحالية', 
        options: '["Me", "Rem", "Char"]', 
        correctAnswer: '0', 
        explanation: 'Me للنموذج الحالي' 
    },
    { 
        text: 'تستخدم في حالة أن قيمة الثابت تاريخ أو وقت ...', 
        options: '["@@", "##", "??"]', 
        correctAnswer: '1', 
        explanation: 'التواريخ بين ##' 
    },
    { 
        text: 'تستخدم للإعلان عن الثوابت ...', 
        options: '["Const", "Dim", "Variable"]', 
        correctAnswer: '0', 
        explanation: 'Const للثوابت' 
    },
    { 
        text: 'يستخدم أمر ... في الإعلان عن الثوابت', 
        options: '["Const", "Dim", "Static"]', 
        correctAnswer: '0', 
        explanation: 'Const للثوابت' 
    },
    { 
        text: 'يعتبر ... صورة من صور التعدي الإلكتروني', 
        options: '["المضايقة", "التشهير", "الاستثناء"]', 
        correctAnswer: '1', 
        explanation: 'التشهير صورة من التعدي' 
    },
    { 
        text: 'الجملة ... لتكرار كود محدد غير معروف نهايته مسبقاً وإنما بناء على شرط معين', 
        options: '["Do While", "For...Next", "If...Then"]', 
        correctAnswer: '0', 
        explanation: 'Do While للتكرار غير المحدد' 
    },
    { 
        text: 'يستخدم المبرمج الأمر ... في كتابة ملاحظات يمكن الرجوع إليها داخل الكود، ولا يتم ترجمتها', 
        options: '["Rem", "Me", "vbCrLf"]', 
        correctAnswer: '0', 
        explanation: 'Rem للتعليقات' 
    },
    { 
        text: 'جملة ... تستخدم عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة', 
        options: '["Select Case", "If...Then", "For...Next"]', 
        correctAnswer: '0', 
        explanation: 'Select Case للتفرع المتعدد' 
    },
    { 
        text: 'الكلمة المحجوزة ... تستخدم لإضافة تعليق أو ملاحظة وسطر يهمله مترجم البرنامج', 
        options: '["Rem", "Dim", "Const"]', 
        correctAnswer: '0', 
        explanation: 'Rem للتعليقات' 
    },
    { 
        text: 'الكود اللازم لتخصيص القيمة (1/5/2025) للمتغير B_D هو .......', 
        options: '["B_D = #1/5/2025#", "B_D = "1/5/2025"", "B_D = 1/5/2025"]', 
        correctAnswer: '0', 
        explanation: 'التاريخ بين ##' 
    },
    { 
        text: 'في حالة عدم كتابة كلمة Step في جملة For يكون مقدار الزيادة ........', 
        options: '["1", "2", "0"]', 
        correctAnswer: '0', 
        explanation: 'الخطوة الافتراضية هي 1' 
    },
    { 
        text: 'الثابت الحرفي vbCrLf يستخدم في .......', 
        options: '["إنشاء سطر جديد", "الانتقال للبداية", "المسح"]', 
        correctAnswer: '0', 
        explanation: 'vbCrLf للسطر الجديد' 
    },
    { 
        text: 'الكود اللازم للإعلان عن الثابت Y لتخزين القيمة 3.14 هو .......', 
        options: '["Const Y As Single = 3.14", "Dim Y As Single = 3.14", "Y = 3.14"]', 
        correctAnswer: '0', 
        explanation: 'Const للثابت' 
    },
    { 
        text: 'الإعلان عن دالة يبدأ بـ ... وينتهي بـ End Function', 
        options: '["Sub", "Dim", "Function", "Procedure"]', 
        correctAnswer: '2', 
        explanation: 'الدالة تبدأ بـ Function' 
    },
    { 
        text: 'يستخدم المبرمج الأمر ...... في كتابة الملاحظات ويمكن الرجوع إليها داخل الكود', 
        options: '["Rem", "Me", "vbCrLf"]', 
        correctAnswer: '0', 
        explanation: 'Rem للتعليقات' 
    },
    { 
        text: '.... أماكن بالذاكرة تحتوي قيماً متغيرة', 
        options: '["المتغيرات", "الثوابت", "الإجراءات"]', 
        correctAnswer: '0', 
        explanation: 'المتغيرات قيمتها متغيرة' 
    },
    { 
        text: '.... تعبر عن نافذة النموذج (Form) الحالية', 
        options: '["Me", "This", "Form1"]', 
        correctAnswer: '0', 
        explanation: 'Me للنموذج الحالي' 
    },
    { 
        text: 'كلمة محجوزة تستخدم في إنشاء سطر جديد ..........', 
        options: '["vbCrLf", "vbTab", "vbNewLine"]', 
        correctAnswer: '0', 
        explanation: 'vbCrLf للسطر الجديد' 
    },
    { 
        text: '.... لا تتغير قيمتها أثناء سير البرنامج', 
        options: '["الثوابت", "المتغيرات", "الإجراءات"]', 
        correctAnswer: '0', 
        explanation: 'الثوابت قيمتها ثابتة' 
    },
    { 
        text: 'تستخدم ... فى جملة IF في حالة عدم تحقق الشرط', 
        options: '["Else", "Then", "End If"]', 
        correctAnswer: '0', 
        explanation: 'Else تنفذ عند عدم تحقق الشرط' 
    },
    { 
        text: 'تصنف قيمة اسم الطالب ضمن البيانات ...', 
        options: '["الرقمية", "الحرفية", "المتنوعة"]', 
        correctAnswer: '1', 
        explanation: 'الاسم نص' 
    },
    { 
        text: '.... عبارة عن نشر كلمات عدائية ومبتذلة ضد شخص أو أكثر من خلال أحد وسائط الاتصال الإلكتروني', 
        options: '["المضايقة الإلكترونية", "التشهير الإلكتروني", "التهديد الإلكتروني"]', 
        correctAnswer: '0', 
        explanation: 'المضايقة هي الكلمات العدائية' 
    },
    { 
        text: 'في لغة VB.Net يقصد بـ....... مخازن بذاكرة الكمبيوتر لها اسم ونوع', 
        options: '["المتغيرات", "الثوابت", "الإجراءات"]', 
        correctAnswer: '0', 
        explanation: 'المتغيرات مخازن في الذاكرة' 
    },
    { 
        text: '.... من أشكال التعدي الالكتروني', 
        options: '["المضايقة", "البرمجة", "التوثيق"]', 
        correctAnswer: '0', 
        explanation: 'المضايقة شكل من أشكال التعدي' 
    }
];

try {
    const insert = db.prepare('INSERT INTO "InteractiveQuestions" (QuizId, Text, Type, Options, CorrectAnswer, Explanation, OrderIndex) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    // الحصول على أكبر OrderIndex موجود
    const maxOrder = db.prepare('SELECT MAX(OrderIndex) as maxOrder FROM "InteractiveQuestions" WHERE QuizId = ?').get(quizId);
    let startOrder = (maxOrder.maxOrder || 0) + 1;
    
    db.transaction(() => {
        // إضافة أسئلة الصواب والخطأ
        console.log('Adding True/False Questions...');
        trueFalseQuestions.forEach((q, i) => {
            const orderIndex = startOrder++;
            insert.run(quizId, q.text, 'TrueFalse', '["صح", "خطأ"]', q.correctAnswer, q.explanation, orderIndex);
            console.log(`Added TF question ${orderIndex}: ${q.text.substring(0, 50)}...`);
        });
        
        // إضافة أسئلة الاختيار من متعدد
        console.log('\nAdding MCQ Questions...');
        mcqQuestions.forEach((q, i) => {
            const orderIndex = startOrder++;
            insert.run(quizId, q.text, 'MCQ', q.options, q.correctAnswer, q.explanation, orderIndex);
            console.log(`Added MCQ question ${orderIndex}: ${q.text.substring(0, 50)}...`);
        });
        
        // إضافة أسئلة المصطلحات
        console.log('\nAdding Terminology Questions...');
        terminologyQuestions.forEach((q, i) => {
            const orderIndex = startOrder++;
            insert.run(quizId, q.text, 'MCQ', q.options, q.correctAnswer, q.explanation, orderIndex);
            console.log(`Added Terminology question ${orderIndex}: ${q.text.substring(0, 50)}...`);
        });
        
        // إضافة أسئلة الإكمال
        console.log('\nAdding Completion Questions...');
        completionQuestions.forEach((q, i) => {
            const orderIndex = startOrder++;
            insert.run(quizId, q.text, 'MCQ', q.options, q.correctAnswer, q.explanation, orderIndex);
            console.log(`Added Completion question ${orderIndex}: ${q.text.substring(0, 50)}...`);
        });
    })();
    
    const totalAdded = trueFalseQuestions.length + mcqQuestions.length + terminologyQuestions.length + completionQuestions.length;
    console.log(`\n✅ Successfully added ${totalAdded} new questions to Quiz ID ${quizId}`);
    console.log(`📊 True/False: ${trueFalseQuestions.length} questions`);
    console.log(`📊 MCQ: ${mcqQuestions.length} questions`);
    console.log(`📊 Terminology: ${terminologyQuestions.length} questions`);
    console.log(`📊 Completion: ${completionQuestions.length} questions`);
    console.log('\n🌐 All questions are now available at: https://www.amertimraz.com/interactive-revision/slug/3rd-prep-cs-final-revision');
    
} catch (err) {
    console.error('Error adding questions:', err.message);
} finally {
    db.close();
}
