using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Test> Tests => Set<Test>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Result> Results => Set<Result>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PaymentRequest> PaymentRequests => Set<PaymentRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.PhoneNumber).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasOne(c => c.Teacher)
                  .WithMany(u => u.CreatedCourses)
                  .HasForeignKey(c => c.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasOne(v => v.Course)
                  .WithMany(c => c.Videos)
                  .HasForeignKey(v => v.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(v => v.Source).HasConversion<string>();
        });

        modelBuilder.Entity<Test>(entity =>
        {
            entity.HasOne(t => t.Course)
                  .WithMany(c => c.Tests)
                  .HasForeignKey(t => t.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasOne(q => q.Test)
                  .WithMany(t => t.Questions)
                  .HasForeignKey(q => q.TestId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(q => q.QuestionType).HasConversion<string>();
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasOne(r => r.Student)
                  .WithMany(u => u.Results)
                  .HasForeignKey(r => r.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Test)
                  .WithMany(t => t.Results)
                  .HasForeignKey(r => r.TestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasOne(e => e.Student)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Course)
                  .WithMany(c => c.Enrollments)
                  .HasForeignKey(e => e.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaymentRequest>(entity =>
        {
            entity.Property(p => p.Status).HasConversion<string>();

            entity.HasOne(p => p.Student)
                  .WithMany()
                  .HasForeignKey(p => p.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Course)
                  .WithMany()
                  .HasForeignKey(p => p.CourseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
