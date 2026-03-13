using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/user")]
[Authorize(Roles = "backoffice,manager")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Get all users with their assigned skill profile.</summary>
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _db.Set<ForgeUser>()
            .Select(u => new UserDto(
                u.Id,
                (u.FirstName + " " + u.LastName).Trim(),
                u.Email,
                EF.Property<int?>(u, "ProfileId")))
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>Assign or clear a skill profile for a user.</summary>
    [HttpPut("{id}/profile")]
    [Authorize(Roles = "backoffice")]
    public async Task<ActionResult> AssignProfile(string id, [FromBody] AssignProfileRequest request)
    {
        var user = await _db.Set<ForgeUser>().FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _db.Entry(user).Property<int?>("ProfileId").CurrentValue = request.ProfileId;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
