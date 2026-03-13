using System.Globalization;
using System.Security.Claims;
using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "backoffice")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ForgeUser> _userManager;

    public UserController(AppDbContext db, UserManager<ForgeUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public record UserResponse(
        string Id,
        string Name,
        string Email,
        string? Role,
        IReadOnlyList<int> TeamIds,
        int? ProfileId,
        string? ProfileName,
        bool IsActive);

    /// <summary>
    /// Get all users with their roles, teams, profile, and status.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> GetUsers()
    {
        var users = await _db.Set<ForgeUser>().AsNoTracking().ToListAsync();
        var userRoles = await _db.Set<IdentityUserRole<string>>().AsNoTracking().ToListAsync();
        var roles = await _db.Set<IdentityRole>().AsNoTracking().ToListAsync();
        var userClaims = await _db.Set<IdentityUserClaim<string>>().AsNoTracking().ToListAsync();
        var profiles = await _db.SkillProfiles.AsNoTracking().ToListAsync();

        var result = users.Select(u =>
        {
            var roleIds = userRoles.Where(ur => ur.UserId == u.Id).Select(ur => ur.RoleId).ToList();
            var role = roles.FirstOrDefault(r => roleIds.Contains(r.Id, StringComparer.Ordinal))?.Name;

            var claims = userClaims.Where(c => c.UserId == u.Id).ToList();
            var teamIds = claims
                .Where(c => c.ClaimType == "team")
                .Select(c => int.TryParse(c.ClaimValue, out var id) ? id : (int?)null)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToList();

            var profileIdStr = claims.FirstOrDefault(c => c.ClaimType == "profile")?.ClaimValue;
            var profileId = int.TryParse(profileIdStr, out var pid) ? pid : (int?)null;
            var profileName = profileId.HasValue ? profiles.FirstOrDefault(p => p.Id == profileId)?.Name : null;

            var isActive = !u.LockoutEnabled || u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow;

            return new UserResponse(
                u.Id,
                $"{u.FirstName} {u.LastName}",
                u.Email ?? string.Empty,
                role,
                teamIds,
                profileId,
                profileName,
                isActive);
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Get a single user by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetUser(string id)
    {
        var user = await _db.Set<ForgeUser>().FindAsync(id);
        if (user == null)
            return NotFound();

        var userRoles = await _db.Set<IdentityUserRole<string>>().Where(ur => ur.UserId == id).ToListAsync();
        var roles = await _db.Set<IdentityRole>().ToListAsync();
        var claims = await _db.Set<IdentityUserClaim<string>>().Where(c => c.UserId == id).ToListAsync();

        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        var role = roles.FirstOrDefault(r => roleIds.Contains(r.Id, StringComparer.Ordinal))?.Name;
        var teamIds = claims
            .Where(c => c.ClaimType == "team")
            .Select(c => int.TryParse(c.ClaimValue, out var tid) ? tid : (int?)null)
            .Where(tid => tid.HasValue)
            .Select(tid => tid!.Value)
            .ToList();
        var profileIdStr = claims.FirstOrDefault(c => c.ClaimType == "profile")?.ClaimValue;
        var profileId = int.TryParse(profileIdStr, out var pid) ? pid : (int?)null;
        string? profileName = null;
        if (profileId.HasValue)
        {
            var profile = await _db.SkillProfiles.FindAsync(profileId.Value);
            profileName = profile?.Name;
        }

        var isActive = !user.LockoutEnabled || user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow;
        return Ok(new UserResponse(user.Id, $"{user.FirstName} {user.LastName}", user.Email ?? string.Empty, role, teamIds, profileId, profileName, isActive));
    }

    /// <summary>
    /// Create a new user with role, optional team, and optional profile.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = new ForgeUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FirstName = request.FirstName,
            LastName = request.LastName,
        };

        var result = await _userManager.CreateAsync(user, GenerateTempPassword());
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, request.Role);

        if (request.TeamId.HasValue)
            await _userManager.AddClaimAsync(user, new Claim("team", request.TeamId.Value.ToString(CultureInfo.InvariantCulture)));

        if (request.ProfileId.HasValue)
            await _userManager.AddClaimAsync(user, new Claim("profile", request.ProfileId.Value.ToString(CultureInfo.InvariantCulture)));

        string? profileName = null;
        if (request.ProfileId.HasValue)
        {
            var profile = await _db.SkillProfiles.FindAsync(request.ProfileId.Value);
            profileName = profile?.Name;
        }

        var response = new UserResponse(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email,
            request.Role,
            request.TeamId.HasValue ? [request.TeamId.Value] : [],
            request.ProfileId,
            profileName,
            true);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, response);
    }

    /// <summary>
    /// Update a user's role, team, and profile.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, request.Role);

        var currentClaims = await _userManager.GetClaimsAsync(user);
        var teamClaims = currentClaims.Where(c => c.Type == "team").ToList();
        await _userManager.RemoveClaimsAsync(user, teamClaims);
        if (request.TeamId.HasValue)
            await _userManager.AddClaimAsync(user, new Claim("team", request.TeamId.Value.ToString(CultureInfo.InvariantCulture)));

        var profileClaims = currentClaims.Where(c => c.Type == "profile").ToList();
        await _userManager.RemoveClaimsAsync(user, profileClaims);
        if (request.ProfileId.HasValue)
            await _userManager.AddClaimAsync(user, new Claim("profile", request.ProfileId.Value.ToString(CultureInfo.InvariantCulture)));

        string? profileName = null;
        if (request.ProfileId.HasValue)
        {
            var profile = await _db.SkillProfiles.FindAsync(request.ProfileId.Value);
            profileName = profile?.Name;
        }

        var isActive = !user.LockoutEnabled || user.LockoutEnd == null || user.LockoutEnd <= DateTimeOffset.UtcNow;
        var response = new UserResponse(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            user.Email ?? string.Empty,
            request.Role,
            request.TeamId.HasValue ? [request.TeamId.Value] : [],
            request.ProfileId,
            profileName,
            isActive);

        return Ok(response);
    }

    /// <summary>
    /// Soft-deactivate a user by setting their lockout indefinitely.
    /// </summary>
    [HttpPost("{id}/deactivate")]
    public async Task<ActionResult> DeactivateUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound();

        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;
        await _userManager.UpdateAsync(user);

        return NoContent();
    }

    /// <summary>
    /// Assign or clear a skill profile for a user.
    /// </summary>
    [HttpPut("{id}/profile")]
    [Authorize(Roles = "backoffice,manager")]
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

    private static string GenerateTempPassword() => $"Temp{Guid.NewGuid():N}!1A";
}
