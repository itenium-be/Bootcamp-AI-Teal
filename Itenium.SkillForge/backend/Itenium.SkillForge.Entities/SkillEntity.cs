using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Itenium.SkillForge.Entities;

/// <summary>
/// A skill in the catalogue. Universal skills apply to all profiles; profile-specific
/// skills belong to exactly one <see cref="SkillProfileEntity"/>.
/// </summary>
public class SkillEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>Number of proficiency levels (1–5).</summary>
    public int LevelCount { get; set; } = 3;

    /// <summary>When true the skill appears in every profile.</summary>
    public bool IsUniversal { get; set; }

    [ForeignKey(nameof(Profile))]
    public int? ProfileId { get; set; }

    public SkillProfileEntity? Profile { get; set; }

    public ICollection<SkillDependencyEntity> Dependencies { get; set; } = [];

    public override string ToString() => Name;
}
