using EduPlatform.API.Models;
using BCrypt.Net;

namespace EduPlatform.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var admin = new User
        {
            Name = "Admin",
            Username = "admin",
            PhoneNumber = "01000000000",
            PlainPassword = "Admin@123",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin
        };

        var teacher = new User
        {
            Name = "Mr. Ahmed",
            Username = "teacher",
            PhoneNumber = "01100000000",
            PlainPassword = "Teacher@123",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Teacher@123"),
            Role = UserRole.Teacher
        };

        var student = new User
        {
            Name = "Ali Student",
            Username = "student",
            PhoneNumber = "01200000000",
            PlainPassword = "Student@123",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
            Role = UserRole.Student
        };

        context.Users.AddRange(admin, teacher, student);
        await context.SaveChangesAsync();
    }
}
