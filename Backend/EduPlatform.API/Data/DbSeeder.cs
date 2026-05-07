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
            var existing = await context.InteractiveQuizzes.FirstOrDefaultAsync(q => q.Slug == "3rd-prep-cs-final-revision");
            if (existing != null)
            {
                context.InteractiveQuizzes.Remove(existing);
                await context.SaveChangesAsync();
            }

            var quiz = new InteractiveQuiz
            {
                Title = "مراجعة الحاسب الآلي - الصف الثالث الإعدادي",
                Slug = "3rd-prep-cs-final-revision",
                Description = "مراجعة شاملة ليلة الامتحان تغطي كافة أجزاء المنهج (Visual Basic.NET & Cyber Safety)",
                Subject = "حاسب آلي",
                Grade = "الصف الثالث الإعدادي",
                Theme = "CyberTech",
                IsPublic = true,
                CreatedAt = System.DateTime.UtcNow,
                Questions = new List<InteractiveQuestion>()
            };

            var rawQuestions = new[]
            {
                new { T = "الخطأ الذي يظهر أثناء تشغيل أو تنفيذ برنامج VB.NET يُطلق عليه Syntax Error.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "الخطأ أثناء التشغيل يسمى Runtime Error." },
                new { T = "الأمر Rem يستخدم لكتابة ملاحظات داخل الكود ولا يتم ترجمتها.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "جملة التكرار For...Next تستخدم لتكرار كود عدد محدد من المرات.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "الأمر Const يستخدم للإعلان عن الثوابت في VB.NET.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "إذا كانت قيمة المتغير أو الثابت تاريخ أو وقت توضع بين علامتي ##.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "Me يُعبّر عن نافذة النموذج الحالية (Form).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "المتغيرات في لغة VB.NET مخازن بذاكرة الكمبيوتر لها اسم ونوع وقيمتها تتغير أثناء سير البرنامج.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "المضايقة الإلكترونية عبارة عن رسائل عدائية موجهة ضد شخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "التهديد الإلكتروني عبارة عن إرسال رسائل إلكترونية تحمل تهديد أو وعيد لشخص أو أكثر.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "Select Case تستخدم عندما يكون التفرع معتمداً على قيمة متغير واحد وهناك شروط كثيرة.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "التخفي الإلكتروني هو استخدام أسماء مستعارة لإخفاء هوية المتعدي الإلكتروني.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "true", Exp = "" },
                new { T = "جميع أنواع البيانات التي يتم حفظها في الذاكرة تشغل نفس المساحة التخزينية.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "كل نوع بيان له مساحة تخزينية مختلفة." },
                new { T = "55City يعتبر اسم متغير صحيح في VB.NET.", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "لا يجب أن يبدأ برقم." },
                new { T = "الإعلان عن دالة (Function) يبدأ بـ (Sub) وينتهي بـ (End Sub).", Type = "TrueFalse", Opts = "[\"صح\", \"خطأ\"]", Ans = "false", Exp = "الدالة تبدأ بـ Function." },

                new { T = "الصيغة الصحيحة للإعلان عن متغير اسمه City يخزن اسم المدينة:", Type = "MCQ", Opts = "[\"Dim City As Integer\", \"Dim City As String\", \"Dim City As Byte\"]", Ans = "1", Exp = "String للنصوص." },
                new { T = "الكلمة المحجوزة التي تُستخدم لإنشاء سطر جديد في VB.NET:", Type = "MCQ", Opts = "[\"Me\", \"Rem\", \"vbCrLf\"]", Ans = "2", Exp = "" },
                new { T = "نوع البيان الذي له الحد الأدنى (0) والحد الأقصى (255):", Type = "MCQ", Opts = "[\"Integer\", \"Byte\", \"Long\"]", Ans = "1", Exp = "" },
                new { T = "الأمر الذي يُستخدم للإعلان عن المتغيرات في لغة VB.NET:", Type = "MCQ", Opts = "[\"Const\", \"Dim\", \"Rem\"]", Ans = "1", Exp = "" },
                new { T = "يتم تشغيل برنامج VB.NET بالضغط على مفتاح:", Type = "MCQ", Opts = "[\"F4\", \"F5\", \"F7\"]", Ans = "1", Exp = "" },
                new { T = "الخطأ الذي يظهر بسبب صياغة تعبيرات حسابية أو منطقية بصورة خاطئة يسمى:", Type = "MCQ", Opts = "[\"Syntax Error\", \"Logical Error\", \"Runtime Error\"]", Ans = "1", Exp = "" },
                new { T = "عند تنفيذ الكود:\\n<div dir=\"ltr\" class=\"bg-black/20 p-2 rounded-lg my-2\">If X=50 Then MsgBox(\"ناجح\")</div>\\nوكانت قيمة X=50 فإن:", Type = "MCQ", Opts = "[\"يظهر صندوق رسالة ناجح\", \"يظهر صندوق رسالة راسب\", \"يتوقف البرنامج\"]", Ans = "0", Exp = "" },
                new { T = "أحد أشكال التعدي الإلكتروني هو:", Type = "MCQ", Opts = "[\"الاستثناء الإلكتروني\", \"التشهير الإلكتروني\", \"التخفي الإلكتروني\"]", Ans = "2", Exp = "" },
                new { T = "الناتج النهائي للمعادلة:\\nY = 12-(2+4)/2", Type = "MCQ", Opts = "[\"Y = 3\", \"Y = 7\", \"Y = 9\"]", Ans = "2", Exp = "9" },
                new { T = "معامل المقارنة الذي يعبر عن \"أقل من أو يساوي\":", Type = "MCQ", Opts = "[\"<>\", \">=\", \"<=\"]", Ans = "2", Exp = "" },
                new { T = "جملة التكرار المناسبة لتكرار كود لعدد محدد من المرات:", Type = "MCQ", Opts = "[\"For...Next\", \"Do While...Loop\", \"If...Then\"]", Ans = "0", Exp = "" },
                new { T = "قيمة أسماء المواد الدراسية تُصنّف كـ:", Type = "MCQ", Opts = "[\"رقمية صحيحة\", \"رقمية غير صحيحة\", \"متنوعة (String)\"]", Ans = "2", Exp = "" },

                new { T = "...... أماكن محجوزة في ذاكرة الكمبيوتر لها اسم ونوع وقيمتها تتغير أثناء البرنامج.", Type = "Completion", Opts = null, Ans = "المتغيرات", Exp = "" },
                new { T = "يُستخدم الأمر ...... للإعلان عن الثوابت في لغة VB.NET.", Type = "Completion", Opts = null, Ans = "Const", Exp = "" },
                new { T = "جملة ...... تستخدم لتكرار كود معين لعدد محدد من المرات.", Type = "Completion", Opts = null, Ans = "For...Next", Exp = "" },
                new { T = "الثوابت في VB.NET مخازن في ذاكرة الكمبيوتر لها اسم وقيمة ثابتة ...... أثناء سير البرنامج.", Type = "Completion", Opts = null, Ans = "لا تتغير", Exp = "" },
                new { T = "...... عبارة عن سلوك عدواني متعمد من شخص لآخر عبر وسائل الاتصال الإلكترونية.", Type = "Completion", Opts = null, Ans = "التعدي الإلكتروني", Exp = "" },
                new { T = "عبارة عن نشر كلمات عدائية ومبتذلة من شخص معين عبر وسائل الاتصال الإلكترونية ......", Type = "Completion", Opts = null, Ans = "السب الإلكتروني", Exp = "" },
                new { T = "جملة التخصيص (Assignment) هي جملة تضع قيمة في متغير أو ثابت وبينهما علامة ......", Type = "Completion", Opts = null, Ans = "=", Exp = "" },
                new { T = "...... يستخدمه المبرمج لكتابة ملاحظات داخل الكود ولا يتم ترجمتها.", Type = "Completion", Opts = null, Ans = "Rem", Exp = "" },
                new { T = "الكلمة المحجوزة ...... تستخدم في إنشاء سطر جديد داخل صندوق النص.", Type = "Completion", Opts = null, Ans = "vbCrLf", Exp = "" },
                new { T = "...... يُعبّر عن نافذة النموذج الحالية في VB.NET.", Type = "Completion", Opts = null, Ans = "Me", Exp = "" },
                new { T = "إذا كانت قيمة الثابت تاريخاً أو وقتاً فإنها توضع بين علامتي ......", Type = "Completion", Opts = null, Ans = "# #", Exp = "" },
                new { T = "...... جملة تستخدم لتكرار كود معين لعدد من المرات غير معروف نهايته مسبقاً بناءً على شرط معين.", Type = "Completion", Opts = null, Ans = "Do While...Loop", Exp = "" },

                new { T = "اقرأ الكود التالي:\\n```vb\\nFor i = 1 To 5\\n    MsgBox(i)\\nNext\\n```\\nاسم المتغير المستخدم في الحلقة التكرارية هو:", Type = "MCQ", Opts = "[\"i\", \"MsgBox\", \"Next\"]", Ans = "0", Exp = "" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor i = 1 To 5\\n    MsgBox(i)\\nNext\\n```\\nعدد مرات تكرار الكود هي:", Type = "MCQ", Opts = "[\"1\", \"4\", \"5\"]", Ans = "2", Exp = "5" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor M = 1 To 3\\n    MsgBox(M)\\nNext\\n```\\nالكود الذي يتم تكراره هو:", Type = "MCQ", Opts = "[\"For M = 1\", \"MsgBox(M)\", \"Next\"]", Ans = "1", Exp = "" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nIf X >= 50 Then\\n    MsgBox(\"ناجح\")\\nElse\\n    MsgBox(\"راسب\")\\nEnd If\\n```\\nالتعبير الشرطي في جملة If هو:", Type = "MCQ", Opts = "[\"If X >= 50\", \"X >= 50\", \"MsgBox\"]", Ans = "1", Exp = "" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nFor X = 4 To 12 Step 2\\n    MsgBox(X)\\nNext\\n```\\nقيمة الزيادة (Step) في الحلقة هي:", Type = "MCQ", Opts = "[\"4\", \"12\", \"2\"]", Ans = "2", Exp = "" },
                new { T = "اقرأ الكود التالي:\\n```vb\\nIf N Mod 2 = 0 Then\\n    MsgBox(\"الرقم زوجي\")\\nElse\\n    MsgBox(\"الرقم فردي\")\\nEnd If\\n```\\nما وظيفة المعامل Mod في الكود؟", Type = "MCQ", Opts = "[\"القسمة\", \"باقي القسمة\", \"الضرب\"]", Ans = "1", Exp = "" }
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
