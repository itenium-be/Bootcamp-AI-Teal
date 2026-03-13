using Itenium.SkillForge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StatsController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get dashboard statistics.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<StatsResponse>> GetStats()
    {
        var totalCourses = await _db.Courses.CountAsync();

        var activeConsultants = await _db.Set<IdentityUserClaim<string>>()
            .Where(c => c.ClaimType == "team")
            .Select(c => c.UserId)
            .Distinct()
            .CountAsync();

        const int activeGoals = 0; // TODO: Story 11 - GoalEntity not yet implemented

        return Ok(new StatsResponse(totalCourses, activeConsultants, activeGoals));
    }
}

public record StatsResponse(int TotalCourses, int ActiveConsultants, int ActiveGoals);
