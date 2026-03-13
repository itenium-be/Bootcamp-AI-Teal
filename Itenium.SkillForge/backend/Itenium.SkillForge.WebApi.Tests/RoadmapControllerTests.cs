using System.Security.Claims;
using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Itenium.SkillForge.Services;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class RoadmapControllerTests : DatabaseTestBase
{
    private ISkillForgeUser _user = null!;
    private RoadmapController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _user = Substitute.For<ISkillForgeUser>();
        _user.IsBackOffice.Returns(true);

        _sut = new RoadmapController(Db, _user);
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "test-coach-id"),
                    new Claim(ClaimTypes.Role, "backoffice"),
                ], "test")),
            },
        };
    }

    private static ForgeUser CreateUser(string id = "consultant-1")
    {
        return new ForgeUser
        {
            Id = id,
            UserName = id,
            NormalizedUserName = id.ToUpperInvariant(),
            Email = $"{id}@test.com",
            NormalizedEmail = $"{id}@test.com".ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
        };
    }

    [Test]
    public async Task GetRoadmap_ReturnsSkillsGroupedByCategory()
    {
        var user = CreateUser();
        Db.Set<ForgeUser>().Add(user);
        Db.Skills.AddRange(
            new SkillEntity { Name = "C#", Category = "Backend", IsUniversal = true, LevelCount = 5 },
            new SkillEntity { Name = "Docker", Category = "DevOps", IsUniversal = true, LevelCount = 3 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var categories = ok!.Value as List<RoadmapCategoryDto>;
        Assert.That(categories, Is.Not.Null);
        Assert.That(categories!.Select(c => c.Category), Does.Contain("Backend"));
        Assert.That(categories.Select(c => c.Category), Does.Contain("DevOps"));
    }

    [Test]
    public async Task GetRoadmap_WhenNoLevelSet_DefaultsCurrentLevelToZero()
    {
        var user = CreateUser();
        Db.Set<ForgeUser>().Add(user);
        Db.Skills.Add(new SkillEntity { Name = "Communication", IsUniversal = true, LevelCount = 3 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);

        var ok = result.Result as OkObjectResult;
        var categories = ok!.Value as List<RoadmapCategoryDto>;
        var skill = categories!.SelectMany(c => c.Skills).First();
        Assert.That(skill.CurrentLevel, Is.EqualTo(0));
        Assert.That(skill.NextMilestone, Is.EqualTo(1));
    }

    [Test]
    public async Task GetRoadmap_WhenLevelSet_ReturnsCorrectCurrentLevel()
    {
        var user = CreateUser();
        Db.Set<ForgeUser>().Add(user);
        var skill = new SkillEntity { Name = "C#", IsUniversal = true, LevelCount = 5 };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        Db.ConsultantSkillLevels.Add(new ConsultantSkillLevelEntity
        {
            ConsultantId = user.Id,
            SkillId = skill.Id,
            CurrentLevel = 3,
        });
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);

        var ok = result.Result as OkObjectResult;
        var categories = ok!.Value as List<RoadmapCategoryDto>;
        var returned = categories!.SelectMany(c => c.Skills).First();
        Assert.That(returned.CurrentLevel, Is.EqualTo(3));
        Assert.That(returned.NextMilestone, Is.EqualTo(4));
    }

    [Test]
    public async Task GetRoadmap_WhenAtMaxLevel_NextMilestoneIsNull()
    {
        var user = CreateUser();
        Db.Set<ForgeUser>().Add(user);
        var skill = new SkillEntity { Name = "Agile", IsUniversal = true, LevelCount = 3 };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        Db.ConsultantSkillLevels.Add(new ConsultantSkillLevelEntity
        {
            ConsultantId = user.Id,
            SkillId = skill.Id,
            CurrentLevel = 3,
        });
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);

        var ok = result.Result as OkObjectResult;
        var categories = ok!.Value as List<RoadmapCategoryDto>;
        var returned = categories!.SelectMany(c => c.Skills).First();
        Assert.That(returned.CurrentLevel, Is.EqualTo(3));
        Assert.That(returned.NextMilestone, Is.Null);
    }

    [Test]
    public async Task GetRoadmap_OnlyReturnsUniversalAndProfileSkills()
    {
        var user = CreateUser();
        Db.Set<ForgeUser>().Add(user);

        var dotnet = new SkillProfileEntity { Name = ".NET" };
        var java = new SkillProfileEntity { Name = "Java" };
        Db.SkillProfiles.AddRange(dotnet, java);
        await Db.SaveChangesAsync();

        Db.Entry(user).Property<int?>("ProfileId").CurrentValue = dotnet.Id;
        await Db.SaveChangesAsync();

        Db.Skills.AddRange(
            new SkillEntity { Name = "Communication", IsUniversal = true, LevelCount = 3 },
            new SkillEntity { Name = "C#", ProfileId = dotnet.Id, LevelCount = 5 },
            new SkillEntity { Name = "Java", ProfileId = java.Id, LevelCount = 5 });
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);

        var ok = result.Result as OkObjectResult;
        var categories = ok!.Value as List<RoadmapCategoryDto>;
        var skillNames = categories!.SelectMany(c => c.Skills).Select(s => s.Name).ToList();
        Assert.That(skillNames, Contains.Item("Communication"));
        Assert.That(skillNames, Contains.Item("C#"));
        Assert.That(skillNames, Does.Not.Contain("Java"));
    }

    [Test]
    public async Task GetRoadmap_WhenConsultantNotFound_ReturnsNotFound()
    {
        var result = await _sut.GetRoadmap("nonexistent-id");
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task GetRoadmap_WhenNotAuthorized_ReturnsForbid()
    {
        _user.IsBackOffice.Returns(false);
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, "other-user-id"),
                ], "test")),
            },
        };

        var user = CreateUser("some-consultant-id");
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        var result = await _sut.GetRoadmap(user.Id);
        Assert.That(result.Result, Is.TypeOf<ForbidResult>());
    }
}
