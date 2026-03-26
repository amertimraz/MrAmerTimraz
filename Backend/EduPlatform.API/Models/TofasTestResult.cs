using System;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models;

public class TofasTestResult
{
    public int Id { get; set; }

    [Required]
    public int TestId { get; set; }
    public TofasTest Test { get; set; } = null!;

    [Required]
    public int StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectCount { get; set; }
    public double Percentage { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
