namespace Itenium.SkillForge.WebApi.Controllers;

public record UpdateSkillRequest(
    string Name,
    string? Category,
    string? Description,
    int LevelCount,
    bool IsUniversal,
    int? ProfileId);
