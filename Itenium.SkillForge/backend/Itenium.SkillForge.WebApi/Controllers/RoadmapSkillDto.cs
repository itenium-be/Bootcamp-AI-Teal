namespace Itenium.SkillForge.WebApi.Controllers;

public record RoadmapSkillDto(
    int SkillId,
    string Name,
    string? Category,
    string? Description,
    int LevelCount,
    int CurrentLevel,
    int? NextMilestone);
