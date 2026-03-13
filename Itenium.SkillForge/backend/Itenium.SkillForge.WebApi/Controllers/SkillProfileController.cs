using Itenium.SkillForge.Data;
using Itenium.SkillForge.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Controllers;

[ApiController]
[Route("api/skill-profile")]
[Authorize(Roles = "backoffice")]
public class SkillProfileController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkillProfileController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>Get all skill profiles.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SkillProfileEntity>>> GetProfiles()
    {
        var profiles = await _db.SkillProfiles.OrderBy(p => p.Name).ToListAsync();
        return Ok(profiles);
    }

    /// <summary>Get a skill profile by ID, including its skills.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SkillProfileEntity>> GetProfile(int id)
    {
        var profile = await _db.SkillProfiles
            .Include(p => p.Skills)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (profile == null)
        {
            return NotFound();
        }

        return Ok(profile);
    }

    /// <summary>Create a new skill profile.</summary>
    [HttpPost]
    public async Task<ActionResult<SkillProfileEntity>> CreateProfile([FromBody] CreateSkillProfileRequest request)
    {
        var profile = new SkillProfileEntity { Name = request.Name };

        _db.SkillProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProfile), new { id = profile.Id }, profile);
    }

    /// <summary>Update an existing skill profile.</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<SkillProfileEntity>> UpdateProfile(int id, [FromBody] UpdateSkillProfileRequest request)
    {
        var profile = await _db.SkillProfiles.FindAsync(id);
        if (profile == null)
        {
            return NotFound();
        }

        profile.Name = request.Name;
        await _db.SaveChangesAsync();

        return Ok(profile);
    }

    /// <summary>Delete a skill profile.</summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProfile(int id)
    {
        var profile = await _db.SkillProfiles.FindAsync(id);
        if (profile == null)
        {
            return NotFound();
        }

        _db.SkillProfiles.Remove(profile);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
