namespace EduPlatform.API.DTOs;

public class ReviewStageSummaryDto
{
    public string Stage { get; set; } = string.Empty;
    public List<ReviewQuizSummaryDto> Quizzes { get; set; } = new();
}

public class ReviewQuizSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
}

public class ReviewQuestionPublicDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public int Order { get; set; }
}

public class ReviewQuizPublicDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public List<ReviewQuestionPublicDto> Questions { get; set; } = new();
}

public class ReviewCheckAnswerDto
{
    public int SelectedOptionIndex { get; set; }
}

public class ReviewCheckAnswerResultDto
{
    public bool IsCorrect { get; set; }
    public int CorrectOptionIndex { get; set; }
}

public class ReviewAnswerDto
{
    public int QuestionId { get; set; }
    public int SelectedOptionIndex { get; set; }
}

public class ReviewSubmitDto
{
    public string StudentName { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public List<ReviewAnswerDto> Answers { get; set; } = new();
}

public class ReviewSubmitResultDto
{
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int Rank { get; set; }
}

public class ReviewLeaderboardEntryDto
{
    public string StudentName { get; set; } = string.Empty;
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
}
