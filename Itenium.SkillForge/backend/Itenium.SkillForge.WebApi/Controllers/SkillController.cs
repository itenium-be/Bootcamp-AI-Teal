using Itenium.SkillForge.Data;
using Itenium.SkillForge.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SkillController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkillController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Get all skills.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<SkillEntity>>> GetSkills()
    {
        var skills = await _db.Skills.OrderBy(s => s.Name).ToListAsync();
        return Ok(skills);
    }

    /// <summary>
    /// Get a skill by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SkillEntity>> GetSkill(int id)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill == null)
        {
            return NotFound();
        }

        return Ok(skill);
    }
}
