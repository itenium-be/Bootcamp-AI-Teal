namespace Itenium.SkillForge.WebApi.Controllers;

public record UpdateUserRequest(
    string Role,
    int? TeamId,
    int? ProfileId);
