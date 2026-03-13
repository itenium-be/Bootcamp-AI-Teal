using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

public class SkillEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public int MaxLevel { get; set; } = 5;

    public override string ToString() => $"{Name} ({Category})";
}
