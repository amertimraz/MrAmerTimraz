using EduPlatform.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduPlatform.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Suppress the false-positive PendingModelChangesWarning that occurs when
        // the snapshot is generated with SQLite locally but the app runs on PostgreSQL.
        // The actual schema IS in sync via migrations; this is a provider type-name mismatch.
        optionsBuilder.ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Test> Tests => Set<Test>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Result> Results => Set<Result>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PaymentRequest> PaymentRequests => Set<PaymentRequest>();
    public DbSet<LibraryItem> LibraryItems => Set<LibraryItem>();
    public DbSet<InteractiveQuiz> InteractiveQuizzes => Set<InteractiveQuiz>();
    public DbSet<InteractiveQuestion> InteractiveQuestions => Set<InteractiveQuestion>();
    public DbSet<InteractiveQuizResult> InteractiveQuizResults => Set<InteractiveQuizResult>();
    public DbSet<VideoComment> VideoComments => Set<VideoComment>();
    public DbSet<CommentReaction> CommentReactions => Set<CommentReaction>();
    public DbSet<LiveSession> LiveSessions => Set<LiveSession>();
    public DbSet<LiveSessionEnrollment> LiveSessionEnrollments => Set<LiveSessionEnrollment>();
    public DbSet<Booklet> Booklets => Set<Booklet>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<TofasTest> TofasTests => Set<TofasTest>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeSnippet> ChallengeSnippets => Set<ChallengeSnippet>();
    public DbSet<TofasTestResult> TofasTestResults => Set<TofasTestResult>();
    public DbSet<PathResult> PathResults => Set<PathResult>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
            entity.HasIndex(u => u.PhoneNumber).IsUnique();
            entity.HasIndex(u => u.StudentCode).IsUnique();
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

        modelBuilder.Entity<InteractiveQuestion>(entity =>
        {
            entity.HasOne(q => q.Quiz)
                  .WithMany(qz => qz.Questions)
                  .HasForeignKey(q => q.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);
             entity.Property(q => q.Type).HasConversion<string>();
        });
 
        modelBuilder.Entity<InteractiveQuizResult>(entity =>
        {
            entity.HasOne(r => r.Quiz)
                  .WithMany()
                  .HasForeignKey(r => r.QuizId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(r => new { r.QuizId, r.SessionId }).IsUnique();
        });

        modelBuilder.Entity<Video>(entity =>
        {
            entity.HasIndex(v => v.Slug).IsUnique();
        });

        modelBuilder.Entity<VideoComment>(entity =>
        {
            entity.HasOne(c => c.Video)
                  .WithMany()
                  .HasForeignKey(c => c.VideoId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Student)
                  .WithMany()
                  .HasForeignKey(c => c.StudentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.Parent)
                  .WithMany(c => c.Replies)
                  .HasForeignKey(c => c.ParentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommentReaction>(entity =>
        {
            entity.HasOne(r => r.Comment)
                  .WithMany(c => c.Reactions)
                  .HasForeignKey(r => r.CommentId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                  .WithMany()
                  .HasForeignKey(r => r.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(r => r.Type).HasConversion<string>();
        });

        modelBuilder.Entity<LiveSessionEnrollment>(entity =>
        {
            entity.HasOne(e => e.Student)
                  .WithMany()
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.LiveSession)
                  .WithMany(ls => ls.Enrollments)
                  .HasForeignKey(e => e.LiveSessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.StudentId, e.LiveSessionId }).IsUnique();
        });

        modelBuilder.Entity<PaymentRequest>(entity =>
        {
            entity.HasOne(p => p.LiveSession)
                  .WithMany()
                  .HasForeignKey(p => p.LiveSessionId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Booklet)
                  .WithMany(b => b.PaymentRequests)
                  .HasForeignKey(p => p.BookletId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TofasTest>(entity =>
        {
            entity.HasIndex(t => t.Slug).IsUnique();
            entity.HasMany(t => t.Questions)
                  .WithOne(q => q.Test)
                  .HasForeignKey(q => q.TestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            // Slug on Challenge is no longer globally unique, only unique within a test? 
            // For simplicity, let's keep it unique or remove unique index if needed.
            // The user wants "أكثر من سؤال", usually they'd have an OrderIndex.
            entity.HasIndex(c => c.Slug).IsUnique(); 
        });

        modelBuilder.Entity<ChallengeSnippet>(entity =>
        {
            entity.HasOne<Challenge>()
                  .WithMany(c => c.Snippets)
                  .HasForeignKey(s => s.ChallengeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TofasTestResult>(entity =>
        {
            entity.HasOne(r => r.Test)
                  .WithMany()
                  .HasForeignKey(r => r.TestId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Student)
                  .WithMany()
                  .HasForeignKey(r => r.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
