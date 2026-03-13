using System.Security.Claims;
using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Data;
using Itenium.SkillForge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/roadmap")]
[Authorize]
public class RoadmapController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISkillForgeUser _user;

    public RoadmapController(AppDbContext db, ISkillForgeUser user)
    {
        _db = db;
        _user = user;
    }

    /// <summary>Get a consultant's skill roadmap grouped by category.</summary>
    [HttpGet("{consultantId}")]
    public async Task<ActionResult<List<RoadmapCategoryDto>>> GetRoadmap(string consultantId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isPrivileged = _user.IsBackOffice || User.IsInRole("manager");

        if (!isPrivileged && currentUserId != consultantId)
        {
            return Forbid();
        }

        var consultant = await _db.Set<ForgeUser>().FindAsync(consultantId);
        if (consultant == null)
        {
            return NotFound();
        }

        var profileId = _db.Entry(consultant).Property<int?>("ProfileId").CurrentValue;

        var skills = await _db.Skills
            .Where(s => s.IsUniversal || s.ProfileId == profileId)
            .ToListAsync();

        var levels = await _db.ConsultantSkillLevels
            .Where(l => l.ConsultantId == consultantId)
            .ToDictionaryAsync(l => l.SkillId, l => l.CurrentLevel);

        var categories = skills
            .GroupBy(s => s.Category ?? "General", StringComparer.OrdinalIgnoreCase)
            .Select(g => new RoadmapCategoryDto(
                g.Key,
                g.OrderBy(s => s.Name, StringComparer.OrdinalIgnoreCase).Select(s =>
                {
                    var current = levels.GetValueOrDefault(s.Id, 0);
                    var next = current < s.LevelCount ? current + 1 : (int?)null;
                    return new RoadmapSkillDto(s.Id, s.Name, s.Category, s.Description, s.LevelCount, current, next);
                }).ToList()))
            .OrderBy(c => c.Category, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Ok(categories);
    }
}
