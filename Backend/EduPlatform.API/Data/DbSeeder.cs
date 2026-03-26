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
        }
    }
}
