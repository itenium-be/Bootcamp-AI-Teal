using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class SkillControllerTests : DatabaseTestBase
{
    private SkillController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _sut = new SkillController(Db);
    }

    [Test]
    public async Task GetSkills_ReturnsAllSkills()
    {
        Db.Skills.AddRange(
            new SkillEntity { Name = "C#", IsUniversal = false, LevelCount = 5 },
            new SkillEntity { Name = "Communication", IsUniversal = true, LevelCount = 3 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetSkills(null);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var skills = ok!.Value as List<SkillEntity>;
        Assert.That(skills, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetSkills_WithProfileId_FiltersByProfile()
    {
        var profile = new SkillProfileEntity { Name = ".NET" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        Db.Skills.AddRange(
            new SkillEntity { Name = "C#", ProfileId = profile.Id, LevelCount = 5 },
            new SkillEntity { Name = "Communication", IsUniversal = true, LevelCount = 3 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetSkills(profile.Id);

        var ok = result.Result as OkObjectResult;
        var skills = ok!.Value as List<SkillEntity>;
        Assert.That(skills, Has.Count.EqualTo(1));
        Assert.That(skills![0].Name, Is.EqualTo("C#"));
    }

    [Test]
    public async Task GetSkill_WhenExists_ReturnsSkill()
    {
        var skill = new SkillEntity { Name = "Azure", LevelCount = 3, Category = "Cloud" };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var result = await _sut.GetSkill(skill.Id);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var returned = ok!.Value as SkillEntity;
        Assert.That(returned!.Name, Is.EqualTo("Azure"));
        Assert.That(returned.Category, Is.EqualTo("Cloud"));
    }

    [Test]
    public async Task GetSkill_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.GetSkill(999);
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task CreateSkill_AddsSkillAndReturnsCreated()
    {
        var request = new CreateSkillRequest("Docker", "DevOps", "Container technology", 4, false, null);

        var result = await _sut.CreateSkill(request);

        var created = result.Result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);
        var skill = created!.Value as SkillEntity;
        Assert.That(skill!.Name, Is.EqualTo("Docker"));
        Assert.That(skill.LevelCount, Is.EqualTo(4));
        Assert.That(await Db.Skills.AnyAsync(s => s.Name == "Docker"));
    }

    [Test]
    public async Task UpdateSkill_WhenExists_UpdatesAndReturnsOk()
    {
        var skill = new SkillEntity { Name = "Old Name", LevelCount = 3 };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var request = new UpdateSkillRequest("New Name", "Backend", "Updated desc", 5, true, null);
        var result = await _sut.UpdateSkill(skill.Id, request);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var updated = ok!.Value as SkillEntity;
        Assert.That(updated!.Name, Is.EqualTo("New Name"));
        Assert.That(updated.LevelCount, Is.EqualTo(5));
        Assert.That(updated.IsUniversal, Is.True);
    }

    [Test]
    public async Task UpdateSkill_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.UpdateSkill(999, new UpdateSkillRequest("X", null, null, 3, false, null));
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task DeleteSkill_WhenExists_RemovesAndReturnsNoContent()
    {
        var skill = new SkillEntity { Name = "To Delete", LevelCount = 3 };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var result = await _sut.DeleteSkill(skill.Id);

        Assert.That(result, Is.TypeOf<NoContentResult>());
        Assert.That(await Db.Skills.FindAsync(skill.Id), Is.Null);
    }

    [Test]
    public async Task DeleteSkill_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.DeleteSkill(999);
        Assert.That(result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task AddDependency_CreatesAndReturnsCreated()
    {
        var basics = new SkillEntity { Name = "C# Basics", LevelCount = 3 };
        var advanced = new SkillEntity { Name = "C# Advanced", LevelCount = 5 };
        Db.Skills.AddRange(basics, advanced);
        await Db.SaveChangesAsync();

        var result = await _sut.AddDependency(advanced.Id, new AddDependencyRequest(basics.Id));

        Assert.That(result, Is.TypeOf<CreatedAtActionResult>());
        Assert.That(await Db.SkillDependencies.AnyAsync(d =>
            d.SkillId == advanced.Id && d.PrerequisiteSkillId == basics.Id));
    }

    [Test]
    public async Task AddDependency_WhenSkillNotExists_ReturnsNotFound()
    {
        var result = await _sut.AddDependency(999, new AddDependencyRequest(1));
        Assert.That(result, Is.TypeOf<NotFoundResult>());
    }
}
