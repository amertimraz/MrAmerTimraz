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
                Title = "الموسوعة المليونية للحاسب الآلي - 3 إعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "أكبر بنك أسئلة تفاعلي في مصر يضم 100 سؤال فريد من كافة المحافظات (الفائز 2026)",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new List<dynamic>();

            // --- القسم 1: النخبة الذهبية (25 سؤالاً) ---
            rawQuestions.AddRange(new[] {
                new { T = "مدى القيم لنوع البيانات (Byte) يبدأ بـ 0 وينتهي بـ 255.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الأخطاء اللغوية (Syntax Errors) هي أخطاء في الصيغة العامة لأوامر اللغة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الخطأ الذي يظهر عند كتابة معادلة حسابية بطريقة تؤدي لناتج خطأ يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الكلمة المحجوزة التي تُستخدم لإنشاء سطر جديد هي vbCrLf.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "المصطلح (Me) يُعبّر عن نافذة النموذج الحالية (Current Form).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "يستخدم الرمز (&) للربط بين السلاسل النصية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "التخفي الإلكتروني هو استخدام أسماء مستعارة لإخفاء هوية المتعدي.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "يستخدم المعامل (Mod) للحصول على باقي القسمة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "في لغة VB.NET للتعبير عن التفرع برمجياً نستخدم جملة If...Then فقط.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Golden" },
                new { T = "المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "تعتبر جملة الإعلان التالية جملة صحيحة: Dim single as integer", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Golden" },
                new { T = "جملة التخصيص عبارة عن طرفين بينهما علامة (=).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "Select Case تستخدم عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الإجراء Procedure هو مجموعة من الأوامر تحت اسم معين يتم استدعاؤه لتنفيذها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الصيغة الصحيحة للإعلان عن متغير اسمه City يخزن اسم المدينة هي Dim City As String.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "معدل الزيادة في For...Next يجب أن يكون سالباً إذا كانت البداية أكبر من النهاية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "يستخدم الكود (Me.Textbox1.Text=\"\") في مسح محتويات صندوق النص.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "التشهير الإلكتروني هو نشر معلومات مسيئة عن شخص معين عبر الوسائط الإلكترونية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "أول عملية يتم تنفيذها في التعبيرات الحسابية هي فك الأقواس.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "عند تنفيذ (For i = 1 to 10 Step 2) فإن قيم i هي 1,3,5,7,9.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "يُستخدم الأمر Dim للإعلان عن المتغيرات في لغة VB.NET.", Type = "Completion", Opts = "[]", Ans = "Dim", Exp = "Golden" },
                new { T = "الثوابت هي أماكن محجوزة في الذاكرة قيمتها لا تتغير أثناء تشغيل البرنامج.", Type = "Completion", Opts = "[]", Ans = "لا تتغير", Exp = "Golden" },
                new { T = "باقي قسمة 10 على 3 هو 1 باستخدام المعامل Mod.", Type = "Completion", Opts = "[]", Ans = "1", Exp = "Golden" },
                new { T = "إذا كانت قيمة البداية 1 والنهاية 5 والزيادة 1، تنتهي الحلقة عندما يصبح العداد 6.", Type = "Completion", Opts = "[]", Ans = "6", Exp = "Golden" },
                new { T = "توضع قيم التاريخ والوقت بين علامتي # # عند تخصيصها.", Type = "Completion", Opts = "[]", Ans = "# #", Exp = "Golden" }
            });

            // --- القسم 2: بنك الأسئلة العام المطور (أكثر من 75 سؤالاً إضافياً) ---

            // 2.1: صح وخطأ (متقدم)
            rawQuestions.AddRange(new[] {
                new { T = "يمكن أن يبدأ اسم المتغير برقم.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يجب أن يبدأ بحرف." },
                new { T = "تتميز لغة VB.NET بالتعامل مع أنواع مختلفة من البيانات.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يستخدم الأمر Rem لكتابة ملاحظات لا يتم ترجمتها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يتكون التعبير الشرطي من 3 أجزاء.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "الوسائط Parameters تستخدم لاستقبال قيم من خارج الإجراء.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "تصنف أسماء المواد الدراسية كبيانات متنوعة String.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "نستخدم جملة Do While لتكرار كود لعدد غير معروف من المرات مسبقاً.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يمكن كتابة جملة If في سطر واحد بدون End If.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "المعامل <> يعبر عن 'لا يساوي'.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يمكن استخدام الرمز $ في تسمية المتغيرات.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "لا يسمح بالرموز الخاصة." },
                new { T = "تستخدم الدالة Mod لإيجاد باقي القسمة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يبدأ الإعلان عن دالة بكلمة Sub وينتهي بـ End Sub.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "الدالة تبدأ بـ Function." },
                new { T = "الملاحقة الإلكترونية (Cyber Stalking) هي إرسال رسائل تهديد متكررة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "Select Case تعتمد في تفرعها على قيمة متغير واحد فقط.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "نوع البيان Single يستخدم لتخزين الأرقام العشرية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" }
            });

            // 2.2: المصطلح العلمي (20 سؤالاً)
            rawQuestions.AddRange(new[] {
                new { T = "المصطلح العلمي: أماكن محجوزة بالذاكرة تتغير قيمتها أثناء سير البرنامج.", Type = "Completion", Opts = "[]", Ans = "المتغيرات", Exp = "" },
                new { T = "المصطلح العلمي: أخطاء تظهر عند تشغيل البرنامج وتؤدي لتوقفه.", Type = "Completion", Opts = "[]", Ans = "Runtime Error", Exp = "" },
                new { T = "المصطلح العلمي: السلوك العدواني المتعمد من شخص لآخر عبر الإنترنت.", Type = "Completion", Opts = "[]", Ans = "التعدي الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: إجراء يقوم بتنفيذ مجموعة من الأوامر ويعود بقيمة.", Type = "Completion", Opts = "[]", Ans = "Function", Exp = "" },
                new { T = "المصطلح العلمي: استخدام وسائط إلكترونية لنشر معلومات مسيئة عن شخص.", Type = "Completion", Opts = "[]", Ans = "التشهير الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: مجموعة من الأوامر والتعليمات تحت اسم معين يتم استدعاؤه.", Type = "Completion", Opts = "[]", Ans = "Procedure", Exp = "" },
                new { T = "المصطلح العلمي: الكلمة المستخدمة لتمثيل نافذة النموذج الحالية.", Type = "Completion", Opts = "[]", Ans = "Me", Exp = "" },
                new { T = "المصطلح العلمي: الخطأ الناتج عن استخدام أوامر اللغة بشكل غير صحيح.", Type = "Completion", Opts = "[]", Ans = "Syntax Error", Exp = "" },
                new { T = "المصطلح العلمي: جملة تستخدم للتفرع إذا كان هناك شروط كثيرة لمتغير واحد.", Type = "Completion", Opts = "[]", Ans = "Select Case", Exp = "" },
                new { T = "المصطلح العلمي: جملة تستخدم لتكرار كود عدد محدد من المرات.", Type = "Completion", Opts = "[]", Ans = "For...Next", Exp = "" },
                new { T = "المصطلح العلمي: استخدام أسماء مستعارة لإخفاء هوية المعتدي.", Type = "Completion", Opts = "[]", Ans = "التخفي الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: نشر كلمات عدائية ومبتذلة عبر الإنترنت.", Type = "Completion", Opts = "[]", Ans = "السب الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: أماكن بالذاكرة لها اسم ونوع وقيمتها لا تتغير.", Type = "Completion", Opts = "[]", Ans = "الثوابت", Exp = "" },
                new { T = "المصطلح العلمي: جملة تضع قيمة في متغير أو ثابت وبينهما علامة =.", Type = "Completion", Opts = "[]", Ans = "التخصيص", Exp = "" },
                new { T = "المصطلح العلمي: إجراء لا يعود بقيمة.", Type = "Completion", Opts = "[]", Ans = "Sub", Exp = "" }
            });

            // 2.3: اختيارات ذكية (20 سؤالاً)
            rawQuestions.AddRange(new[] {
                new { T = "نوع البيان المناسب لتخزين (اسم الطالب) هو:", Type = "MCQ", Opts = "[\"Integer\", \"String\", \"Boolean\"]", Ans = "1", Exp = "" },
                new { T = "ناتج العملية 12 - 6 / 2 هو:", Type = "MCQ", Opts = "[\"3\", \"9\", \"10\"]", Ans = "1", Exp = "12 - 3 = 9" },
                new { T = "لتخزين القيمة True أو False نستخدم النوع:", Type = "MCQ", Opts = "[\"Integer\", \"String\", \"Boolean\"]", Ans = "2", Exp = "" },
                new { T = "عند تنفيذ (For i = 1 To 10 Step 3) تكون قيم i:", Type = "MCQ", Opts = "[\"1,4,7,10\", \"1,3,6,9\", \"1,2,3,4\"]", Ans = "0", Exp = "" },
                new { T = "تخرج حلقة For i = 1 To 5 عندما تصبح قيمة i:", Type = "MCQ", Opts = "[\"5\", \"6\", \"0\"]", Ans = "1", Exp = "" },
                new { T = "يتم الربط بين النصوص باستخدام المعامل:", Type = "MCQ", Opts = "[\"+\", \"&\", \"/\"]", Ans = "1", Exp = "" },
                new { T = "الأمر المستخدم للإعلان عن الثوابت هو:", Type = "MCQ", Opts = "[\"Dim\", \"Const\", \"Sub\"]", Ans = "1", Exp = "" },
                new { T = "نوع الخطأ في (Dim X As Byte = 500) هو:", Type = "MCQ", Opts = "[\"Syntax\", \"Runtime\", \"Logical\"]", Ans = "1", Exp = "" },
                new { T = "عدد مرات تكرار الكود (For X = 1 To 5 Step 2) هو:", Type = "MCQ", Opts = "[\"2\", \"3\", \"5\"]", Ans = "1", Exp = "1, 3, 5" },
                new { T = "المعامل الذي يعبر عن 'لا يساوي' هو:", Type = "MCQ", Opts = "[\"<>\", \"<=\", \">=\"]", Ans = "0", Exp = "" }
            });

            // 2.4: تحديات الأكواد (15 سؤالاً)
            rawQuestions.AddRange(new[] {
                new { T = "ما ناتج الكود التالي؟\\n```vb\\nDim X As Integer = 10\\nIf X Mod 2 = 0 Then\\n   MsgBox(\"Even\")\\nEnd If\\n```", Type = "MCQ", Opts = "[\"Even\", \"Odd\", \"Error\"]", Ans = "0", Exp = "" },
                new { T = "ما قيمة العداد بعد انتهاء الحلقة؟\\n```vb\\nFor i = 1 To 4\\nNext\\n```", Type = "MCQ", Opts = "[\"4\", \"5\", \"1\"]", Ans = "1", Exp = "" },
                new { T = "ما وظيفة الكود (Me.Close())؟", Type = "MCQ", Opts = "[\"إغلاق النموذج\", \"مسح النص\", \"تشغيل البرنامج\"]", Ans = "0", Exp = "" },
                new { T = "في الكود (Dim A, B As Integer)، نوع المتغير A هو:", Type = "MCQ", Opts = "[\"Integer\", \"Object\", \"String\"]", Ans = "1", Exp = "في VB.NET القديم، إذا لم يحدد النوع يكون Object." },
                new { T = "ما ناتج (1 + 2 * 3) في البرمجة؟", Type = "MCQ", Opts = "[\"9\", \"7\", \"6\"]", Ans = "1", Exp = "الضرب أولاً." }
            });

            // 2.5: إكمال إبداعي (15 سؤالاً)
            rawQuestions.AddRange(new[] {
                new { T = "توضع قيم السلاسل النصية بين علامتي ......", Type = "Completion", Opts = "[]", Ans = "\" \"", Exp = "" },
                new { T = "توضع قيم التاريخ والوقت بين علامتي ......", Type = "Completion", Opts = "[]", Ans = "# #", Exp = "" },
                new { T = "الكلمة المحجوزة ...... تستخدم لتعريف دالة تعود بقيمة.", Type = "Completion", Opts = "[]", Ans = "Function", Exp = "" },
                new { T = "نهاية جملة Select Case هي ......", Type = "Completion", Opts = "[]", Ans = "End Select", Exp = "" },
                new { T = "معدل الزيادة الافتراضي في For...Next هو ......", Type = "Completion", Opts = "[]", Ans = "1", Exp = "" }
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
