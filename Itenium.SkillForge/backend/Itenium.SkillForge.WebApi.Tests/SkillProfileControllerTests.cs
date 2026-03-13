using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class SkillProfileControllerTests : DatabaseTestBase
{
    private SkillProfileController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _sut = new SkillProfileController(Db);
    }

    [Test]
    public async Task GetProfiles_ReturnsAllProfiles()
    {
        Db.SkillProfiles.AddRange(
            new SkillProfileEntity { Name = ".NET Developer" },
            new SkillProfileEntity { Name = "Java Developer" });
        await Db.SaveChangesAsync();

        var result = await _sut.GetProfiles();

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var profiles = ok!.Value as List<SkillProfileEntity>;
        Assert.That(profiles, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetProfile_WhenExists_ReturnsProfileWithSkills()
    {
        var profile = new SkillProfileEntity { Name = "QA Engineer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        Db.Skills.Add(new SkillEntity { Name = "Test Automation", ProfileId = profile.Id, LevelCount = 4 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetProfile(profile.Id);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var returned = ok!.Value as SkillProfileEntity;
        Assert.That(returned!.Name, Is.EqualTo("QA Engineer"));
        Assert.That(returned.Skills, Has.Count.EqualTo(1));
    }

    [Test]
    public async Task GetProfile_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.GetProfile(999);
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task CreateProfile_AddsProfileAndReturnsCreated()
    {
        var result = await _sut.CreateProfile(new CreateSkillProfileRequest("Frontend Developer"));

        var created = result.Result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);
        var profile = created!.Value as SkillProfileEntity;
        Assert.That(profile!.Name, Is.EqualTo("Frontend Developer"));
        Assert.That(await Db.SkillProfiles.AnyAsync(p => p.Name == "Frontend Developer"));
    }

    [Test]
    public async Task UpdateProfile_WhenExists_UpdatesAndReturnsOk()
    {
        var profile = new SkillProfileEntity { Name = "Old Name" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var result = await _sut.UpdateProfile(profile.Id, new UpdateSkillProfileRequest("New Name"));

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var updated = ok!.Value as SkillProfileEntity;
        Assert.That(updated!.Name, Is.EqualTo("New Name"));
    }

    [Test]
    public async Task UpdateProfile_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.UpdateProfile(999, new UpdateSkillProfileRequest("X"));
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task DeleteProfile_WhenExists_RemovesAndReturnsNoContent()
    {
        var profile = new SkillProfileEntity { Name = "To Delete" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var result = await _sut.DeleteProfile(profile.Id);

        Assert.That(result, Is.TypeOf<NoContentResult>());
        Assert.That(await Db.SkillProfiles.FindAsync(profile.Id), Is.Null);
    }

    [Test]
    public async Task DeleteProfile_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.DeleteProfile(999);
        Assert.That(result, Is.TypeOf<NotFoundResult>());
    }
}
