namespace Itenium.SkillForge.Entities;

/// <summary>
/// Expresses that a skill requires another skill as a prerequisite.
/// Composite PK: (SkillId, PrerequisiteSkillId).
/// </summary>
public class SkillDependencyEntity
{
    public int SkillId { get; set; }
    public int PrerequisiteSkillId { get; set; }

    public SkillEntity Skill { get; set; } = null!;
    public SkillEntity Prerequisite { get; set; } = null!;
}
