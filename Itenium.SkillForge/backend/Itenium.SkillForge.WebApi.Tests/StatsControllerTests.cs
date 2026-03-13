using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class StatsControllerTests : DatabaseTestBase
{
    private StatsController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _sut = new StatsController(Db);
    }

    [Test]
    public async Task GetStats_WhenNoCourses_ReturnsTotalCoursesZero()
    {
        var result = await _sut.GetStats();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var stats = (StatsResponse)okResult!.Value!;
        Assert.That(stats.TotalCourses, Is.EqualTo(0));
    }

    [Test]
    public async Task GetStats_WithCourses_ReturnsCorrectCount()
    {
        Db.Courses.AddRange(
            new CourseEntity { Name = "Course A" },
            new CourseEntity { Name = "Course B" },
            new CourseEntity { Name = "Course C" });
        await Db.SaveChangesAsync();

        var result = await _sut.GetStats();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var stats = (StatsResponse)okResult!.Value!;
        Assert.That(stats.TotalCourses, Is.EqualTo(3));
    }

    [Test]
    public async Task GetStats_WithConsultants_ReturnsCorrectCount()
    {
        var userId1 = Guid.NewGuid().ToString();
        var userId2 = Guid.NewGuid().ToString();

        Db.Set<ForgeUser>().AddRange(
            new ForgeUser { Id = userId1, UserName = "consultant1", SecurityStamp = Guid.NewGuid().ToString() },
            new ForgeUser { Id = userId2, UserName = "consultant2", SecurityStamp = Guid.NewGuid().ToString() });
        await Db.SaveChangesAsync();

        Db.Set<IdentityUserClaim<string>>().AddRange(
            new IdentityUserClaim<string> { UserId = userId1, ClaimType = "team", ClaimValue = "1" },
            new IdentityUserClaim<string> { UserId = userId2, ClaimType = "team", ClaimValue = "2" });
        await Db.SaveChangesAsync();

        var result = await _sut.GetStats();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var stats = (StatsResponse)okResult!.Value!;
        Assert.That(stats.ActiveConsultants, Is.EqualTo(2));
    }

    [Test]
    public async Task GetStats_ConsultantWithMultipleTeams_CountsOnce()
    {
        var userId = Guid.NewGuid().ToString();
        Db.Set<ForgeUser>().Add(new ForgeUser { Id = userId, UserName = "multi-team", SecurityStamp = Guid.NewGuid().ToString() });
        await Db.SaveChangesAsync();

        Db.Set<IdentityUserClaim<string>>().AddRange(
            new IdentityUserClaim<string> { UserId = userId, ClaimType = "team", ClaimValue = "1" },
            new IdentityUserClaim<string> { UserId = userId, ClaimType = "team", ClaimValue = "2" });
        await Db.SaveChangesAsync();

        var result = await _sut.GetStats();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var stats = (StatsResponse)okResult!.Value!;
        Assert.That(stats.ActiveConsultants, Is.EqualTo(1));
    }

    [Test]
    public async Task GetStats_ActiveGoals_IsAlwaysZero()
    {
        var result = await _sut.GetStats();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var stats = (StatsResponse)okResult!.Value!;
        Assert.That(stats.ActiveGoals, Is.EqualTo(0));
    }
}
