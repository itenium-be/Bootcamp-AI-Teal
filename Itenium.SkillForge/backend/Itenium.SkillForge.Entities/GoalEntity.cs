using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

public class GoalEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(450)]
    public required string CoachId { get; set; }

    [Required]
    [MaxLength(450)]
    public required string ConsultantId { get; set; }

    public int SkillId { get; set; }
    public SkillEntity Skill { get; set; } = null!;

    public int TargetLevel { get; set; }

    public GoalStatus Status { get; set; } = GoalStatus.Active;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
