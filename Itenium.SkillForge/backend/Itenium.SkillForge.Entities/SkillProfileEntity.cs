using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

/// <summary>
/// Groups skills into a named profile (e.g. "Java Developer", ".NET Developer").
/// </summary>
public class SkillProfileEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    public ICollection<SkillEntity> Skills { get; set; } = [];

    public override string ToString() => Name;
}
