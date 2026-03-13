using Itenium.SkillForge.Data;
using Itenium.SkillForge.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SkillProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkillProfileController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all skill profiles.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<SkillProfileEntity>>> GetSkillProfiles()
    {
        var profiles = await _db.SkillProfiles.AsNoTracking().ToListAsync();
        return Ok(profiles);
    }
}
