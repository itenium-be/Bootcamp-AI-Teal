namespace Itenium.SkillForge.WebApi.Controllers;

public record RoadmapCategoryDto(string Category, IReadOnlyList<RoadmapSkillDto> Skills);
