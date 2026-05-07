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
                Title = "الموسوعة الذهبية للحاسب الآلي - 3 إعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "أضخم مراجعة تفاعلية تضم كافة أسئلة امتحانات الـ 30 محافظة (الفائز 2026) - من الألف إلى الياء",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new List<dynamic>();

            // --- الفئة 1: الأسئلة الذهبية (المحتوى السابق بالكامل) ---
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
                new { T = "جملة التخصيص عبارة عن طرفين بينهما علامة (+).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Golden" },
                new { T = "الخطأ الذي يظهر أثناء تشغيل أو تنفيذ البرنامج يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Golden" },
                new { T = "الإجراء Procedure هو مجموعة من الأوامر تحت اسم معين يتم استدعاؤه لتنفيذها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Golden" },
                new { T = "الجملة (Const x As Single) بها خطأ لأنها لم يتم تخصيص قيمة لها.", Type = "MCQ", Opts = "[\"صح\", \"خطأ\"]", Ans = "0", Exp = "Golden" },
                new { T = "معدل الزيادة في For...Next يجب أن يكون سالباً إذا كانت البداية أكبر من النهاية.", Type = "MCQ", Opts = "[\"صح\", \"خطأ\"]", Ans = "0", Exp = "Golden" },
                new { T = "يستخدم الكود (Me.Textbox1.Text=\"\") في مسح محتويات صندوق النص.", Type = "MCQ", Opts = "[\"صح\", \"خطأ\"]", Ans = "0", Exp = "Golden" },
                new { T = "أحد أشكال التعدي الإلكتروني هو استخدام أسماء مستعارة لإخفاء الهوية.", Type = "MCQ", Opts = "[\"التشهير الإلكتروني\", \"التخفي الإلكتروني\", \"المضايقة الإلكترونية\"]", Ans = "1", Exp = "Golden" },
                new { T = "أول عملية يتم تنفيذها في التعبيرات الحسابية هي ما بداخل الأقواس.", Type = "MCQ", Opts = "[\"صح\", \"خطأ\"]", Ans = "0", Exp = "Golden" },
                new { T = "عند تنفيذ (For i = 1 to 10 Step 2) فإن قيم i هي الأعداد الفردية.", Type = "MCQ", Opts = "[\"صح\", \"خطأ\"]", Ans = "0", Exp = "Golden" },
                new { T = "يُستخدم الأمر Dim للإعلان عن المتغيرات في لغة VB.NET.", Type = "Completion", Opts = "[]", Ans = "Dim", Exp = "Golden" },
                new { T = "الثوابت هي أماكن محجوزة في الذاكرة قيمتها ثابتة أثناء تشغيل البرنامج.", Type = "Completion", Opts = "[]", Ans = "ثابتة", Exp = "Golden" },
                new { T = "باقي قسمة 10 على 3 هو 1 باستخدام المعامل Mod.", Type = "Completion", Opts = "[]", Ans = "1", Exp = "Golden" },
                new { T = "إذا كانت البداية 1 والنهاية 5 والزيادة 1، تنتهي الحلقة عندما يصبح العداد 6.", Type = "Completion", Opts = "[]", Ans = "6", Exp = "Golden" },
                new { T = "توضع القيم النصية بين علامتي \" \" عند تخصيصها للمتغيرات.", Type = "Completion", Opts = "[]", Ans = "\" \"", Exp = "Golden" }
            });

            // --- الفئة 2: بنك الأسئلة العام (مستخرج من 30 محافظة) ---
            
            // 2.1: صح وخطأ (إضافي)
            rawQuestions.AddRange(new[] {
                new { T = "يمكن أن يبدأ اسم المتغير أو الثابت برقم.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يجب أن يبدأ بحرف أو شرطة سفلية." },
                new { T = "تصنف قيم مجموع درجات الطالب ضمن البيانات الرقمية الصحيحة (Integer).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "قد يحتوي المجموع على كسور، لذا يفضل Single." },
                new { T = "الكلمة المحجوزة Step في جملة For...Next تعبر عن معدل الزيادة أو النقصان.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يجب إنهاء جملة If...Then بـ End If إذا كتبت في أكثر من سطر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "الوسائط Parameters تستخدم لاستقبال قيم من خارج الإجراء عند استدعائه.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" }
            });

            // 2.2: المصطلح العلمي (Scientific Term) - مبرمجة كإكمال
            rawQuestions.AddRange(new[] {
                new { T = "المصطلح العلمي: أماكن محجوزة بذاكرة الكمبيوتر تتغير قيمتها أثناء سير البرنامج.", Type = "Completion", Opts = "[]", Ans = "المتغيرات", Exp = "" },
                new { T = "المصطلح العلمي: جملة تستخدم لتكرار كود معين لعدد محدد من المرات مسبقاً.", Type = "Completion", Opts = "[]", Ans = "For...Next", Exp = "" },
                new { T = "المصطلح العلمي: أخطاء تظهر عند تشغيل البرنامج وتؤدي لتوقفه.", Type = "Completion", Opts = "[]", Ans = "Runtime Error", Exp = "" },
                new { T = "المصطلح العلمي: السلوك العدواني المتعمد من شخص لآخر عبر الوسائط الإلكترونية.", Type = "Completion", Opts = "[]", Ans = "التعدي الإلكتروني", Exp = "" },
                new { T = "المصطلح العلمي: نشر كلمات عدائية ومبتذلة ضد شخص ما عبر الوسائط الإلكترونية.", Type = "Completion", Opts = "[]", Ans = "السب الإلكتروني", Exp = "Flaming" }
            });

            // 2.3: اختيارات (إضافي)
            rawQuestions.AddRange(new[] {
                new { T = "ناتج العملية الحسابية التالي هو: 12 - (2 + 4) / 2", Type = "MCQ", Opts = "[\"3\", \"9\", \"6\"]", Ans = "1", Exp = "12 - 6/2 = 12 - 3 = 9" },
                new { T = "نوع البيان المناسب لتخزين (حالة الطالب: ناجح أو راسب) هو:", Type = "MCQ", Opts = "[\"String\", \"Boolean\", \"Integer\"]", Ans = "1", Exp = "Boolean للقيم المنطقية." },
                new { T = "معامل المقارنة الذي يعبر عن 'أكبر من أو يساوي' هو:", Type = "MCQ", Opts = "[\"<\", \">=\", \"<>\"]", Ans = "1", Exp = "" },
                new { T = "تستخدم جملة ...... عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.", Type = "MCQ", Opts = "[\"If...Then\", \"Select Case\", \"For...Next\"]", Ans = "1", Exp = "" }
            });

            // 2.4: أكواد (إضافي)
            rawQuestions.AddRange(new[] {
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor i = 10 To 1 Step -2\\n   MsgBox(i)\\nNext\\n```\\nما هي أول قيمة تظهر في صندوق الرسائل؟", Type = "MCQ", Opts = "[\"10\", \"1\", \"-2\"]", Ans = "0", Exp = "البداية من 10." },
                new { T = "في الكود السابق (For i = 10 To 1 Step -2)، ما هي آخر قيمة سيأخذها العداد؟", Type = "MCQ", Opts = "[\"1\", \"2\", \"0\"]", Ans = "1", Exp = "لأن 2 هي آخر قيمة ضمن النطاق قبل أن يقل العداد عن 1." }
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
