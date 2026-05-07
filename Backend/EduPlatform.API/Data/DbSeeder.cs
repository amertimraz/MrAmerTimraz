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
                Title = "مراجعة الحاسب الآلي الشاملة - الصف الثالث الإعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "مراجعة ليلة الامتحان المستوحاة من امتحانات المحافظات (الفائز) - تغطي كافة أجزاء المنهج",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new[]
            {
                // --- Section 1: True/False (Cairo & Alexandria Exams) ---
                new { T = "مدى القيم لنوع البيانات (Byte) يبدأ بـ 0 وينتهي بـ 255.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "Byte: 0 to 255" },
                new { T = "في لغة VB.NET للتعبير عن التفرع برمجياً نستخدم جملة If...Then فقط.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يوجد أيضاً Select Case." },
                new { T = "من قواعد الاستخدام الآمن للإنترنت وضع كلمة مرور سهلة لبريدك الإلكتروني حتى تستطيع تذكرها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يجب أن تكون كلمة المرور قوية ومعقدة." },
                new { T = "المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "تعتبر جملة الإعلان التالية جملة صحيحة: Dim single as integer", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "Single كلمة محجوزة (Reserved Word)." },
                new { T = "المعامل المنطقي <> يعبر عن أكبر من أو يساوي.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "<> تعني 'لا يساوي'." },
                new { T = "جملة التخصيص عبارة عن طرفين بينهما علامة (+).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "بينهما علامة يساوي (=)." },
                new { T = "الدالة Mod تعود بباقي القسمة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "Name** هو اسم متغير صحيح في VB.NET.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "لا يجب أن يحتوي اسم المتغير على رموز خاصة." },
                new { T = "الأخطاء اللغوية (Syntax Errors) هي أخطاء في الصيغة العامة لأوامر اللغة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "الخطأ الذي يظهر أثناء تشغيل أو تنفيذ البرنامج يسمى Logical Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "يسمى Runtime Error." },
                new { T = "الإجراء Procedure هو مجموعة من الأوامر تحت اسم معين يتم استدعاؤه لتنفيذها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "يستخدم الرمز & للربط بين النصوص في لغة VB.NET.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },

                // --- Section 2: MCQ (Cairo & Alexandria & Beheira) ---
                new { T = "الجملة (Const x As Single) بها خطأ لأنها:", Type = "MCQ", Opts = "[\"لم يتم تخصيص قيمة\", \"اسم المتغير خطأ\", \"نوع البيان غير صحيح\"]", Ans = "0", Exp = "الثابت Const يجب تخصيص قيمة له عند الإعلان." },
                new { T = "معدل الزيادة في For...Next يجب أن يكون سالباً إذا كانت:", Type = "MCQ", Opts = "[\"البداية أكبر من النهاية\", \"البداية أصغر من النهاية\", \"البداية تساوي النهاية\"]", Ans = "0", Exp = "للعد التنازلي." },
                new { T = "يستخدم الكود (Me.Textbox1.Text=\"\") في:", Type = "MCQ", Opts = "[\"نسخ المحتوى\", \"طباعة المحتوى\", \"مسح المحتوى\"]", Ans = "2", Exp = "" },
                new { T = "أحد أشكال التعدي الإلكتروني هو استخدام أسماء مستعارة لإخفاء الهوية ويسمى:", Type = "MCQ", Opts = "[\"التشهير الإلكتروني\", \"التخفي الإلكتروني\", \"المضايقة الإلكترونية\"]", Ans = "1", Exp = "" },
                new { T = "معامل المقارنة الذي يعبر عن 'لا يساوي' هو:", Type = "MCQ", Opts = "[\"<>\", \"<=\", \">=\"]", Ans = "0", Exp = "" },
                new { T = "الكلمة المستخدمة لإنهاء جملة If هي:", Type = "MCQ", Opts = "[\"End If\", \"End Sub\", \"Next\"]", Ans = "0", Exp = "" },
                new { T = "الأمر المستخدم للإعلان عن الثوابت هو:", Type = "MCQ", Opts = "[\"Dim\", \"Const\", \"Sub\"]", Ans = "1", Exp = "" },
                new { T = "أول عملية يتم تنفيذها في التعبيرات الحسابية هي:", Type = "MCQ", Opts = "[\"الضرب\", \"الأسس\", \"ما بداخل الأقواس\"]", Ans = "2", Exp = "الأقواس أولاً." },
                new { T = "نوع البيان المناسب لتخزين (اسم الطالب) هو:", Type = "MCQ", Opts = "[\"Integer\", \"String\", \"Boolean\"]", Ans = "1", Exp = "" },
                new { T = "عند تنفيذ (For i = 1 to 10 Step 2) فإن قيم i تكون:", Type = "MCQ", Opts = "[\"1,3,5,7,9\", \"2,4,6,8,10\", \"1,2,3,4,5\"]", Ans = "0", Exp = "البدء بـ 1 وزيادة 2." },

                // --- Section 3: Code Comprehension (Analysis) ---
                new { T = "اقرأ الكود التالي:\\n```vb\\nDim i As Single\\nIf i >= 50 Then\\n   MsgBox(\"ناجح\")\\nElse\\n   MsgBox(\"راسب\")\\nEnd If\\n```\\nإذا كانت قيمة i = 30، ماذا سيظهر؟", Type = "MCQ", Opts = "[\"ناجح\", \"راسب\", \"خطأ برمجى\"]", Ans = "1", Exp = "30 أقل من 50." },
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor x = 4 To 12 Step 2\\n    MsgBox(x)\\nNext\\n```\\nما هي قيمة x عند أول تكرار؟", Type = "MCQ", Opts = "[\"2\", \"4\", \"12\"]", Ans = "1", Exp = "تبدأ من 4." },
                new { T = "في الكود السابق (For x = 4 To 12 Step 2)، كم مرة سيظهر صندوق الرسائل؟", Type = "MCQ", Opts = "[\"4 مرات\", \"5 مرات\", \"9 مرات\"]", Ans = "1", Exp = "4, 6, 8, 10, 12 (5 مرات)" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nIf X Mod 2 = 0 Then\\n   MsgBox(\"زوجي\")\\nEnd If\\n```\\nماذا تعني كلمة Mod؟", Type = "MCQ", Opts = "[\"ناتج القسمة\", \"باقي القسمة\", \"تقريب الرقم\"]", Ans = "1", Exp = "" },

                // --- Section 4: Completion (Interactive Input) ---
                new { T = "يُستخدم الأمر ...... للإعلان عن المتغيرات في لغة VB.NET.", Type = "Completion", Opts = "[]", Ans = "Dim", Exp = "" },
                new { T = "...... تعبر عن نافذة النموذج الحالية (Current Form).", Type = "Completion", Opts = "[]", Ans = "Me", Exp = "" },
                new { T = "الثوابت هي أماكن محجوزة في الذاكرة قيمتها ...... أثناء تشغيل البرنامج.", Type = "Completion", Opts = "[]", Ans = "ثابتة", Exp = "أو 'لا تتغير'" },
                new { T = "باقي قسمة 10 على 3 هو ...... باستخدام المعامل Mod.", Type = "Completion", Opts = "[]", Ans = "1", Exp = "10 / 3 = 3 وباقي 1." },
                new { T = "الكلمة المحجوزة ...... تستخدم لإنشاء سطر جديد.", Type = "Completion", Opts = "[]", Ans = "vbCrLf", Exp = "" },
                new { T = "إذا كانت قيمة البداية 1 والنهاية 5 والزيادة 1، فإن الحلقة تنتهي عندما تصبح قيمة العداد ......", Type = "Completion", Opts = "[]", Ans = "6", Exp = "تخرج الحلقة عندما يتعدى العداد القيمة النهائية." },
                new { T = "...... هو استخدام وسائط إلكترونية للتحرش أو التهديد.", Type = "Completion", Opts = "[]", Ans = "التعدي الإلكتروني", Exp = "" },
                new { T = "توضع القيم النصية بين علامتي ...... عند تخصيصها للمتغيرات.", Type = "Completion", Opts = "[]", Ans = "\" \"", Exp = "Double Quotes" }
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
