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
                                },
                                new ChallengeSnippet
                                {
                                    Code = "num1 = 5;\nnum2 = 10;\nnum1 = num2 + num1;\nconsole.log(num1);",
                                    AnalysisType = "Logic",
                                    AnalysisMessage = "خطأ منطقي! لقد استخدمت علامة الجمع (+) بدلاً من الضرب (*). المخرج سيكون 15 وليس 50.",
                                    OrderIndex = 3
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
                        },
                        new Challenge
                        {
                            Title = "تحدي الأرقام المفتاحية",
                            Slug = "challenge-7",
                            Description = "حدد الكود الذي سيخرج كلمة 'مفتوح'.",
                            TargetOutput = "مفتوح",
                            OrderIndex = 6,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let num1 = 5;\nlet num2 = 7;\nlet num3 = 5;\nlet key = 17;\nif ((num1 + num2 + num3) < key) {\n  console.log(\"مفتوح\");\n} else {\n  console.log(\"الرقم غير صحيح\");\n}", AnalysisType = "Correct", AnalysisMessage = "أصبت! مجموع الأرقام هو 17، والشرط يقول أصغر من 17؟ لا لحظة.. 17 ليست أصغر من 17. دقق في الاختيار 4." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let num1 = 5;\nlet num2 = 7;\nlet num3 = 5;\nlet key = 17;\nif ((num1 * num2 * num3) == key) {\n  console.log(\"مفتوح\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! حاصل الضرب أكبر بكثير من 17." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let num1 = 5;\nlet num2 = 7;\nlet num3 = 5;\nlet key = 17;\nif ((num1 + num2 + num3) == key) {\n  console.log(\"مفتوح\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! مجموع 5+7+5 هو 17، والشرط يتحقق عند التساوي." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let num1 = 5;\nlet num2 = 7;\nlet num3 = 5;\nlet key = 17;\nif ((num1 + num2 + num3) < key) {\n  console.log(\"مفتوح\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 17 ليست أصغر من 17." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي وقود السيارة",
                            Slug = "challenge-8",
                            Description = "حدد البرنامج الذي يكتشف أن الوقود ممتلئ (100).",
                            TargetOutput = "الوقود ممتلئ.",
                            OrderIndex = 7,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let fuel = 100;\nif (fuel == 100) {\n  console.log(\"الوقود ممتلئ.\");\n}", AnalysisType = "Correct", AnalysisMessage = "إجابة صحيحة ومباشرة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let fuel = 100;\nif (fuel > 100) {\n  console.log(\"الوقود ممتلئ.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 100 ليست أكبر من 100." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let fuel = \"100\";\nif (fuel > 100) {\n  console.log(\"الوقود ممتلئ.\");\n}", AnalysisType = "Logic", AnalysisMessage = "تنبيه! استخدام النصوص في العمليات الحسابية قد يؤدي لنتائج غير متوقعة." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let fuel = 100;\nif (fuel != 100) {\n  console.log(\"الوقود ممتلئ.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط هنا يقول 'إذا كان الوقود لا يساوي 100'." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة الغداء",
                            Slug = "challenge-9",
                            Description = "حدد الكود الذي سيخرج قائمة الغداء البديلة.",
                            TargetOutput = "ليس لدينا المكونات اللازمة لتحضير أرز الكاري.\nسنصنع غداءً مختلفاً.\nعرض قائمة الغداء\nبيتزا",
                            OrderIndex = 8,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let lunch = \"أرز بالكاري\";\nif (lunch == \"أرز بالكاري\") {\n  console.log(\"ليس لدينا المكونات...\");\n  console.log(\"سنصنع غداءً مختلفاً.\");\n  lunch = \"بيتزا\";\n}\nconsole.log(\"عرض قائمة الغداء\");\nconsole.log(lunch);", AnalysisType = "Correct", AnalysisMessage = "صحيح! الشرط تحقق فتم تغيير الغداء إلى بيتزا." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let lunch = \"أرز بالكاري\";\nif (lunch != \"أرز بالكاري\") {\n  console.log(\"بيتزا\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! المقارنة غير صحيحة." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let lunch = \"أرز بالكاري\";\nif (lunch < \"أرز بالكاري\") {\n  console.log(\"بيتزا\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن استخدام أصغر من مع النصوص بهذا الشكل." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let lunch = \"بيتزا\";\nif (lunch == \"أرز بالكاري\") {\n  console.log(\"عرض القائمة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! القيمة الابتدائية هنا ليست المطلوبة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي سعة السيارة",
                            Slug = "challenge-10",
                            Description = "حدد الكود الذي يخبرنا أن السيارة أصبحت ممتلئة تماماً.",
                            TargetOutput = "هذه السيارة ممتلئة.",
                            OrderIndex = 9,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let passengersNum = 4;\nlet carCapacity = 6;\npassengersNum = passengersNum + 2;\nif (passengersNum == carCapacity) {\n  console.log(\"هذه السيارة ممتلئة.\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! 4 + 2 تصبح 6، وهي تساوي سعة السيارة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let passengersNum = 4;\nlet carCapacity = 6;\nif (passengersNum + 2 > carCapacity) {\n  console.log(\"هذه السيارة ممتلئة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 6 ليست أكبر من 6." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let passengersNum = 4;\nif (passengersNum == 6) {\n  console.log(\"ممتلئة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! القيمة حالياً 4." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let passengersNum = 4;\nlet carCapacity = 6;\nif (passengersNum < carCapacity) {\n  console.log(\"هذه السيارة ممتلئة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! السيارة ليست ممتلئة إذا كان الركاب أقل من السعة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي شحن البطارية",
                            Slug = "challenge-11",
                            Description = "حدد الكود الذي سيخرج رسالة 'يرجى الشحن.'",
                            TargetOutput = "يرجى الشحن.",
                            OrderIndex = 10,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let batteryPower = \"فارغ\";\nif (batteryPower == \"ممتلئ\") {\n  console.log(\"لا حاجة للشحن.\");\n} else {\n  console.log(\"يرجى الشحن.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! بما أن البطارية ليست ممتلئة سيتنقل الكود لـ else." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let batteryPower = \"فارغ\";\nif (batteryPower == \"فارغ\") {\n  console.log(\"لا حاجة للشحن.\");\n}", AnalysisType = "Logic", AnalysisMessage = "تنبيه! المنطق مقلوب." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let batteryPower = \"ممتلئ\";\nif (batteryPower == \"ممتلئ\") {\n  console.log(\"يرجى الشحن.\");\n}", AnalysisType = "Logic", AnalysisMessage = "تناقض! تطلب الشحن والبطارية ممتلئة." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let batteryPower = \"فارغ\";\nif (batteryPower != \"فارغ\") {\n  console.log(\"يرجى الشحن.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط لن يتحقق لأن القيمة تساوي فارغ." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي رقم العضوية",
                            Slug = "challenge-12",
                            Description = "حدد البرنامج الذي يخرج رسالة 'أنت في المقعد ب.'",
                            TargetOutput = "أنت في المقعد ب.",
                            OrderIndex = 11,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let membershipNumber = 140;\nif (membershipNumber < 100) {\n  console.log(\"أنت في المقعد أ.\");\n} else {\n  console.log(\"أنت في المقعد ب.\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! 140 ليست أصغر من 100، لذا سينتقل التنفيذ إلى else." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let membershipNumber = 140;\nif (membershipNumber > 100) {\n  console.log(\"أنت في المقعد أ.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا الشرط سيخرج 'أنت في المقعد أ.' لأن 140 أكبر من 100." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let membershipNumber = 140;\nif (membershipNumber == 100) {\n  console.log(\"أنت في المقعد ب.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! القيمة لا تساوي 100." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let membershipNumber = 140;\nif (membershipNumber < 100) {\n  console.log(\"أنت في المقعد ب.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط لن يتحقق لأن 140 ليست أصغر من 100." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي تجاوز السعة",
                            Slug = "challenge-13",
                            Description = "حدد الكود الذي سيخرج رسالة 'تم تجاوز السعة المحددة.'",
                            TargetOutput = "تم تجاوز السعة المحددة.",
                            OrderIndex = 12,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let peopleNum = 10;\nif (peopleNum < 5) {\n  console.log(\"ضمن السعة...\");\n} else {\n  console.log(\"تم تجاوز السعة المحددة.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! 10 أكبر من 5، لذا يتم تنفيذ جملة else." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let peopleNum = 10;\nif (peopleNum > 5) {\n  console.log(\"ضمن السعة...\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيخرج رسالة 'ضمن السعة المحددة'." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let peopleNum = 10;\nif (peopleNum < 5) {\n  console.log(\"تم تجاوز السعة المحددة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! الشرط لن يتحقق." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let peopleNum = 10;\nif (peopleNum == 5) {\n  console.log(\"تم تجاوز السعة المحددة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 10 لا تساوي 5." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حالة الماء",
                            Slug = "challenge-14",
                            Description = "حدد الكود الذي يظهر حالتي الغليان والتجمد بالتتابع.",
                            TargetOutput = "الماء يغلي\nالماء يتجمد",
                            OrderIndex = 13,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let waterTemp = 100;\nif (waterTemp == 100) {\n  console.log(\"الماء يغلي\");\n}\nwaterTemp = -5;\nif (waterTemp < 0) {\n  console.log(\"الماء يتجمد\");\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تم تغيير قيمة المتغير والتحقق منها في مرحلتين." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let waterTemp = 100;\nif (waterTemp < 100) {\n  console.log(\"الماء يغلي\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 100 ليست أصغر من 100." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let waterTemp = 100;\nwaterTemp = -5;\nif (waterTemp == 0) {\n  console.log(\"الماء يتجمد\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! -5 لا تساوي 0." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let waterTemp = 100;\nif (waterTemp == 100) {\n  console.log(\"الماء يغلي\");\n  console.log(\"الماء يتجمد\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الماء لا يمكن أن يغلي ويتجمد في نفس الدرجة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي وقت المدرسة",
                            Slug = "challenge-15",
                            Description = "حدد الكود السليم الذي يخرج رسالة الذهاب للمدرسة.",
                            TargetOutput = "انا ذاهب الى المدرسة.",
                            OrderIndex = 14,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let timeZone = 8;\nif (timeZone == 8) {\n  console.log(\"انا ذاهب الى المدرسة.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! تم تعريف المتغير قبل استخدامه في الشرط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (timeZone == 8) {\n  console.log(\"انا ذاهب الى المدرسة.\");\n}\nlet timeZone = 8;", AnalysisType = "Syntax", AnalysisMessage = "خطأ برمجي! لا يمكن استخدام المتغير قبل تعريفه بـ let (ReferenceError)." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let timeZone = 7;\nif (timeZone == 8) {\n  console.log(\"انا ذاهب الى المدرسة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! القيمة 7 لا تساوي 8." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let timeZone = 8;\nif (timeZone != 8) {\n  console.log(\"انا ذاهب الى المدرسة.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط لن يتحقق." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي تتابع المركبات",
                            Slug = "challenge-17",
                            Description = "حدد البرنامج الذي يخرج أسماء المركبات الثلاثة بالترتيب الصحيح.",
                            TargetOutput = "سيارة\nالشينكانسن (القطار فائق السرعة)\nطائرة",
                            OrderIndex = 15,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let vehicle = \"سيارة\";\nconsole.log(vehicle);\nvehicle = \"الشينكانسن (القطار فائق السرعة)\";\nconsole.log(vehicle);\nvehicle = \"طائرة\";\nconsole.log(vehicle);", AnalysisType = "Correct", AnalysisMessage = "أحسنت! هذا التتابع يغير قيمة المتغير ويطبعها في كل مرة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let vehicle = \"سيارة\";\nconsole.log(vehicle);\nlet vehicle = \"طائرة\";\nconsole.log(vehicle);", AnalysisType = "Syntax", AnalysisMessage = "خطأ! لا يمكن إعادة تعريف نفس المتغير بـ let مرتين في نفس النطاق." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let vehicle = \"سيارة\";\nvehicle = \"طائرة\";\nconsole.log(vehicle);", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع 'طائرة' فقط." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let vehicle = \"طائرة\";\nconsole.log(vehicle);", AnalysisType = "Logic", AnalysisMessage = "خطأ! مخرجات ناقصة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي القيم المنطقية",
                            Slug = "challenge-16",
                            Description = "حدد البرنامج الذي يستخدم القيمة المنطقية الصحيحة لإظهار الرسالة.",
                            TargetOutput = "تم تفعيل الوضع الليلي",
                            OrderIndex = 16,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let isDarkMode = true;\nif (isDarkMode) {\n  console.log(\"تم تفعيل الوضع الليلي\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! القيمة true تسمح بتنفيذ ما داخل if." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let isDarkMode = false;\nif (isDarkMode) {\n  console.log(\"تم تفعيل الوضع الليلي\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! القيمة false ستمنع التنفيذ." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let isDarkMode = \"true\";\nif (isDarkMode == true) {\n  console.log(\"تم تفعيل الوضع الليلي\");\n}", AnalysisType = "Logic", AnalysisMessage = "تنبيه! النص \"true\" لا يساوي القيمة المنطقية true." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let isDarkMode = true;\nif (!isDarkMode) {\n  console.log(\"تم تفعيل الوضع الليلي\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (!) يعكس القيمة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي طقس الغد",
                            Slug = "challenge-18",
                            Description = "حدد البرنامج الذي يتوقع طقساً غير مستقر بناءً على القيمة 'ممطر'.",
                            TargetOutput = "الطقس لن يكون جيداً غداً.",
                            OrderIndex = 17,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let tomorrowWeather = \"ممطر\";\nif (tomorrowWeather == \"مشمس\") {\n  console.log(\"سيكون الطقس لطيفاً غداً.\");\n} else {\n  console.log(\"الطقس لن يكون جيداً غداً.\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! بما أنها ممطرة، سينتقل التنفيذ إلى else." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let tomorrowWeather = \"ممطر\";\nif (tomorrowWeather == \"مشمس\") {\n  console.log(\"سيكون الطقس لطيفاً غداً.\");\n} if {\n  console.log(\"الطقس لن يكون جيداً غداً.\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ برمجي! لا يمكن كتابة if بدون شرط بعدها. يجب استخدام else." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "if (tomorrowWeather == \"مشمس\") {\n  console.log(\"سيكون الطقس لطيفاً غداً.\");\n} else {\n  console.log(\"الطقس لن يكون جيداً غداً.\");\n}\nlet tomorrowWeather = \"ممطر\";", AnalysisType = "Syntax", AnalysisMessage = "خطأ! لا يمكن استخدام المتغير قبل تعريفه." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let tomorrowWeather = \"مشمس\";\nif (tomorrowWeather == \"مشمس\") {\n  console.log(\"الطقس لن يكون جيداً غداً.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! المنطق متعارض مع المخرجات المطلوبة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حجم التفاحة",
                            Slug = "challenge-19",
                            Description = "حدد الكود الذي يصنف وزن 300 جرام كحجم متوسط (Medium).",
                            TargetOutput = "إنه حجم Medium.",
                            OrderIndex = 18,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let appleWeight = 300;\nif (appleWeight > 400) {\n  console.log(\"إنه حجم Large\");\n} else if (appleWeight > 200) {\n  console.log(\"إنه حجم Medium\");\n} else {\n  console.log(\"إنه حجم Small\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! 300 ليست أكبر من 400، لكنها أكبر من 200." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (appleWeight > 400) { ... } else { ... }\nlet appleWeight = 300;", AnalysisType = "Syntax", AnalysisMessage = "خطأ! المتغير غير معرف في بداية الكود." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let appleWeight = 300;\nif (appleWeight == 300) {\n  console.log(\"إنه حجم Large\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط سيخرج Large وهو غير المطلوب." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let appleWeight = 300;\nif (appleWeight < 200) {\n  console.log(\"إنه حجم Medium\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! 300 ليست أصغر من 200." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي سعة القاعة",
                            Slug = "challenge-20",
                            Description = "حدد الكود الذي يسمح بالدخول عند توفر مساحة كافية.",
                            TargetOutput = "الجميع يمكنه الدخول.",
                            OrderIndex = 19,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let peopleNum = 180;\nlet venueCapacity = 200;\nif (peopleNum > venueCapacity) {\n  console.log(\"تم تجاوز السعة المحددة.\");\n} else if (peopleNum < venueCapacity) {\n  console.log(\"الجميع يمكنه الدخول.\");\n} else {\n  console.log(\"ممتلئ تماماً\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! 180 أقل من 200 سعة القاعة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (peopleNum > venueCapacity) { ... }\nlet peopleNum = 180;\nlet venueCapacity = 200;", AnalysisType = "Syntax", AnalysisMessage = "خطأ! المتغيرات مستخدمة قبل تعريفها." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let peopleNum = 180;\nlet venueCapacity = 200;\nif (peopleNum == venueCapacity) {\n  console.log(\"الجميع يمكنه الدخول.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 180 لا تساوي 200." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let peopleNum = 180;\nlet venueCapacity = 200;\nif (peopleNum > venueCapacity) {\n  console.log(\"الجميع يمكنه الدخول.\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي في الشرط." }
                            }
                        }
                    }
                };

                context.TofasTests.Add(test);
                await context.SaveChangesAsync();
            }

            // Seed Tofas Test Level 2 if missing
            if (!context.TofasTests.Any(t => t.Slug == "tofas-test-2"))
            {
                var test2 = new TofasTest
                {
                    Title = "إختبار Tofas التجريبي - المستوى الثاني",
                    Slug = "tofas-test-2",
                    Description = "الجزء الثاني من اختبار مهارات البرمجة والمنطق، يركز على العمليات المنطقية المركبة ودمج النصوص.",
                    Price = 0,
                    IsVisible = true,
                    TimeLimitMinutes = 15,
                    Questions = new List<Challenge>
                    {
                        new Challenge
                        {
                            Title = "تحدي دمج النصوص",
                            Slug = "test2-challenge-1",
                            Description = "حلل الكود التالي واختر البرنامج الذي يعطي المخرج المطلوب بدقة.",
                            TargetOutput = "آخر يوم في يونيو هو 30",
                            OrderIndex = 0,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let month = \"يونيو\";\nlet lastDay = \"30\";\nconsole.log(\"آخر يوم في \" + month + \" هو \" + lastDay);", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام علامة (+) لربط النصوص والمتغيرات بشكل سليم." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let month = \"يونيو\";\nlet lastDay = \"30\";\nconsole.log(\"آخر يوم في \" month \" هو \" lastDay);", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! يجب استخدام علامة (+) أو الفاصلة للربط بين النصوص والمتغيرات." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let month = \"يونيو\";\nlet lastDay = \"30\";\nconsole.log(\"آخر يوم في \" + month + هو + lastDay);", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! الكلمة 'هو' يجب أن تكون داخل علامات تنصيص لأنها نص ثابت." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let month = \"يونيو\";\nlet lastDay = \"30\";\nconsole.log(\"آخر يوم في \" * month * \" هو \" * lastDay);", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! لا يمكن استخدام علامة الضرب (*) لربط النصوص." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي منطق 'لا يساوي'",
                            Slug = "test2-challenge-2",
                            Description = "حدد المخرج الصحيح للكود التالي بناءً على قيم المتغيرات.",
                            TargetOutput = "غداء اليوم هو السوشي",
                            OrderIndex = 1,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "غداء اليوم هو السوشي", AnalysisType = "Correct", AnalysisMessage = "صحيح! بما أن الهامبرغر لا يساوي السوشي، سيتحقق الشرط الأول." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "غداء اليوم هو الهامبرغر الذي أحبه", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا المخرج سيظهر فقط إذا كان الطعامان متساويين." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "غداء اليوم هو السوشي الذي أحبه", AnalysisType = "Logic", AnalysisMessage = "خطأ! النص الإضافي 'الذي أحبه' موجود في كتلة else فقط." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "غداء اليوم هو الهامبرغر", AnalysisType = "Logic", AnalysisMessage = "خطأ! الكود يطبع قيمة lunchMenu وهي 'السوشي'." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي توقعات الطقس",
                            Slug = "test2-challenge-3",
                            Description = "حدد البرنامج الذي سيقوم بطباعة النصين المطلوبين معاً.",
                            TargetOutput = "الطقس اليوم مشمس\nلا حاجة إلى مظلة",
                            OrderIndex = 2,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let weatherForecast = \"مشمس\";\nconsole.log(\"الطقس اليوم \" + weatherForecast);\nif (weatherForecast == \"ممطر\") {\n  console.log(\"لا حاجة إلى مظلة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الشرط (== ممطر) لن يتحقق لأن الطقس مشمس." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let weatherForecast = \"مشمس\";\nconsole.log(\"الطقس اليوم \" + weatherForecast);\nif (weatherForecast != \"ممطر\") {\n  console.log(\"لا حاجة إلى مظلة\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! مشمس لا تساوي ممطر، لذا سيطبع الجملة الثانية." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let weatherForecast = \"مشمس\";\nconsole.log(\"الطقس اليوم \" weatherForecast);\nif (weatherForecast != \"ممطر\") {\n  console.log(\"لا حاجة إلى مظلة\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! نسيت علامة (+) في جملة الطباعة الأولى." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let weatherForecast = \"مشمس\";\nconsole.log(\"الطقس اليوم \" + weatherForecast);\nif (weatherForecast == \"ممطر\") {\n  console.log(\"لا حاجة إلى مظلة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! المنطق هنا يطلب أن يكون الطقس ممطراً لعدم استخدام المظلة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي بوابات المنطق (&&)",
                            Slug = "test2-challenge-4",
                            Description = "حدد البرنامج الذي سيعطي النتيجة 'لا يمكنك ركوب اللعبة' بناءً على المدخلات.",
                            TargetOutput = "لا يمكنك ركوب اللعبة",
                            OrderIndex = 3,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let height = 130;\nlet weight = 50;\nif ((height >= 140) && (weight >= 40)) {\n  console.log(\"يمكنك ركوب اللعبة\");\n} else {\n  console.log(\"لا يمكنك ركوب اللعبة\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! الطول 130 أصغر من 140، وبما أننا استخدمنا (&&) فالشرط الكلي سيفشل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let height = 130;\nlet weight = 50;\nif ((height >= 140) || (weight >= 40)) {\n  console.log(\"يمكنك ركوب اللعبة\");\n} else {\n  console.log(\"لا يمكنك ركوب اللعبة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (||) يعني أن تحقق شرط واحد يكفي، والوزن 50 كافٍ للركوب." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let height = 130;\nlet weight = 50;\nif ((height >= 120) && (weight >= 40)) {\n  console.log(\"يمكنك ركوب اللعبة\");\n} else {\n  console.log(\"لا يمكنك ركوب اللعبة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! هنا الشروط محققة وسيطبع 'يمكنك ركوب اللعبة'." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let height = 130;\nlet weight = 50;\nif ((height <= 140) && (weight <= 40)) {\n  console.log(\"يمكنك ركوب اللعبة\");\n} else {\n  console.log(\"لا يمكنك ركوب اللعبة\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الوزن 50 ليس أصغر من 40، لذا سيذهب لـ else لكن المنطق معكوس." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي الوقت والمواعيد",
                            Slug = "test2-challenge-5",
                            Description = "ما هي النتيجة النهائية لتنفيذ هذا البرنامج؟",
                            TargetOutput = "اليوم هو يوم تخفيضات\nسيفتح قريباً",
                            OrderIndex = 4,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "اليوم ليس يوم تخفيضات\nسيفتح قريباً", AnalysisType = "Logic", AnalysisMessage = "خطأ! اليوم هو الخميس فعلاً، لذا سيطبع 'اليوم هو يوم تخفيضات'." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "اليوم ليس يوم تخفيضات\nمفتوح", AnalysisType = "Logic", AnalysisMessage = "خطأ! كلا السطرين غير صحيحين منطقياً." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "اليوم هو يوم تخفيضات\nسيفتح قريباً", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تتبع دقيق للقيم؛ اليوم هو الخميس والوقت (8) ليس بين 10 و 22." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "اليوم هو يوم تخفيضات\nمفتوح", AnalysisType = "Logic", AnalysisMessage = "خطأ! الساعة 8 صباحاً وليست ضمن ساعات العمل (10-22)." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي القائمة اليومية (||)",
                            Slug = "test2-challenge-6",
                            Description = "حدد المخرج الصحيح لهذا البرنامج بناءً على قيمة المتغير weekday.",
                            TargetOutput = "يوم القائمة الخاصة",
                            OrderIndex = 5,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "يوم القائمة العادية", AnalysisType = "Logic", AnalysisMessage = "خطأ! الثلاثاء يحقق الشرط الأول في (||) لذا سيطبع الجملة الأولى." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "يوم القائمة الخاصة", AnalysisType = "Correct", AnalysisMessage = "صحيح! بما أن اليوم هو الثلاثاء، تحقق الجزء الأول من الشرط المركب." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي نفي الشرط (!)",
                            Slug = "test2-challenge-7",
                            Description = "أي من البرامج التالية سيخرج 'يمكن شراء التذاكر'؟",
                            TargetOutput = "يمكن شراء التذاكر",
                            OrderIndex = 6,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let possessionMoney = 10000;\nlet ticketPrice = 8000;\nif (possessionMoney < ticketPrice) {\n  console.log(\"يمكن شراء التذاكر\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! 10000 ليست أصغر من 8000، لذا لن يتحقق الشرط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let possessionMoney = 10000;\nlet ticketPrice = 8000;\nif (!(possessionMoney < ticketPrice)) {\n  console.log(\"يمكن شراء التذاكر\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! نفي الشرط (ليس أصغر من) يعني أنه أكبر أو يساوي، وهو ما تحقق هنا." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حصة الرياضة",
                            Slug = "test2-challenge-8",
                            Description = "حدد البرنامج الذي سيقوم بطباعة النصين المطلوبين معاً بناءً على حالة الطقس واليوم.",
                            TargetOutput = "هناك حصة رياضة اليوم\nستقام في الداخل",
                            OrderIndex = 7,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let weekday = \"الجمعة\";\nlet weather = \"ممطر\";\nif ((weekday == \"الإثنين\") || (weekday == \"الجمعة\")) {\n  console.log(\"هناك حصة رياضة اليوم\");\n}\nif (weather != \"مشمس\") {\n  console.log(\"ستقام في الداخل\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! اليوم هو الجمعة والطقس ليس مشمساً، كلا الشرطين تحققا." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let weekday = \"الجمعة\";\nlet weather = \"ممطر\";\nif ((weekday == \"الإثنين\") || (weekday == \"الجمعة\")) {\n  console.log(\"هناك حصة رياضة اليوم\");\n}\nif (weather == \"مشمس\") {\n  console.log(\"ستقام في الداخل\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! الطقس ليس مشمساً، لذا لن تطبع الجملة الثانية." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let weekday = \"الجمعة\";\nlet weather = \"ممطر\";\nif ((weekday == \"الإثنين\") && (weekday == \"الجمعة\")) {\n  console.log(\"هناك حصة رياضة اليوم\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن أن يكون اليوم هو الإثنين والجمعة في نفس الوقت (&&)." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let weekday = \"الجمعة\";\nlet weather = \"ممطر\";\nif (weather == \"مشمس\") {\n  console.log(\"ستقام في الداخل\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! المنطق متعارض مع الحالة الجوية المطلوبة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي درجة النجاح",
                            Slug = "test2-challenge-9",
                            Description = "أي برنامج سيخرج النتيجة 'ريو نجح' بناءً على درجاته؟",
                            TargetOutput = "ريو نجح",
                            OrderIndex = 8,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let name = \"ريو\";\nlet scienceScore = 60;\nlet mathScore = 90;\nlet borderScore = 80;\nif ((scienceScore <= borderScore) && (mathScore <= borderScore)) {\n  console.log(name + \" نجح\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! درجة الرياضيات 90 ليست أصغر من أو تساوي 80." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let name = \"ريو\";\nlet scienceScore = 60;\nlet mathScore = 90;\nlet borderScore = 60;\nif (!(scienceScore <= borderScore) && (mathScore <= borderScore)) {\n  console.log(name - \" نجح\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ! استخدام علامة (-) مع النصوص غير ممكن، والشرط لن يتحقق." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let name = \"ريو\";\nlet scienceScore = 60;\nlet mathScore = 90;\nlet borderScore = 50;\nif ((scienceScore >= borderScore) && (mathScore >= borderScore)) {\n  console.log(name - \" نجح\");\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! استخدام علامة (-) بدلاً من (+) لربط النصوص." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "let name = \"ريو\";\nlet scienceScore = 60;\nlet mathScore = 90;\nlet borderScore = 60;\nif (!(scienceScore < borderScore) && (mathScore >= borderScore)) {\n  console.log(name + \" نجح\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! نفي (أصغر من 60) يعني 60 أو أكثر، والشرطان محققان." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي نظام القسائم والخصومات",
                            Slug = "test2-challenge-10",
                            Description = "ما هي المخرجات الكاملة لهذا البرنامج مع الحساب النهائي للسعر؟",
                            TargetOutput = "سنمنحك قسيمة\nسيتم تطبيق خصم 1000 ين\nالمبلغ الإجمالي هو كالتالي\n11000",
                            OrderIndex = 9,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "سيتم تطبيق خصم 1000 ين\nالمبلغ الإجمالي هو كالتالي\n11000", AnalysisType = "Logic", AnalysisMessage = "ناقص! لقد نسيت مخرج الشرط الأول المتعلق بعدد المشتريات (10 >= 8)." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "سنمنحك قسيمة\nسيتم تطبيق خصم 1000 ين\nالمبلغ الإجمالي هو كالتالي\n11000", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تحليل شامل؛ حصل على القسيمة والخصم لأن الوقت ليس أقل من 21." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "المبلغ الإجمالي هو كالتالي\n12000", AnalysisType = "Logic", AnalysisMessage = "خطأ! لقد تجاهلت جميع الشروط المنطقية التي تحققت." },
                                new ChallengeSnippet { OrderIndex = 3, Code = "سنمنحك قسيمة\nالمبلغ الإجمالي هو كالتالي\n12000", AnalysisType = "Logic", AnalysisMessage = "خطأ! لقد نسيت تطبيق الخصم الذي طرح 1000 من السعر الإجمالي." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي أيام الأسبوع والمصفوفات",
                            Slug = "test2-challenge-11",
                            Description = "حدد البرنامج الذي سيخرج رسالة إغلاق المكتبة يوم الإثنين بدقة.",
                            TargetOutput = "المكتبة مغلقة يوم الإثنين",
                            OrderIndex = 10,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (let i = 0; i < 5; i++) {\n  if (i == 0) {\n    console.log(\"المكتبة مغلقة يوم \" + weekdays[i]);\n  }\n}", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! تم استخدام if بدلاً من for لبدء الحلقة التكرارية." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 5; i < 0; i++) {\n  if (i == 0) {\n    console.log(\"المكتبة مغلقة يوم \" + weekdays[i]);\n  }\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ منطقي! الحلقة لن تبدأ لأن 5 ليست أصغر من 0." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "for (let i = 0; i < 5; i++) {\n  if (i == 0) {\n    console.log(\"المكتبة مغلقة يوم \" + weekdays[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! حلقة تكرارية سليمة تبدأ من الصفر للوصول لأول عنصر (الإثنين)." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي الوصول لعناصر المصفوفة",
                            Slug = "test2-challenge-12",
                            Description = "أي برنامج سيقوم بطباعة 'هواياتي هي كرة القدم والطبخ'؟",
                            TargetOutput = "هواياتي هي كرة القدم والطبخ",
                            OrderIndex = 11,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let activities = [\"كرة القدم\", \"المطالعة\", \"السفر\"];\nconsole.log(\"هواياتي هي \" + activities[0] + \" و \" + activities[2]);", AnalysisType = "Logic", AnalysisMessage = "خطأ! المصفوفة لا تحتوي على 'الطبخ'، والمخرج سيكون 'كرة القدم والسفر'." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "let activities = [\"كرة القدم\", \"المطالعة\", \"الطبخ\", \"السفر\"];\nconsole.log(\"هواياتي هي \" + activities[0] + \" و \" + activities[2]);", AnalysisType = "Correct", AnalysisMessage = "صحيح! تم اختيار العنصر الأول (0) والثالث (2) بنجاح." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي تكرار الأرقام كنصوص",
                            Slug = "test2-challenge-13",
                            Description = "حدد البرنامج الذي سينتج تتابع الأرقام المطلوب (3، 30، 300).",
                            TargetOutput = "عرض قيمة ضرب 3 في 10\n30\nعرض قيمة ضرب 30 في 10\n300\nعرض قيمة ضرب 300 في 10\n3000",
                            OrderIndex = 12,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (let i = 0; i < 3; i++) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ! استخدام if بدلاً من for." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 0; i < 3; i++) {\n  console.log(\"عرض قيمة ضرب \" + num + \" 10 في\");\n  num = num + \"0\";\n  console.log(num);\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! ترتيب الكلمات في النص غير صحيح (10 في)." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "for (let i = 0; i < 3; i++) {\n  console.log(\"عرض قيمة ضرب \" + num + \" في 10\");\n  num = num + \"0\";\n  console.log(num);\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! دمج النصوص كنصوص (3 + 0 = 30) وتكرار ذلك 3 مرات." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي فرز المواد الدراسية",
                            Slug = "test2-challenge-14",
                            Description = "أي برنامج سيعطي تقريراً صحيحاً عن وجود الوظائف للمواد المذكورة؟",
                            TargetOutput = "عندك وظيفة لغة يابانية\nليس عندك وظيفة رياضيات\nليس عندك وظيفة لغة إنجليزية\nعندك وظيفة علوم\nعندك وظيفة اجتماعيات",
                            OrderIndex = 13,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((subjects[i] == \"لغة يابانية\") && (subjects[i] == \"علوم\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن للمادة الواحدة أن تكون يابانية وعلوم في نفس الوقت (&&)." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((subjects[i] != \"رياضيات\") || (subjects[i] != \"لغة إنجليزية\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا المنطق سيؤدي لنتائج غير دقيقة لجميع المواد." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "if ((subjects[i] == \"لغة يابانية\") || (subjects[i] == \"علوم\") || (subjects[i] == \"اجتماعيات\")) { ... }", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام (||) بشكل صحيح لتحديد المواد التي لديها وظائف." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي أماكن ممارسة الرياضة",
                            Slug = "test2-challenge-15",
                            Description = "حدد البرنامج الذي يحدد مكان اللعب (الملعب أو الصالة) بشكل صحيح لكل رياضة.",
                            TargetOutput = "يتم لعب البيسبول في الملعب\nيتم لعب كرة السلة في الصالة الرياضية\nيتم لعب كرة القدم في الملعب\nيتم لعب الكرة الطائرة في الصالة الرياضية",
                            OrderIndex = 14,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 4; i++) {\n  if (!((sports[i] == outdoorSports[0]) || (sports[i] == outdoorSports[1]))) {\n    place = \"الصالة الرياضية\";\n  }\n  console.log(\"يتم لعب \" + sports[i] + \" في \" + place);\n  place = \"الملعب\";\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! إعادة تعيين المكان إلى 'الملعب' في نهاية كل دورة يضمن صحة التقرير التالي." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 0; i < 4; i++) {\n  if (!((sports[i] == outdoorSports[0]) || (sports[i] == outdoorSports[1]))) {\n    place = \"الصالة الرياضية\";\n  }\n  console.log(\"يتم لعب \" + sports[i] + \" في \" + place);\n}\nplace = \"الملعب\";", AnalysisType = "Logic", AnalysisMessage = "خطأ! بمجرد أن يتغير المكان للصالة، سيبقى صالة لبقية الدورات لأنه لم يُعاد تعيينه داخل الحلقة." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "if (let i = 0; i < 4; i++) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! استخدام if بدلاً من for." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة الطعام والمصفوفات",
                            Slug = "test2-challenge-16",
                            Description = "ما هو المخرج الصحيح عند محاولة طلب الصنف الثالث من القائمة؟",
                            TargetOutput = "سأطلب بارفيه",
                            OrderIndex = 15,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "سأطلب الدجاج المشوي", AnalysisType = "Logic", AnalysisMessage = "خطأ! العنصر الثاني [1] هو الدجاج المشوي، وليس الثالث." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "سأطلب بارفيه", AnalysisType = "Correct", AnalysisMessage = "صحيح! الفهرس [2] يشير للعنصر الثالث في المصفوفة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي رحلات العمل والعمليات الحسابية للفهرس",
                            Slug = "test2-challenge-17",
                            Description = "حدد البرنامج الذي سينتج خطة السفر المطلوبة (أمريكا في أبريل، فرنسا في نوفمبر).",
                            TargetOutput = "سأسافر في رحلة عمل إلى أمريكا في أبريل\nسأسافر في رحلة عمل إلى فرنسا في نوفمبر",
                            OrderIndex = 16,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < destinations.length; i++) {\n  console.log(\"سأسافر إلى \" + destinations[i] + \" في \" + months[i]);\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! سيطبع (فرنسا في أبريل، اليابان في يوليو، أمريكا في نوفمبر)." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 0; i < destinations.length; i++) {\n  if (destinations[i] == \"اليابان\") continue;\n  console.log(\"سأسافر إلى \" + destinations[2-i] + \" في \" + months[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام العملية (2-i) لعكس الفهرس وتخطي اليابان هو الحل الصحيح." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مواعيد وصول الزوار",
                            Slug = "test2-challenge-18",
                            Description = "أي برنامج سيقوم بتخصيص مواعيد الوصول الصحيحة لكل زائر؟",
                            TargetOutput = "موعد وصول كينتا: 6:00 مساءً\nموعد وصول ريوبا: 6:30 مساءً\nموعد وصول هاناكو: 6:00 مساءً\nموعد وصول آيا: 7:00 مساءً",
                            OrderIndex = 17,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((visiters[i] == \"كينتا\") && (visiters[i] == \"هاناكو\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن للزائر أن يحمل اسمين في نفس الوقت." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((visiters[i] == \"كينتا\") || (visiters[i] == \"هاناكو\")) {\n  arrivalTime = \"6:00 مساءً\";\n} else if (visiters[i] == \"ريوبا\") {\n  arrivalTime = \"6:30 مساءً\";\n} else {\n  arrivalTime = \"7:00 مساءً\";\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام (||) لتوحيد وقت وصول كينتا وهاناكو بشكل سليم." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي خصومات العمر",
                            Slug = "test2-challenge-19",
                            Description = "حدد البرنامج الذي يطبق الخصم للأطفال (أقل من 10) وكبار السن (أكبر من 60).",
                            TargetOutput = "سيتم تطبيق خصم للأطفال أو كبار السن\nالسعر العادي\nسيتم تطبيق خصم للأطفال أو كبار السن",
                            OrderIndex = 18,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((ages[i] < 10) && (ages[i] > 60)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن للشخص أن يكون طفلاً ومسناً في آن واحد (&&)." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((ages[i] < 10) || (ages[i] > 60)) {\n  console.log(\"سيتم تطبيق خصم للأطفال أو كبار السن\");\n} else {\n  console.log(\"السعر العادي\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (||) يضمن شمول الفئتين في الخصم." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مواعيد المباريات والطقس",
                            Slug = "test2-challenge-20",
                            Description = "أي برنامج سيختار تواريخ المباريات بناءً على عدم وجود مطر وعدد اللاعبين الكافي (22 فأكثر)؟",
                            TargetOutput = "التواريخ المقترحة لمباريات كرة القدم الودية هي كالتالي\n5\n7",
                            OrderIndex = 19,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((weatherForecasts[i] != \"ممطر\") || (participantsNumbers[i] >= 22)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (||) سيجعل التاريخ (8) يظهر لأن المشاركين 27 رغم وجود مطر." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((weatherForecasts[i] != \"ممطر\") && (participantsNumbers[i] >= 22)) {\n  console.log(dates[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام (&&) يضمن تحقق الشرطين معاً (الطقس المناسب والعدد الكافي)." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة اليوم والمصفوفات",
                            Slug = "test2-challenge-21",
                            Description = "حدد البرنامج الذي سيقوم بطباعة قائمة الطعام بالترتيب الصحيح (سندويش، سلطة، قهوة).",
                            TargetOutput = "قائمة اليوم هي كالتالي\nسندويش\nسلطة\nقهوة",
                            OrderIndex = 20,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "let menuList = [\"سندويش\", \"سلطة\", \"قهوة\"];\nconsole.log(\"قائمة اليوم هي كالتالي\");\nfor (let i = 0; i < 3; i++) {\n  console.log(menuList[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! المصفوفة مرتبة بشكل سليم والحلقة تمر على كل العناصر." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "console.log(menuList);", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع المصفوفة ككتلة واحدة وليس كل صنف في سطر." },
                                new ChallengeSnippet { OrderIndex = 2, Code = "let menuList = [\"قهوة\", \"سلطة\", \"سندويش\"];\nfor (let i = 0; i < 3; i++) {\n  console.log(menuList[i]);\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! ترتيب الأصناف في المصفوفة معكوس." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي أدوار أعضاء المجموعة",
                            Slug = "test2-challenge-22",
                            Description = "أي برنامج سيحدد دور 'يوتا' كمسكرتير و'شون' كقائد للمجموعة؟",
                            TargetOutput = "يوتا هو السكرتير\nشون هو قائد المجموعة",
                            OrderIndex = 21,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (memberList[i] == leader) {\n  console.log(memberList[i] + \" هو قائد المجموعة\");\n} else if (memberList[i] == secretary) {\n  console.log(memberList[i] + \" هو السكرتير\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام if/else if سمح بتخصيص الأدوار بناءً على أسماء الأعضاء في المصفوفة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (memberList[i] == leader) {\n  console.log(memberList[i] + \" هو السكرتير\");\n}", AnalysisType = "Logic", AnalysisMessage = "خطأ! تم عكس المسميات الوظيفية." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي سلة التسوق والشحن",
                            Slug = "test2-challenge-23",
                            Description = "حدد البرنامج الذي يطبق عرض النقاط الثلاثي والشحن المجاني معاً.",
                            TargetOutput = "في يوم 3 تحصل على 3 أضعاف النقاط\nالشحن مجاني",
                            OrderIndex = 22,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (date == \"3\") { ... }\nif (shoppingBasket.length > 3) { ... }", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام جملتي if منفصلتين سمح بتحقق الشرطين بشكل مستقل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (shoppingBasket > 3) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! يجب استخدام خاصية .length لمعرفة عدد العناصر في المصفوفة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة المهام المنجزة",
                            Slug = "test2-challenge-24",
                            Description = "أي برنامج سيقوم بطباعة 'تم الانتهاء من' لجميع المهام في القائمة؟",
                            TargetOutput = "تم الانتهاء من تنظيف الحمام\nتم الانتهاء من تنظيف الغرفة\nتم الانتهاء من غسل الملابس\nتم الانتهاء من الوظائف",
                            OrderIndex = 23,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < taskList.length; i++) {\n  console.log(\"تم الانتهاء من \" + taskList[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! حلقة تكرارية تمر على طول المصفوفة بالكامل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 0; i < taskList; i++) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! i يجب أن تقارن مع طول المصفوفة (taskList.length) وليس المصفوفة نفسها." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي فلترة الملابس",
                            Slug = "test2-challenge-25",
                            Description = "حدد البرنامج الذي سيختار شراء كل الملابس ما عدا 'التنورة'.",
                            TargetOutput = "سأقوم بشراء قميص\nسأقوم بشراء بنطال",
                            OrderIndex = 24,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (!(clothesList[i] == \"تنورة\")) {\n  console.log(\"سأقوم بشراء \" + clothesList[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! نفي المساواة لـ 'تنورة' يعني شراء القميص والبنطال." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (clothesList[i] == \"تنورة\") { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيشتري التنورة فقط." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مستوى البطارية",
                            Slug = "test2-challenge-26",
                            Description = "حدد البرنامج الذي سينبه المستخدم عندما لا تكون البطارية مشحونة بالكامل (اللون ليس أزرق).",
                            TargetOutput = "وصل مستوى البطارية إلى 10%\nيرجى شحن الجهاز",
                            OrderIndex = 25,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (currentBatteryColor != fullyChargedBatteryColor) {\n  console.log(\"وصل مستوى البطارية إلى \" + lowBatteryLevel);\n  console.log(\"يرجى شحن الجهاز\");\n} else {\n  console.log(\"مستوى البطارية كافٍ\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام النفي (!=) سمح باكتشاف أن البطارية ليست زرقاء (أي ليست مشحونة بالكامل)." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (currentBatteryColor == fullyChargedBatteryColor) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع التنبيه فقط إذا كانت البطارية مشحونة بالكامل." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مسار القطار",
                            Slug = "test2-challenge-27",
                            Description = "أي برنامج سيطبع وجهة القطار فقط دون طباعة رسالة التوقف (لأن شروط التوقف لم تتحقق)؟",
                            TargetOutput = "هذا القطار متجه إلى المحطة B",
                            OrderIndex = 26,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"هذا القطار متجه إلى \" + destination);\nif ((destination == \"المحطة B\") && (trainCode == \"B456\")) {\n  console.log(\"A هذا القطار لا يتوقف في المحطة\");\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام (&&) جعل الشرط الإجمالي خاطئاً لأن كود القطار مختلف، فتمت طباعة الوجهة فقط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((destination == \"المحطة B\") || (trainCode == \"B456\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (||) سيجعل الشرط صحيحاً ويطبع رسالة عدم التوقف." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حجز الغرف والطوابق",
                            Slug = "test2-challenge-28",
                            Description = "حدد البرنامج الذي سيكتشف الخطأ في رقم الغرفة ويحدد الطابق الصحيح (25 يقع في الطابق 2).",
                            TargetOutput = "رقم الغرفة غير صحيح\nغرفتك المحجوزة في الطابق رقم 2",
                            OrderIndex = 27,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (reservedRoomNum != roomNum) {\n  console.log(\"رقم الغرفة غير صحيح\");\n}\nif (reservedRoomNum <= 20) {\n  floorNum = \"1\";\n} else if ((reservedRoomNum > 20) && (reservedRoomNum <= 40)) {\n  floorNum = \"2\";\n}\nconsole.log(\"غرفتك المحجوزة في الطابق رقم \" + floorNum);", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام (!=) للخطأ و (&&) لتحديد المدى العمري للطابق هو الحل الأمثل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (reservedRoomNum == roomNum) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! لن يطبع رسالة الخطأ لأن الغرفتين غير متساويتين." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مداخل المسرح",
                            Slug = "test2-challenge-29",
                            Description = "أي برنامج سيوجه أصحاب التذاكر A و B إلى المدخل رقم 1؟",
                            TargetOutput = "الضيوف الحاملون لتذاكر مقاعد A، يرجى الدخول عبر المدخل 1",
                            OrderIndex = 28,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((ticketType == \"A\") || (ticketType == \"B\")) {\n  entrance = \"1\";\n} else {\n  entrance = \"2\";\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (||) يسمح بتوجيه الفئتين لنفس المدخل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((ticketType == \"A\") && (ticketType == \"B\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! التذكرة لا يمكن أن تكون A و B في نفس الوقت." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي ساعات العمل وكمية الطلب",
                            Slug = "test2-challenge-30",
                            Description = "حدد البرنامج الذي سيعتذر عن الكمية المطلوبة (55) فقط إذا كان الوقت ضمن ساعات العمل (9-12).",
                            TargetOutput = "ضمن ساعات العمل\nلا يمكننا تلبية الكمية المطلوبة",
                            OrderIndex = 29,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((requiredQuantity < 10) || (requiredQuantity > 50)) {\n  response = \"لا يمكننا تلبية الكمية المطلوبة\";\n}\nif ((currentTime >= 9) && (currentTime <= 12)) {\n  console.log(\"ضمن ساعات العمل\");\n  console.log(response);\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تم استخدام (||) لتحديد الكميات غير المتاحة و (&&) للتأكد من وقت العمل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((requiredQuantity < 10) && (requiredQuantity > 50)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! الكمية لا يمكن أن تكون أقل من 10 وأكبر من 50 في نفس الوقت." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حالة المبيعات اليومية",
                            Slug = "test2-challenge-31",
                            Description = "حدد البرنامج الذي سيغير حالة العمل إلى 'يوم عمل' إذا لم يكن اليوم هو يوم الإغلاق.",
                            TargetOutput = "حالة العمل: يوم عمل",
                            OrderIndex = 30,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if (!(today == closedDay)) {\n  salesStatus = \"يوم عمل\";\n}\nconsole.log(\"حالة العمل: \" + salesStatus);", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام نفي المساواة (!) هو الطريقة الصحيحة للتحقق من أن اليوم ليس يوم الإغلاق." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (today == closedDay) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيغير الحالة فقط في يوم الإغلاق." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي توجيه الضيوف والخصومات",
                            Slug = "test2-challenge-32",
                            Description = "أي برنامج سيوجه مجموعة من 14 شخصاً للقاعة الكبيرة ويخبرهم بخصم المشروبات (لأنه ليس يوم عطلة)؟",
                            TargetOutput = "سيتم إرشادك إلى الغرفة الكبيرة\nاليوم يوجد خصم على المشروبات",
                            OrderIndex = 31,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((guestCount >= 8) && (guestCount <= 16)) {\n  console.log(\"سيتم إرشادك إلى الغرفة الكبيرة\");\n}\nif (!(visitDay == \"عطلة\")) {\n  console.log(\"اليوم يوجد خصم على المشروبات\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (&&) للمدى العددي و (!) لنفي يوم العطلة هو الحل المثالي." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((guestCount >= 8) || (guestCount <= 16)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (||) سيجعل الشرط صحيحاً لأي عدد من الضيوف." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي تنفيذ الأنشطة",
                            Slug = "test2-challenge-33",
                            Description = "حدد البرنامج الذي سيطبع رسالة التنفيذ لجميع الأنشطة في القائمة.",
                            TargetOutput = "كرة قدم الصالات سيتم تنفيذها\nأنشطة تطوعية سيتم تنفيذها\nوجبة سيتم تنفيذها",
                            OrderIndex = 32,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < activityList.length; i++) {\n  console.log(activityList[i] + \" سيتم تنفيذها\");\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! حلقة تكرارية تمر على كافة عناصر المصفوفة وتدمج النصوص بشكل صحيح." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (let i = 0; i < activityList.length; i++) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! استخدام if بدلاً من for للقيام بعملية تكرارية." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي مواقف الحافلات النشطة",
                            Slug = "test2-challenge-34",
                            Description = "أي برنامج سيستبعد الموقف المتوقف (أمام موقع الفعالية) ويطبع بقية المواقف؟",
                            TargetOutput = "مواقف الحافلات كما يلي\nأمام المحطة\nأمام مبنى البلدية\nمستودع الحافلات",
                            OrderIndex = 33,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"مواقف الحافلات كما يلي\");\nfor (let i = 0; i < busStopList.length; i++) {\n  if (busStopList[i] != suspendedBusStop) {\n    console.log(busStopList[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام النفي (!=) داخل الحلقة سمح باستبعاد العنصر المطلوب فقط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (busStopList[i] == suspendedBusStop) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع الموقف المتوقف فقط ويستبعد البقية." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي فرز الخضروات",
                            Slug = "test2-challenge-35",
                            Description = "حدد البرنامج الذي سيطبع 'تخطي' للبصل والبطاطس، و'استلمت' للبقية.",
                            TargetOutput = "استلمت ملفوف\nتخطي\nتخطي\nاستلمت جزر",
                            OrderIndex = 34,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < pipelineFoodItems.length; i++) {\n  if ((pipelineFoodItems[i] == nonVegetable) || (pipelineFoodItems[i] == enoughFood)) {\n    console.log(\"تخطي\");\n  } else {\n    console.log(\"استلمت \" + pipelineFoodItems[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (||) للتحقق مما إذا كان الصنف هو البصل أو البطاطس لتخطيهما." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((pipelineFoodItems[i] == nonVegetable) && (pipelineFoodItems[i] == enoughFood)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! العنصر لا يمكن أن يكون بصل وبطاطس في نفس الوقت." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي المكونات المتوفرة",
                            Slug = "test2-challenge-36",
                            Description = "حدد البرنامج الذي سيستبعد المكون غير المتوفر (طماطم) ويطبع بقية المكونات.",
                            TargetOutput = "طماطم غير متوفرة\nالمكونات المتوفرة في المتجر كما يلي\nملفوف\nبروكلي\nكرفس",
                            OrderIndex = 35,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(soldOutIngredient + \" غير متوفرة\");\nconsole.log(\"المكونات المتوفرة في المتجر كما يلي\");\nfor (let i = 0; i < 4; i++) {\n  if (!(ingredients[i] == soldOutIngredient)) {\n    console.log(ingredients[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام نفي المساواة (!) داخل الحلقة سمح بطباعة العناصر المتاحة فقط." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (ingredients[i] == soldOutIngredient) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع المكون غير المتوفر فقط." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة المستخدمين المسموحين",
                            Slug = "test2-challenge-37",
                            Description = "أي برنامج سيقوم بطباعة أسماء المستخدمين ما عدا المستخدم الممنوع (userC)؟",
                            TargetOutput = "المستخدمون المسموح لهم بالدخول كما يلي\nuserA\nuserB\nuserD",
                            OrderIndex = 36,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"المستخدمون المسموح لهم بالدخول كما يلي\");\nfor (let i = 0; i < 4; i++) {\n  if (userList[i] != deniedUser) {\n    console.log(userList[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (!=) هو الحل المباشر لاستبعاد مستخدم معين من القائمة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (userList[i] == deniedUser) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيطبع المستخدم الممنوع فقط." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي فرز درجات اللاعبين",
                            Slug = "test2-challenge-38",
                            Description = "حدد البرنامج الذي سيحسب الدرجات العالية (بين 800 و 1000) وينبه للدرجات غير الصالحة (أكبر من 1000).",
                            TargetOutput = "تم اكتشاف درجة غير صالحة\nعدد مرات تحقيق درجة عالية كما يلي\n2",
                            OrderIndex = 37,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 5; i++) {\n  if ((playerScores[i] >= lowerLimitHighScore) && (playerScores[i] <= upperLimitHighScore)) {\n    highScoreCount = highScoreCount + 1;\n  } else if (playerScores[i] > upperLimitHighScore) {\n    console.log(\"تم اكتشاف درجة غير صالحة\");\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تم استخدام (&&) لتحديد المدى المطلوب و (else if) للتعامل مع الدرجات غير الصالحة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((playerScores[i] >= 800) || (playerScores[i] <= 1000)) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! استخدام (||) سيجعل كل الدرجات تدخل ضمن العد." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي سعة زجاجة الماء",
                            Slug = "test2-challenge-39",
                            Description = "أي برنامج سيقوم بطباعة سعة الزجاجة فقط إذا لم تكن فارغة (لا تساوي 0)؟",
                            TargetOutput = "اعرض سعة زجاجة الماء\n300",
                            OrderIndex = 38,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < volumes.length; i++) {\n  if (!(volumes[i] == 0)) {\n    console.log(\"اعرض سعة زجاجة الماء\");\n    console.log(volumes[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام نفي المساواة (!) للصفر استبعد الزجاجة الفارغة بنجاح." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (volumes[i] == 0) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا سيعرض الزجاجات الفارغة فقط." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي جدول الدراسة اليومي",
                            Slug = "test2-challenge-40",
                            Description = "حدد البرنامج الذي سيقوم بطباعة قائمة المواد الدراسية بالترتيب المذكور.",
                            TargetOutput = "المواد التي سيتم دراستها اليوم كما يلي\nعلوم\nرياضيات\nاللغة الإنجليزية",
                            OrderIndex = 39,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"المواد التي سيتم دراستها اليوم كما يلي\");\nfor (let i = 0; i < 3; i++) {\n  console.log(studySubjects[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! حلقة تكرار بسيطة تمر على عناصر المصفوفة بالترتيب الصحيح." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "else { console.log(studySubjects[i]); }", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! استخدام else بدون جملة if سابقة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حضور الطلاب",
                            Slug = "test2-challenge-41",
                            Description = "أي برنامج سيقوم بطباعة أسماء الطلاب الحاضرين فقط (باستثناء 'مي')؟",
                            TargetOutput = "ريسا حاضرة\nميكا حاضرة",
                            OrderIndex = 40,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 3; i++) {\n  if (students[i] != absentStudent) {\n    console.log(students[i] + \" حاضرة\");\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام حلقة for مع شرط النفي (!=) لفلترة الطالب الغائب." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (students == absentStudent) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ! لا يمكن مقارنة المصفوفة بأكملها بقيمة نصية واحدة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي الكتب المستعارة",
                            Slug = "test2-challenge-42",
                            Description = "حدد البرنامج الذي سيكتشف أن الكتاب C مستعار بناءً على قائمة الكتب المستعارة.",
                            TargetOutput = "الكتاب C مُستعار حالياً",
                            OrderIndex = 41,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < bookList.length; i++) {\n  if ((bookList[i] == checkedOutBooks[0]) || (bookList[i] == checkedOutBooks[1])) {\n    console.log(\"الكتاب \" + bookList[i] + \" مُستعار حالياً\");\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! تم استخدام بوابة (||) لمقارنة كل كتاب بالعناصر الموجودة في قائمة الاستعارة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((bookList[i] == checkedOutBooks[0]) && (bookList[i] == checkedOutBooks[1])) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! لا يمكن للكتاب أن يكون مساوياً لقيمتين مختلفتين في نفس الوقت." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي قائمة التسوق",
                            Slug = "test2-challenge-43",
                            Description = "أي برنامج سيقوم بطباعة عبارة 'سأشتري' متبوعة بكل صنف في القائمة؟",
                            TargetOutput = "سأشتري حليباً\nسأشتري خبزاً\nسأشتري بيضاً",
                            OrderIndex = 42,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 3; i++) {\n  console.log(\"سأشتري \" + shoppingList[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام حلقة تكرار مع الوصول للعناصر عبر الفهرس [i] ودمجها مع النص." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (i < 3) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ قواعدي! تعريف حلقة for غير مكتمل (يحتاج لتهيئة وتحديث المتغير)." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي المواعيد المؤجلة",
                            Slug = "test2-challenge-44",
                            Description = "حدد البرنامج الذي سيطبع المواعيد التي لم يتم تأجيلها (استبعاد 'اجتماع').",
                            TargetOutput = "جدول اليوم: طبيب الأسنان",
                            OrderIndex = 43,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 2; i++) {\n  if (!(todaySchedules[i] == rescheduledItem)) {\n    console.log(\"جدول اليوم: \" + todaySchedules[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام النفي المنطقي (!) للتحقق من أن الموعد ليس هو الموعد المؤجل." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (todaySchedules == rescheduledItem) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! مقارنة المصفوفة بالكامل بدلاً من مقارنة كل عنصر على حدة." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي درجة الحرارة العظمى",
                            Slug = "test2-challenge-45",
                            Description = "أي برنامج سيجد ويطبع أعلى درجة حرارة من القائمة؟",
                            TargetOutput = "درجات الحرارة العظمى خلال الأيام 3 الماضية كما يلي\n40",
                            OrderIndex = 44,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < 3; i++) {\n  if (maxTemperature < temperatureList[i]) {\n    maxTemperature = temperatureList[i];\n  }\n}\nconsole.log(\"درجات الحرارة العظمى خلال الأيام 3 الماضية كما يلي\");\nconsole.log(maxTemperature);", AnalysisType = "Correct", AnalysisMessage = "ممتاز! خوارزمية كلاسيكية لإيجاد القيمة العظمى بتحديث المتغير عند العثور على قيمة أكبر." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (maxTemperature > temperatureList[i]) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا المنطق سيحتفظ بأصغر قيمة وليس أكبرها." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي أنواع الكتب المفضلة",
                            Slug = "test2-challenge-46",
                            Description = "حدد البرنامج الذي سيطبع 'النوع المفضل من الكتب' لكل نوع في القائمة.",
                            TargetOutput = "النوع المفضل من الكتب: رواية\nالنوع المفضل من الكتب: كتاب أعمال\nالنوع المفضل من الكتب: كتاب أطفال",
                            OrderIndex = 45,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "for (let i = 0; i < bookGenres.length; i++) {\n  console.log(\"النوع المفضل من الكتب: \" + bookGenres[i]);\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! استخدام خاصية length يضمن المرور على كافة أنواع الكتب في المصفوفة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "for (let i = 0; i < 3; i++) { ... }", AnalysisType = "Logic", AnalysisMessage = "مقبول، ولكن استخدام length أكثر مرونة في حال تغير عدد الكتب مستقبلاً." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حالة تنفيذ المهمة",
                            Slug = "test2-challenge-47",
                            Description = "أي برنامج سيقوم بتنفيذ المهمة فقط إذا كانت القائمة تحتوي على 3 عناصر على الأقل وكان أولها 'متوفر في المخزون'؟",
                            TargetOutput = "سنقوم بتنفيذ المهمة",
                            OrderIndex = 46,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((statusList.length >= 3) && (statusList[0] == \"متوفر في المخزون\")) {\n  console.log(\"سنقوم بتنفيذ المهمة\");\n}", AnalysisType = "Correct", AnalysisMessage = "صحيح! استخدام (&&) يضمن تحقق الشرطين معاً (العدد والنوع) قبل التنفيذ." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((statusList >= 3) && (statusList[0] == \"متوفر في المخزون\")) { ... }", AnalysisType = "Syntax", AnalysisMessage = "خطأ! يجب استخدام statusList.length لمقارنة عدد العناصر." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي دخول المتجر",
                            Slug = "test2-challenge-48",
                            Description = "حدد البرنامج الذي يسمح بالدخول إذا كان عدد الضيوف 2 أو أقل، أو إذا كانت الحالة 'محجوز'.",
                            TargetOutput = "يمكنك دخول المتجر",
                            OrderIndex = 47,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "if ((guests.length <= 2) || (reservationStatus == \"محجوز\")) {\n  console.log(\"يمكنك دخول المتجر\");\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام بوابة (||) يسمح بالدخول في حال تحقق أحد الشرطين." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if ((guests.length <= 2) && (reservationStatus == \"محجوز\")) { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا يتطلب تحقق الشرطين معاً، وهذا ليس المطلوب." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي حالة الحجز التفصيلية",
                            Slug = "test2-challenge-49",
                            Description = "أي برنامج سيقوم بطباعة عدد الأشخاص المحجوزين لكل حجز في القائمة؟",
                            TargetOutput = "تحقق من حالة الحجز الحالية\nتم حجز 3 أشخاص\nتم حجز 8 أشخاص\nتم حجز 5 أشخاص",
                            OrderIndex = 48,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"تحقق من حالة الحجز الحالية\");\nfor (let i = 0; i < reservations.length; i++) {\n  console.log(\"تم حجز \" + reservations[i] + \" أشخاص\");\n}", AnalysisType = "Correct", AnalysisMessage = "أحسنت! حلقة تكرارية بسيطة مع دمج نصوص لإنتاج المخرجات المطلوبة." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "console.log(\"تم حجز \" + [i] + \" أشخاص\");", AnalysisType = "Syntax", AnalysisMessage = "خطأ! [i] بمفرده لا يشير إلى عنصر المصفوفة، يجب استخدام reservations[i]." }
                            }
                        },
                        new Challenge
                        {
                            Title = "تحدي ارتداء الملابس",
                            Slug = "test2-challenge-50",
                            Description = "حدد البرنامج الذي سيعرض جميع الملابس ما عدا 'قبعة'.",
                            TargetOutput = "اعرض الملابس التي يتم ارتداؤها\nسترة\nبنطال\nجوارب",
                            OrderIndex = 49,
                            Snippets = new List<ChallengeSnippet>
                            {
                                new ChallengeSnippet { OrderIndex = 0, Code = "console.log(\"اعرض الملابس التي يتم ارتداؤها\");\nfor (let i = 0; i < clothesItems.length; i++) {\n  if (!(clothesItems[i] == \"قبعة\")) {\n    console.log(clothesItems[i]);\n  }\n}", AnalysisType = "Correct", AnalysisMessage = "ممتاز! استخدام نفي المساواة المنطقي (!) داخل الحلقة هو الطريقة الصحيحة للاستثناء." },
                                new ChallengeSnippet { OrderIndex = 1, Code = "if (clothesItems[1] == \"قبعة\") { ... }", AnalysisType = "Logic", AnalysisMessage = "خطأ! هذا يتحقق من عنصر واحد فقط (الفهرس 1) ولا يمر على بقية القائمة." }
                            }
                        }
                    }
                };

                context.TofasTests.Add(test2);
                await context.SaveChangesAsync();
            }
            await SeedInteractiveQuizzesAsync(context);
        }

        private static async Task SeedInteractiveQuizzesAsync(AppDbContext context)
        {
            if (context.InteractiveQuizzes.Any(q => q.Slug == "3rd-prep-cs-final-revision")) return;

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
                new { T = "عند تنفيذ الكود:\\nIf X=50 Then MsgBox(\"ناجح\")\\nوكانت قيمة X=50 فإن:", Type = "MCQ", Opts = "[\"يظهر صندوق رسالة ناجح\", \"يظهر صندوق رسالة راسب\", \"يتوقف البرنامج\"]", Ans = "0", Exp = "" },
                new { T = "أحد أشكال التعدي الإلكتروني هو:", Type = "MCQ", Opts = "[\"الاستثناء الإلكتروني\", \"التشهير الإلكتروني\", \"التخفي الإلكتروني\"]", Ans = "2", Exp = "" },
                new { T = "الناتج النهائي للمعادلة:\\nY = 12-(2+4)/2", Type = "MCQ", Opts = "[\"Y = 3\", \"Y = 7\", \"Y = 9\"]", Ans = "2", Exp = "9" },
                new { T = "معامل المقارنة الذي يعبر عن \"أقل من أو يساوي\":", Type = "MCQ", Opts = "[\"<>\", \">=\", \"<=\"]", Ans = "2", Exp = "" },
                new { T = "جملة التكرار المناسبة لتكرار كود لعدد محدد من المرات:", Type = "MCQ", Opts = "[\"For...Next\", \"Do While...Loop\", \"If...Then\"]", Ans = "0", Exp = "" },
                new { T = "قيمة أسماء المواد الدراسية تُصنّف كـ:", Type = "MCQ", Opts = "[\"رقمية صحيحة\", \"رقمية غير صحيحة\", \"متنوعة (String)\"]", Ans = "2", Exp = "" },

                new { T = "...... أماكن محجوزة في ذاكرة الكمبيوتر لها اسم ونوع وقيمتها تتغير أثناء البرنامج.", Type = "MCQ", Opts = "[\"المتغيرات\", \"الثوابت\", \"الإجراءات\"]", Ans = "0", Exp = "" },
                new { T = "يُستخدم الأمر ...... للإعلان عن الثوابت في لغة VB.NET.", Type = "MCQ", Opts = "[\"Dim\", \"Const\", \"Sub\"]", Ans = "1", Exp = "" },
                new { T = "جملة ...... تستخدم لتكرار كود معين لعدد محدد من المرات.", Type = "MCQ", Opts = "[\"If\", \"For...Next\", \"Select Case\"]", Ans = "1", Exp = "" },
                new { T = "الثوابت في VB.NET مخازن في ذاكرة الكمبيوتر لها اسم وقيمة ثابتة ...... أثناء سير البرنامج.", Type = "MCQ", Opts = "[\"لا تتغير\", \"تتغير\", \"تُحذف\"]", Ans = "0", Exp = "" },
                new { T = "...... عبارة عن سلوك عدواني متعمد من شخص لآخر عبر وسائل الاتصال الإلكترونية.", Type = "MCQ", Opts = "[\"التعدي الإلكتروني\", \"التخفي\", \"الاستثناء\"]", Ans = "0", Exp = "" },
                new { T = "عبارة عن نشر كلمات عدائية ومبتذلة من شخص معين عبر وسائل الاتصال الإلكترونية ......", Type = "MCQ", Opts = "[\"المضايقة الإلكترونية\", \"السب الإلكتروني\", \"التهديد\"]", Ans = "1", Exp = "" },
                new { T = "جملة التخصيص (Assignment) هي جملة تضع قيمة في متغير أو ثابت وبينهما علامة ......", Type = "MCQ", Opts = "[\"+\", \"*\", \"=\"]", Ans = "2", Exp = "" },
                new { T = "...... يستخدمه المبرمج لكتابة ملاحظات داخل الكود ولا يتم ترجمتها.", Type = "MCQ", Opts = "[\"Dim\", \"Rem\", \"Me\"]", Ans = "1", Exp = "" },
                new { T = "الكلمة المحجوزة ...... تستخدم في إنشاء سطر جديد داخل صندوق النص.", Type = "MCQ", Opts = "[\"vbCrLf\", \"vbNewLine\", \"كلاهما صحيح\"]", Ans = "2", Exp = "" },
                new { T = "...... يُعبّر عن نافذة النموذج الحالية في VB.NET.", Type = "MCQ", Opts = "[\"Form1\", \"Me\", \"This\"]", Ans = "1", Exp = "" },
                new { T = "إذا كانت قيمة الثابت تاريخاً أو وقتاً فإنها توضع بين علامتي ......", Type = "MCQ", Opts = "[\"\\\" \\\"\", \"# #\", \"& &\"]", Ans = "1", Exp = "" },
                new { T = "...... جملة تستخدم لتكرار كود معين لعدد من المرات غير معروف نهايته مسبقاً بناءً على شرط معين.", Type = "MCQ", Opts = "[\"For...Next\", \"Do While...Loop\", \"If...Then\"]", Ans = "1", Exp = "" },

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
                quiz.Questions.Add(new InteractiveQuestion
                {
                    Text = q.T,
                    Type = q.Type,
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
