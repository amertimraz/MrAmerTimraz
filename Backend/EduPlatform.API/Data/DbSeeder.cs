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
            // Seed Tofas Test if the specific one is missing
            if (!context.TofasTests.Any(t => t.Slug == "tofas-test-1"))
            {
                var test = new TofasTest
                {
                    Title = "إختبار Tofas التجريبي",
                    Slug = "tofas-test-1",
                    Description = "اختبار مهارات البرمجة والمنطق البرمجي من خلال تحليل الأكواد واستنتاج المخرجات الصحيحة.",
                    Price = 0,
                    IsVisible = true,
                    TimeLimitMinutes = 15,
                    Questions = new List<Challenge>
                    {
                        new Challenge
                        {
                            Title = "تحدي المتغيرات والعمليات الحسابية",
                            Slug = "coding-challenge-1",
                            Description = "حلل الكود التالي واختر الإجابة التي تعطي المخرج المطلوب (50).",
                            TargetOutput = "50",
                            OrderIndex = 0,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet
                                {
                                    Code = "let num1 = 5;\nlet num2 = 10;\nnum1 = num2 * num1;\nconsole.log(num1);",
                                    AnalysisType = "Correct",
                                    AnalysisMessage = "إجابة صحيحة! قمت بضرب 10 في 5 وحصلت على 50 مع تسمية متغيرات سليمة.",
                                    OrderIndex = 0
                                },
                                new ChallengeSnippet
                                {
                                    Code = "let 1num = 5;\nlet 2num = 10;\n1num = 2num * 1num;\nconsole.log(1num);",
                                    AnalysisType = "Syntax",
                                    AnalysisMessage = "خطأ قواعدي! أسماء المتغيرات لا يمكن أن تبدأ بأرقام في JavaScript.",
                                    OrderIndex = 1
                                },
                                new ChallengeSnippet
                                {
                                    Code = "let num1 = 5;\nlet num2 = 10;\nnum1 = num2 / num1;\nconsole.log(num1);",
                                    AnalysisType = "Logic",
                                    AnalysisMessage = "خطأ منطقي! لقد استخدمت علامة القسمة (/) بدلاً من الضرب (*). المخرج سيكون 2 وليس 50.",
                                    OrderIndex = 2
                                }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي الموسم (أزهار الكرز)",
                            Slug = "challenge-2",
                            Description = "حدد البرنامج الذي يقوم بإخراج النص المطلوب حول موسم أزهار الكرز.",
                            TargetOutput = "إنه الموسم الذي تزدهر فيه أزهار الكرز.",
                            OrderIndex = 1,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let \"الربيع\" = season;\nif (season == \"الربيع\") {\n  console.log(\"إنه الموسم الذي تزدهر فيه أزهار الكرز.\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ! لا يمكن جعل النص اسماً للمتغير. الترتيب الصحيح هو اسم المتغير = القيمة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let season = \"الربيع\";\nlet (season == \"الربيع\") {\n  console.log(\"إنه الموسم الذي تزدهر فيه أزهار الكرز.\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ! استخدمت let بدلاً من if لبدء الشرط." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let season = \"الربيع\";\nif (season == \"الربيع\") {\n  console.log(\"إنه الموسم الذي تزدهر فيه أزهار الكرز.\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! هذا الكود سليم منطقياً وبرمجياً." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let season = \"الربيع\";\nif (season = \"الربيع\") {\n  console.log(\"إنه الموسم الذي تزدهر فيه أزهار الكرز.\");\n}", AnalysisType = "Logic", AnalysisMessage = "فخ! استخدمت علامة مساواة واحدة (=) وهي للتخصيص، بينما المقارنة تتطلب (==)." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي المقاعد الكافية",
                            Slug = "challenge-3",
                            Description = "حدد البرنامج الذي سيخرج رسالة 'ليس هناك مقاعد كافية.' بناءً على العمليات الحسابية.",
                            TargetOutput = "ليس هناك مقاعد كافية.",
                            OrderIndex = 2,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let seatNum = 50;\nlet peopleNum = 40;\npeopleNum < peopleNum + 15;\nelse (seatNum < peopleNum) {\n  console.log(\"ليس هناك مقاعد كافية.\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ! لا يمكن استخدام else بدون if، كما أن else لا تأخذ شرطاً مباشراً هكذا." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let seatNum = 50;\nlet peopleNum = 40;\npeopleNum = peopleNum + 15;\nif (seatNum < peopleNum) {\n  console.log(\"ليس هناك مقاعد كافية.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! 40+15=55، وبما أن 50 أقل من 55، سيتحقق الشرط." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let seatNum = 50;\nlet peopleNum = 40;\nif (seatNum > peopleNum) {\n  console.log(\"ليس هناك مقاعد كافية.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! إذا كان عدد المقاعد أكبر من الناس، فالمقاعد كافية ولن تظهر الرسالة." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let seatNum = 50;\nlet peopleNum = 40;\nif (seatNum < peopleNum) {\n  console.log(\"ليس هناك مقاعد كافية.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ في المنطق! حالياً 50 ليست أصغر من 40، فلن يخرج أي شيء." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مساحة التخزين",
                            Slug = "challenge-4",
                            Description = "حدد الكود الذي يكتشف عدم وجود مساحة كافية لحفظ الفيديو.",
                            TargetOutput = "لا يمكن حفظ الفيديو بسبب عدم وجود مساحة تخزين كافية.",
                            OrderIndex = 3,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let videoSize = 25;\nlet freeCapacity = 20;\nif ((freeCapacity - videoSize) > 5) {\n  console.log(\"لا يزال بإمكانك حفظ الفيديو...\");\n} else if ((freeCapacity - videoSize) < 0) {\n  console.log(\"لا يمكن حفظ الفيديو بسبب عدم وجود مساحة تخزين كافية.\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! 20 - 25 = -5، وهي أقل من 0، لذا سيتحقق الشرط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let videoSize = 25;\nlet freeCapacity = 20;\nif ((freeCapacity + videoSize) < 0) {\n  console.log(\"لا يمكن حفظ الفيديو بسبب عدم وجود مساحة تخزين كافية.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! جمع المساحتين لن يخبرنا إذا كانت المساحة الفارغة تكفي." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let videoSize = 25;\nlet freeCapacity = 20;\nif (freeCapacity > videoSize) {\n  console.log(\"لا يمكن حفظ الفيديو بسبب عدم وجود مساحة تخزين كافية.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! إذا كانت المساحة الحرة أكبر من الفيديو، فإنه سيكفي." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let videoSize = 25;\nlet freeCapacity = 20;\nif (freeCapacity < videoSize) {\n  console.log(\"المساحة كافية.\");\n}", AnalysisType = "Logic", AnalysisMessage = "تناقض! الكود يقول المساحة كافية بينما الشرط يقول العكس." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي طاولة المطعم",
                            Slug = "challenge-5",
                            Description = "حدد البرنامج الذي يوجه المجموعة إلى طاولة مناسبة لـ 9 أشخاص.",
                            TargetOutput = "سنصطحبك إلى طاولة.",
                            OrderIndex = 4,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let peopleNum = 9;\nif else (peopleNum < 3) {\n  console.log(\"تفضل إلى طاولة مشتركة.\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! لا توجد عبارة 'if else' في بداية الشرط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let peopleNum = 9;\nif (peopleNum < 3) {\n  console.log(\"طاولة مشتركة\");\n} else if (peopleNum < 10) {\n  console.log(\"سنصطحبك إلى طاولة.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! الرقم 9 أقل من 10 وأكبر من 3." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let peopleNum = 9;\nif (peopleNum > 10) {\n  console.log(\"سنصطحبك إلى طاولة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الرقم 9 ليس أكبر من 10." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let peopleNum = 9;\nif (peopleNum == 3) {\n  console.log(\"سنصطحبك إلى طاولة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! المقارنة هنا للرقم 3 فقط." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مقارنة الدرجات",
                            Slug = "challenge-6",
                            Description = "حدد الكود الذي يقارن الدرجات بشكل صحيح ويخرج رسالة المساواة.",
                            TargetOutput = "لقد حصلت على نتيجة مساوية للتي حصل عليها صديقي في هذا الاختبار.",
                            OrderIndex = 5,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let myScore = 85;\nlet friendScore = 85;\nif (myScore == friendScore) {\n  console.log(\"لقد حصلت على نتيجة مساوية...\");\n}", AnalysisType = "Correct", AnalysisMessage = "إجابة صحيحة! المقارنة عبر (==) أعطت نتيجة 'true' لتساوي القيمتين." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let myScore = 85;\nlet friendScore = 85;\nif (myScore > friendScore) {\n  console.log(\"لقد حصلت على نتيجة مساوية...\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الدرجات متساوية وليست أكبر من بعضها." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let myScore = 85;\nlet friendScore = 85;\nif (myScore != friendScore) {\n  console.log(\"لقد حصلت على نتيجة مساوية...\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! علامة (!=) تعني 'لا يساوي'، والشرط لن يتحقق هنا." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let myScore = 85;\nlet friendScore = 85;\nlet (myScore == friendScore) {\n  console.log(\"متساويان\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ! استخدام let بدلاً من if." }
                            }
                        }
                    }
                };

                context.TofasTests.Add(test);
                await context.SaveChangesAsync();
            }
        }
    }
}
