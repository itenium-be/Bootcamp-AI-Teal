namespace Itenium.SkillForge.Entities;

public class ConsultantSkillLevelEntity
{
    public required string ConsultantId { get; set; }
    public int SkillId { get; set; }
    public int CurrentLevel { get; set; }

    public SkillEntity? Skill { get; set; }
}
