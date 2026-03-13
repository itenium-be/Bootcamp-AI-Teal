using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

public class ConsultantSkillEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(450)]
    public required string ConsultantId { get; set; }

    public int SkillId { get; set; }
    public SkillEntity Skill { get; set; } = null!;

    public int Level { get; set; }

    [MaxLength(450)]
    public string? ValidatedById { get; set; }

    public DateTime? ValidatedAt { get; set; }
}
