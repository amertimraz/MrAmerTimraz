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
                        }
                    }
                };

                context.TofasTests.Add(test);
                await context.SaveChangesAsync();
            }
        }
    }
}
