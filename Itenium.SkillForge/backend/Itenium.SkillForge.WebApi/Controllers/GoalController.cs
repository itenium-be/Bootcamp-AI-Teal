using Itenium.SkillForge.Data;
using Itenium.SkillForge.Entities;
using Itenium.SkillForge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoalController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISkillForgeUser _user;

    public GoalController(AppDbContext db, ISkillForgeUser user)
    {
        _db = db;
        _user = user;
    }

    /// <summary>
    /// Get goals for the current user.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<GoalEntity>>> GetGoals()
    {
        var goals = await _db.Goals
            .Include(g => g.Skill)
            .Where(g => g.ConsultantId == _user.UserId)
            .OrderBy(g => g.SkillId)
            .ThenBy(g => g.TargetLevel)
            .ToListAsync();

        return Ok(goals);
    }
}
