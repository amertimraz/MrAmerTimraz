using EduPlatform.API.Models;
using BCrypt.Net;

namespace EduPlatform.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Seed Users if empty
        if (!context.Users.Any())
        {
            var admin = new User
            {
                Name = "Admin",
                Username = "admin",
                PhoneNumber = "01000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin
            };

            var teacher = new User
            {
                Name = "Mr. Ahmed",
                Username = "teacher",
                PhoneNumber = "01100000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
                Role = UserRole.Teacher
            };

            var student = new User
            {
                Name = "Ali Student",
                Username = "student",
                PhoneNumber = "01200000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRole.Student
            };

            context.Users.AddRange(admin, teacher, student);
            await context.SaveChangesAsync();
        }

        // Seed Tofas Test if empty
        if (!context.Challenges.Any())
        {
            var challenge = new Challenge
            {
                Title = "إختبار Tofas الأول",
                Slug = "tofas-test-1",
                Description = "مجموعة من الأسئلة التفاعلية لقياس مهارات التفكير البرمجي.",
                TargetOutput = "50",
                Price = 0,
                IsVisible = true,
                CreatedAt = DateTime.UtcNow,
                Snippets = new List<ChallengeSnippet>
                {
                    new ChallengeSnippet { 
                        Code = "let 5;\nlet 10;\n\nnum1 = num2 * num1;\nconsole.log(num1);", 
                        AnalysisType = "Syntax", 
                        AnalysisMessage = "خطأ قواعدي (Syntax):\nلا يمكن تسمية المتغيرات بأرقام فقط. يجب أن يبدأ اسم المتغير بحرف.",
                        OrderIndex = 1
                    },
                    new ChallengeSnippet { 
                        Code = "let 5;\nlet 10;\n\nnum1 = num2 / num1;\nconsole.log(num1);", 
                        AnalysisType = "Syntax", 
                        AnalysisMessage = "خطأ قواعدي (Syntax):\nبدأ اسم المتغير برقم وهذا غير مسموح.",
                        OrderIndex = 2
                    },
                    new ChallengeSnippet { 
                        Code = "let num1 = 5;\nlet num2 = 10;\n\nnum1 = num2 / num1;\nconsole.log(num1);", 
                        AnalysisType = "Logic", 
                        AnalysisMessage = "خطأ حسابي (Logic):\nالعملية هنا قسمة 10/5 = 2.\nالنتيجة لا تساوي الهدف (50).",
                        OrderIndex = 3
                    },
                    new ChallengeSnippet { 
                        Code = "let num1 = 5;\nlet num2 = 10;\n\nnum1 = num2 * num1;\nconsole.log(num1);", 
                        AnalysisType = "Correct", 
                        AnalysisMessage = "الإجابة الصحيحة ✅\nالمتغيرات مسماة بشكل صحيح، والعملية الحسابية دقيقة: 10 * 5 = 50.",
                        OrderIndex = 4
                    }
                }
            };
            context.Challenges.Add(challenge);
            await context.SaveChangesAsync();
        }
    }
}
