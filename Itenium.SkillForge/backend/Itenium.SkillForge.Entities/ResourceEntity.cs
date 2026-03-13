using System.ComponentModel.DataAnnotations;

namespace Itenium.SkillForge.Entities;

public class ResourceEntity
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [Required]
    [MaxLength(500)]
    public required string Url { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(450)]
    public string? ContributedById { get; set; }

    public int? SkillId { get; set; }
    public SkillEntity? Skill { get; set; }
}
