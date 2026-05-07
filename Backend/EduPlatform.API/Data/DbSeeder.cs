using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EduPlatform.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await SeedInteractiveQuizzesAsync(context);
        }

        private static async Task SeedInteractiveQuizzesAsync(AppDbContext context)
        {
            var existing = await context.InteractiveQuizzes.Include(q => q.Questions).FirstOrDefaultAsync(q => q.Slug == "3rd-prep-cs-final-revision");
            if (existing != null)
            {
                context.InteractiveQuizzes.Remove(existing);
                await context.SaveChangesAsync();
            }

            var quiz = new InteractiveQuiz
            {
                Title = "الموسوعة النهائية الشاملة للحاسب الآلي - 3 إعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "أضخم بنك أسئلة تفاعلي يضم كافة امتحانات الـ 30 محافظة (الفائز 2026)",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new List<dynamic>();

            // --- القسم 1: الأسئلة الذهبية (النخبة - 25 سؤالاً) ---
            rawQuestions.AddRange(new[] {
                new { T = "مدى القيم لنوع البيانات (Byte) يبدأ بـ 0 وينتهي بـ 255.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "الأخطاء اللغوية (Syntax Errors) هي أخطاء في الصيغة العامة لأوامر اللغة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "الخطأ الذي يظهر عند كتابة معادلة حسابية بطريقة تؤدي لناتج خطأ يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "الكلمة المحجوزة التي تُستخدم لإنشاء سطر جديد هي vbCrLf.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "المصطلح (Me) يُعبّر عن نافذة النموذج الحالية (Current Form).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "يستخدم الرمز (&) للربط بين السلاسل النصية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "التخفي الإلكتروني هو استخدام أسماء مستعارة لإخفاء هوية المتعدي.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "يستخدم المعامل (Mod) للحصول على باقي القسمة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "في لغة VB.NET للتعبير عن التفرع برمجياً نستخدم جملة If...Then فقط.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "الأسئلة الذهبية" },
                new { T = "المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "تعتبر جملة الإعلان التالية جملة صحيحة: Dim single as integer", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "الأسئلة الذهبية" },
                new { T = "جملة التخصيص عبارة عن طرفين بينهما علامة (=).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "Select Case تستخدم عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "الإجراء Procedure هو مجموعة من الأوامر تحت اسم معين يتم استدعاؤه لتنفيذها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "الصيغة الصحيحة للإعلان عن متغير اسمه City يخزن اسم المدينة هي Dim City As String.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "معدل الزيادة في For...Next يجب أن يكون سالباً إذا كانت البداية أكبر من النهاية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "يستخدم الكود (Me.Textbox1.Text=\"\") في مسح محتويات صندوق النص.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "التشهير الإلكتروني هو نشر معلومات مسيئة عن شخص معين عبر الوسائط الإلكترونية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "أول عملية يتم تنفيذها في التعبيرات الحسابية هي فك الأقواس.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "عند تنفيذ (For i = 1 to 10 Step 2) فإن قيم i هي 1,3,5,7,9.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الأسئلة الذهبية" },
                new { T = "يُستخدم الأمر Dim للإعلان عن المتغيرات في لغة VB.NET.", Type = "Completion", Opts = "[]", Ans = "Dim", Exp = "الأسئلة الذهبية" },
                new { T = "الثوابت هي أماكن محجوزة في الذاكرة قيمتها لا تتغير أثناء تشغيل البرنامج.", Type = "Completion", Opts = "[]", Ans = "لا تتغير", Exp = "الأسئلة الذهبية" },
                new { T = "باقي قسمة 10 على 3 هو 1 باستخدام المعامل Mod.", Type = "Completion", Opts = "[]", Ans = "1", Exp = "الأسئلة الذهبية" },
                new { T = "إذا كانت قيمة البداية 1 والنهاية 5 والزيادة 1، تنتهي الحلقة عندما يصبح العداد 6.", Type = "Completion", Opts = "[]", Ans = "6", Exp = "الأسئلة الذهبية" },
                new { T = "توضع قيم التاريخ والوقت بين علامتي # # عند تخصيصها.", Type = "Completion", Opts = "[]", Ans = "# #", Exp = "الأسئلة الذهبية" }
            });

            // --- القسم 2: بنك الأسئلة العام (45+ سؤالاً جديداً) ---

            // 2.1: صح وخطأ إضافي
            rawQuestions.AddRange(new[] {
                new { T = "يمكن أن يبدأ اسم المتغير برقم.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يجب أن يبدأ بحرف." },
                new { T = "تتميز لغة VB.NET بالتعامل مع أنواع مختلفة من البيانات.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "أسوان" },
                new { T = "يستخدم الأمر Rem لكتابة ملاحظات لا يتم ترجمتها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "بورسعيد" },
                new { T = "يتكون التعبير الشرطي من 3 أجزاء.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الجيزة" },
                new { T = "الوسائط Parameters تستخدم لاستقبال قيم من خارج الإجراء.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "الشرقية" },
                new { T = "مواقع التواصل تساعد في التعرف على أشخاص يفضل مقابلتهم.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "خطر أمني" },
                new { T = "تصنف أسماء المواد الدراسية كبيانات متنوعة String.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "نستخدم جملة Do While لتكرار كود لعدد محدد من المرات مسبقاً.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "تستخدم لعدد غير معروف." },
                new { T = "يمكن كتابة جملة If في سطر واحد بدون End If.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "المعامل <> يعبر عن 'أقل من أو يساوي'.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يعني لا يساوي." }
            });

            // 2.2: المصطلح العلمي (اكتب المفهوم)
            rawQuestions.AddRange(new[] {
                new { T = "المصطلح العلمي: أماكن محجوزة بذاكرة الكمبيوتر تتغير قيمتها أثناء سير البرنامج.", Type = "Completion", Opts = "[]", Ans = "المتغيرات", Exp = "" },
                new { T = "المصطلح العلمي: أخطاء تظهر عند تشغيل البرنامج وتؤدي لتوقفه.", Type = "Completion", Opts = "[]", Ans = "Runtime Error", Exp = "" },
                new { T = "المصطلح العلمي: السلوك العدواني المتعمد من شخص لآخر عبر الوسائط الإلكترونية.", Type = "Completion", Opts = "[]", Ans = "التعدي الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: جملة تستخدم لتكرار كود معين بناءً على شرط معين ونهايته غير معروفة مسبقاً.", Type = "Completion", Opts = "[]", Ans = "Do While", Exp = "" },
                new { T = "المصطلح العلمي: إجراء يقوم بتنفيذ مجموعة من الأوامر ويعود بقيمة.", Type = "Completion", Opts = "[]", Ans = "Function", Exp = "" },
                new { T = "المصطلح العلمي: استخدام وسائط إلكترونية لنشر معلومات مسيئة عن شخص.", Type = "Completion", Opts = "[]", Ans = "التشهير الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: مجموعة من الأوامر والتعليمات تحت اسم معين يتم استدعاؤه.", Type = "Completion", Opts = "[]", Ans = "Procedure", Exp = "" },
                new { T = "المصطلح العلمي: الكلمة المستخدمة لتمثيل نافذة النموذج الحالية.", Type = "Completion", Opts = "[]", Ans = "Me", Exp = "" }
            });

            // 2.3: اختيارات متقدمة
            rawQuestions.AddRange(new[] {
                new { T = "ناتج العملية الحسابية 12 - (2 + 4) / 2 هو:", Type = "MCQ", Opts = "[\"3\", \"9\", \"6\"]", Ans = "1", Exp = "9" },
                new { T = "نوع البيان المناسب لتخزين (درجة الطالب) التي قد تحتوي على كسور:", Type = "MCQ", Opts = "[\"Integer\", \"Single\", \"Boolean\"]", Ans = "1", Exp = "Single" },
                new { T = "عدد اختيارات التفرع الممكنة في جملة If...Then...Else هو:", Type = "MCQ", Opts = "[\"اختيار واحد\", \"اختياران\", \"أكثر من اختيارين\"]", Ans = "1", Exp = "" },
                new { T = "يتم تشغيل البرنامج في لغة VB.NET بالضغط على مفتاح:", Type = "MCQ", Opts = "[\"F4\", \"F5\", \"F7\"]", Ans = "1", Exp = "" },
                new { T = "نوع الخطأ الناتج عن كتابة (Dim X As Byte = 500) هو:", Type = "MCQ", Opts = "[\"Syntax Error\", \"Runtime Error\", \"Logical Error\"]", Ans = "1", Exp = "لأن Byte أقصى قيمة له 255." },
                new { T = "المعامل المستخدم للربط بين النصوص هو:", Type = "MCQ", Opts = "[\"+\", \"&\", \"*\"]", Ans = "1", Exp = "" },
                new { T = "توضع القيم النصية بين علامتي:", Type = "MCQ", Opts = "[\"# #\", \"' '\", \"\\\" \\\"\"]", Ans = "2", Exp = "" }
            });

            // 2.4: أكواد برمجية (تحدي)
            rawQuestions.AddRange(new[] {
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor i = 10 To 1 Step -2\\n   MsgBox(i)\\nNext\\n```\\nما هي آخر قيمة سيأخذها العداد؟", Type = "MCQ", Opts = "[\"1\", \"2\", \"0\"]", Ans = "1", Exp = "2 هي آخر قيمة داخل النطاق." },
                new { T = "اقرأ الكود التالي:\\n```vb\\nIf X > 50 Then\\n   MsgBox(\"ناجح\")\\nElse\\n   MsgBox(\"راسب\")\\nEnd If\\n```\\nإذا كانت قيمة X=50، ماذا سيظهر؟", Type = "MCQ", Opts = "[\"ناجح\", \"راسب\", \"لا شيء\"]", Ans = "1", Exp = "لأن الشرط أكبر من وليس أكبر من أو يساوي." },
                new { T = "في الكود (For X = 1 To 5 Step 2)، كم مرة يتم تنفيذ الحلقة؟", Type = "MCQ", Opts = "[\"2\", \"3\", \"5\"]", Ans = "1", Exp = "1, 3, 5 (3 مرات)" },
                new { T = "ما ناتج تنفيذ الكود التالي؟\\n```vb\\nDim A As Integer = 5\\nDim B As Integer = 2\\nMsgBox(A Mod B)\\n```", Type = "MCQ", Opts = "[\"2.5\", \"1\", \"2\"]", Ans = "1", Exp = "باقي قسمة 5 على 2 هو 1." }
            });

            // 2.5: إكمال ومسائل
            rawQuestions.AddRange(new[] {
                new { T = "تخرج حلقة For i = 1 To 10 عندما تصبح قيمة i تساوي ......", Type = "Completion", Opts = "[]", Ans = "11", Exp = "" },
                new { T = "يعتبر النوع ...... هو أنسب نوع لتخزين (النوع: ذكر أو أنثى).", Type = "Completion", Opts = "[]", Ans = "Boolean", Exp = "" },
                new { T = "الأمر الذي يستخدم للإعلان عن الثوابت هو ......", Type = "Completion", Opts = "[]", Ans = "Const", Exp = "" },
                new { T = "الرسائل العدائية عبر الوسائط الإلكترونية تسمى ......", Type = "Completion", Opts = "[]", Ans = "المضايقة الإلكترونية", Exp = "" },
                new { T = "يستخدم الرمز ...... للتعبير عن 'لا يساوي'.", Type = "Completion", Opts = "[]", Ans = "<>", Exp = "" }
            });

            int index = 0;
            foreach (var q in rawQuestions)
            {
                IQType type = IQType.MCQ;
                if (q.Type == "TrueFalse") type = IQType.TrueFalse;
                else if (q.Type == "Completion") type = IQType.Completion;

                quiz.Questions.Add(new InteractiveQuestion
                {
                    Text = q.T,
                    Type = type,
                    Options = q.Opts,
                    CorrectAnswer = q.Ans,
                    Explanation = q.Exp,
                    OrderIndex = index++
                });
            }

            context.InteractiveQuizzes.Add(quiz);
            await context.SaveChangesAsync();
        }
    }
}
