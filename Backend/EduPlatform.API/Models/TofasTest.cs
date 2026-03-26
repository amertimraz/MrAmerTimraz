using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EduPlatform.API.Models
{
    public class TofasTest
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Slug { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; } = 0;

        public bool IsVisible { get; set; } = true;

        public int TimeLimitMinutes { get; set; } = 15;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to Course
        public int? CourseId { get; set; }
        public Course? Course { get; set; }

        // Navigation property
        public List<Challenge> Questions { get; set; } = new();
    }
}
