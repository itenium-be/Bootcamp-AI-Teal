using Itenium.SkillForge.Entities;
using Itenium.SkillForge.Services;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class GoalControllerTests : DatabaseTestBase
{
    private ISkillForgeUser _user = null!;
    private GoalController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _user = Substitute.For<ISkillForgeUser>();
        _sut = new GoalController(Db, _user);
    }

    [Test]
    public async Task GetGoals_ReturnsGoalsForCurrentUser()
    {
        var skill = new SkillEntity { Name = "C#", Category = ".NET" };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        Db.Goals.AddRange(
            new GoalEntity { CoachId = "coach-1", ConsultantId = "lea-id", SkillId = skill.Id, TargetLevel = 3 },
            new GoalEntity { CoachId = "coach-1", ConsultantId = "lea-id", SkillId = skill.Id, TargetLevel = 2 },
            new GoalEntity { CoachId = "coach-1", ConsultantId = "other-user", SkillId = skill.Id, TargetLevel = 1 });
        await Db.SaveChangesAsync();
        _user.UserId.Returns("lea-id");

        var result = await _sut.GetGoals();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var goals = okResult!.Value as List<GoalEntity>;
        Assert.That(goals, Has.Count.EqualTo(2));
        Assert.That(goals!.All(g => g.ConsultantId == "lea-id"), Is.True);
    }

    [Test]
    public async Task GetGoals_WhenNoGoals_ReturnsEmptyList()
    {
        _user.UserId.Returns("lea-id");

        var result = await _sut.GetGoals();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var goals = okResult!.Value as List<GoalEntity>;
        Assert.That(goals, Is.Empty);
    }

    [Test]
    public async Task GetGoals_IncludesSkillInfo()
    {
        var skill = new SkillEntity { Name = "React", Category = "Frontend" };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        Db.Goals.Add(new GoalEntity { CoachId = "coach-1", ConsultantId = "lea-id", SkillId = skill.Id, TargetLevel = 2 });
        await Db.SaveChangesAsync();
        _user.UserId.Returns("lea-id");

        var result = await _sut.GetGoals();

        var goals = (result.Result as OkObjectResult)!.Value as List<GoalEntity>;
        Assert.That(goals![0].Skill, Is.Not.Null);
        Assert.That(goals[0].Skill.Name, Is.EqualTo("React"));
    }
}
