using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class Challenge
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Slug { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string TargetOutput { get; set; } = string.Empty;
        
        public int TestId { get; set; }
        
        public int OrderIndex { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public TofasTest? Test { get; set; }
        public List<ChallengeSnippet> Snippets { get; set; } = new();
    }

    public class ChallengeSnippet
    {
        public int Id { get; set; }
        
        public int ChallengeId { get; set; }
        
        [Required]
        public string Code { get; set; } = string.Empty;
        
        // "Correct", "Syntax", "Logic"
        public string AnalysisType { get; set; } = "Logic"; 
        
        public string AnalysisMessage { get; set; } = string.Empty;
        
        public int OrderIndex { get; set; }
    }
}
