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
            if (!context.InteractiveQuizzes.Any())
            {
                await SeedInteractiveQuizzesAsync(context);
            }
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
                Title = "المراجعة النهائية الذهبية - حاسب آلي - 3 إعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "الأسئلة الأكثر تكراراً في امتحانات المحافظات (القاهرة، الإسكندرية، البحيرة، وغيرها) - نظام الفائز 2026",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new[]
            {
                // --- القسم الأول: الأسئلة الذهبية (الأكثر تكراراً بنسبة 100%) ---
                new { T = "مدى القيم لنوع البيانات (Byte) يبدأ بـ 0 وينتهي بـ 255.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "هذا السؤال تكرر في أكثر من 15 محافظة." },
                new { T = "الأخطاء اللغوية (Syntax Errors) هي أخطاء في الصيغة العامة لأوامر اللغة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "تظهر أثناء الكتابة (Design Time)." },
                new { T = "الخطأ الذي يظهر عند كتابة معادلة حسابية بطريقة تؤدي لناتج خطأ يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "مثل حساب مساحة دائرة بجمع نصف القطر بدلاً من ضربه." },
                new { T = "الكلمة المحجوزة التي تُستخدم لإنشاء سطر جديد هي vbCrLf.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "سؤال ثابت في امتحانات القليوبية والمنوفية." },
                new { T = "المصطلح (Me) يُعبّر عن نافذة النموذج الحالية (Current Form).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "يستخدم للوصول لخصائص النموذج البرمجية." },
                new { T = "يستخدم الرمز (&) للربط بين السلاسل النصية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Concatenation Operator" },
                new { T = "التخفي الإلكتروني هو استخدام أسماء مستعارة لإخفاء هوية المتعدي.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "أحد أهم دروس الأمان الرقمي." },
                new { T = "يستخدم المعامل (Mod) للحصول على باقي القسمة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "مثل 10 Mod 3 = 1" },

                // --- القسم الثاني: أسئلة الصواب والخطأ (امتحانات المحافظات) ---
                new { T = "في لغة VB.NET للتعبير عن التفرع برمجياً نستخدم جملة If...Then فقط.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يوجد أيضاً Select Case." },
                new { T = "المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "تعتبر جملة الإعلان التالية جملة صحيحة: Dim single as integer", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Single كلمة محجوزة." },
                new { T = "جملة التخصيص عبارة عن طرفين بينهما علامة (+).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "بينهما علامة يساوي (=)." },
                new { T = "الخطأ الذي يظهر أثناء تشغيل أو تنفيذ البرنامج يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يسمى Runtime Error." },
                new { T = "الإجراء Procedure هو مجموعة من الأوامر تحت اسم معين يتم استدعاؤه لتنفيذها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },

                // --- القسم الثالث: أسئلة الاختيار من متعدد (الفنيات) ---
                new { T = "الجملة (Const x As Single) بها خطأ لأنها:", Type = "MCQ", Opts = "[\"لم يتم تخصيص قيمة\", \"اسم المتغير خطأ\", \"نوع البيان غير صحيح\"]", Ans = "0", Exp = "الثابت يجب إعطاؤه قيمة فوراً." },
                new { T = "معدل الزيادة في For...Next يجب أن يكون سالباً إذا كانت:", Type = "MCQ", Opts = "[\"البداية أكبر من النهاية\", \"البداية أصغر من النهاية\", \"البداية تساوي النهاية\"]", Ans = "0", Exp = "للعد التنازلي." },
                new { T = "أحد أشكال التعدي الإلكتروني هو استخدام وسائط إلكترونية لنشر معلومات مسيئة عن شخص:", Type = "MCQ", Opts = "[\"التشهير الإلكتروني\", \"التخفي الإلكتروني\", \"المضايقة الإلكترونية\"]", Ans = "0", Exp = "التشهير هو نشر الأكاذيب." },
                new { T = "أول عملية يتم تنفيذها في التعبيرات الحسابية هي:", Type = "MCQ", Opts = "[\"الضرب\", \"الأسس\", \"ما بداخل الأقواس\"]", Ans = "2", Exp = "الأقواس تسبق كل شيء." },
                new { T = "عند تنفيذ (For i = 1 to 10 Step 2) فإن قيم i تكون:", Type = "MCQ", Opts = "[\"1,3,5,7,9\", \"2,4,6,8,10\", \"1,2,3,4,5\"]", Ans = "0", Exp = "" },

                // --- القسم الرابع: قراءة وفهم الأكواد (المستوى المهاري) ---
                new { T = "اقرأ الكود التالي:\\n```vb\\nDim i As Single\\nIf i >= 50 Then\\n   MsgBox(\"ناجح\")\\nElse\\n   MsgBox(\"راسب\")\\nEnd If\\n```\\nإذا كانت قيمة i = 30، ماذا سيظهر؟", Type = "MCQ", Opts = "[\"ناجح\", \"راسب\", \"خطأ برمجى\"]", Ans = "1", Exp = "" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor x = 4 To 12 Step 2\\n    MsgBox(x)\\nNext\\n```\\nكم مرة سيظهر صندوق الرسائل؟", Type = "MCQ", Opts = "[\"4 مرات\", \"5 مرات\", \"9 مرات\"]", Ans = "1", Exp = "4, 6, 8, 10, 12" },

                // --- القسم الخامس: أسئلة الإكمال التفاعلية ---
                new { T = "يُستخدم الأمر ...... للإعلان عن المتغيرات في لغة VB.NET.", Type = "Completion", Opts = "[]", Ans = "Dim", Exp = "" },
                new { T = "الثوابت هي أماكن محجوزة في الذاكرة قيمتها ...... أثناء تشغيل البرنامج.", Type = "Completion", Opts = "[]", Ans = "ثابتة", Exp = "أو 'لا تتغير'" },
                new { T = "باقي قسمة 10 على 3 هو ...... باستخدام المعامل Mod.", Type = "Completion", Opts = "[]", Ans = "1", Exp = "" },
                new { T = "إذا كانت قيمة البداية 1 والنهاية 5 والزيادة 1، فإن الحلقة تنتهي عندما تصبح قيمة العداد ......", Type = "Completion", Opts = "[]", Ans = "6", Exp = "القيمة التي تخرج الحلقة." },
                new { T = "توضع القيم النصية بين علامتي ...... عند تخصيصها للمتغيرات.", Type = "Completion", Opts = "[]", Ans = "\" \"", Exp = "" }
            };

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
