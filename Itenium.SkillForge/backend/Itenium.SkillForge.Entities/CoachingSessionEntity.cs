using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

public class CoachingSessionEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(450)]
    public required string CoachId { get; set; }

    [Required]
    [MaxLength(450)]
    public required string ConsultantId { get; set; }

    public int? GoalId { get; set; }
    public GoalEntity? Goal { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    public DateTime SessionDate { get; set; } = DateTime.UtcNow;
}
