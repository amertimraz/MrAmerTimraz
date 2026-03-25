using System;
using System.Collections.Generic;

namespace EduPlatform.API.DTOs
{
    public class TofasTestDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsVisible { get; set; }
        public int TimeLimitMinutes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ChallengeDTO> Questions { get; set; } = new();
    }

    public class CreateTofasTestDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsVisible { get; set; } = true;
        public int TimeLimitMinutes { get; set; } = 15;
    }

    public class ChallengeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TargetOutput { get; set; } = string.Empty;
        public int TestId { get; set; }
        public int OrderIndex { get; set; }
        public List<ChallengeSnippetDTO> Snippets { get; set; } = new();
    }

    public class CreateChallengeDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TargetOutput { get; set; } = string.Empty;
        public int TestId { get; set; }
        public int OrderIndex { get; set; }
        public List<CreateChallengeSnippetDTO> Snippets { get; set; } = new();
    }

    public class ChallengeSnippetDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string AnalysisType { get; set; } = string.Empty;
        public string AnalysisMessage { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }

    public class CreateChallengeSnippetDTO
    {
        public string Code { get; set; } = string.Empty;
        public string AnalysisType { get; set; } = string.Empty;
        public string AnalysisMessage { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }
}
