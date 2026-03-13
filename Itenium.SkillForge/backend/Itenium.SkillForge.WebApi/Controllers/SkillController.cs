using Itenium.SkillForge.Data;
using Itenium.SkillForge.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/skill")]
[Authorize(Roles = "backoffice")]
public class SkillController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkillController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Get all skills, optionally filtered by profile.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SkillEntity>>> GetSkills([FromQuery] int? profileId)
    {
        var query = _db.Skills.AsQueryable();

        if (profileId.HasValue)
        {
            query = query.Where(s => s.ProfileId == profileId.Value);
        }

        return Ok(await query.OrderBy(s => s.Name).ToListAsync());
    }

    /// <summary>Get a skill by ID, including its dependencies.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SkillEntity>> GetSkill(int id)
    {
        var skill = await _db.Skills
            .Include(s => s.Dependencies)
                .ThenInclude(d => d.Prerequisite)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (skill == null)
        {
            return NotFound();
        }

        return Ok(skill);
    }

    /// <summary>Create a new skill.</summary>
    [HttpPost]
    public async Task<ActionResult<SkillEntity>> CreateSkill([FromBody] CreateSkillRequest request)
    {
        var skill = new SkillEntity
        {
            Name = request.Name,
            Category = request.Category,
            Description = request.Description,
            LevelCount = request.LevelCount,
            IsUniversal = request.IsUniversal,
            ProfileId = request.ProfileId,
        };

        _db.Skills.Add(skill);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
    }

    /// <summary>Update an existing skill.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<SkillEntity>> UpdateSkill(int id, [FromBody] UpdateSkillRequest request)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill == null)
        {
            return NotFound();
        }

        skill.Name = request.Name;
        skill.Category = request.Category;
        skill.Description = request.Description;
        skill.LevelCount = request.LevelCount;
        skill.IsUniversal = request.IsUniversal;
        skill.ProfileId = request.ProfileId;

        await _db.SaveChangesAsync();

        return Ok(skill);
    }

    /// <summary>Delete a skill.</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteSkill(int id)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill == null)
        {
            return NotFound();
        }

        _db.Skills.Remove(skill);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>Add a prerequisite dependency to a skill.</summary>
    [HttpPost("{id:int}/dependencies")]
    public async Task<ActionResult> AddDependency(int id, [FromBody] AddDependencyRequest request)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill == null)
        {
            return NotFound();
        }

        var dependency = new SkillDependencyEntity
        {
            SkillId = id,
            PrerequisiteSkillId = request.PrerequisiteSkillId,
        };

        _db.SkillDependencies.Add(dependency);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { id }, dependency);
    }
}
