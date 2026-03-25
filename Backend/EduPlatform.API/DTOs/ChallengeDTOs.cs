using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.DTOs
{
    public class ChallengeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TargetOutput { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsVisible { get; set; }
        public int TimeLimitMinutes { get; set; }
        public List<ChallengeSnippetDTO> Snippets { get; set; } = new();
    }

    public class ChallengeSnippetDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string AnalysisType { get; set; } = "Logic";
        public string AnalysisMessage { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }

    public class CreateChallengeDTO
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Slug { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string TargetOutput { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsVisible { get; set; } = true;
        public int TimeLimitMinutes { get; set; } = 15;
        public List<CreateChallengeSnippetDTO> Snippets { get; set; } = new();
    }

    public class CreateChallengeSnippetDTO
    {
        [Required]
        public string Code { get; set; } = string.Empty;
        public string AnalysisType { get; set; } = "Logic";
        public string AnalysisMessage { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
    }
}
