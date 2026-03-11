namespace EduPlatform.API.Models;

public class Result
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int TestId { get; set; }
    public Test Test { get; set; } = null!;

    public float Score { get; set; }

    public float MaxScore { get; set; }

    public bool Passed { get; set; }

    public string? Answers { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
