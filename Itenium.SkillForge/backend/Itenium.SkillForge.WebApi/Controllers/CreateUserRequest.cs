namespace Itenium.SkillForge.WebApi.Controllers;

public record CreateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Role,
    int? TeamId,
    int? ProfileId);
