using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;

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
            new SkillEntity { Name = "C#", Category = ".NET" },
            new SkillEntity { Name = "React", Category = "Frontend" });
        await Db.SaveChangesAsync();

        var result = await _sut.GetSkills();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var skills = okResult!.Value as List<SkillEntity>;
        Assert.That(skills, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetSkills_WhenNoSkills_ReturnsEmptyList()
    {
        var result = await _sut.GetSkills();

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var skills = okResult!.Value as List<SkillEntity>;
        Assert.That(skills, Is.Empty);
    }

    [Test]
    public async Task GetSkill_WhenExists_ReturnsSkill()
    {
        var skill = new SkillEntity { Name = "C#", Description = "C# programming", Category = ".NET", MaxLevel = 5 };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var result = await _sut.GetSkill(skill.Id);

        var okResult = result.Result as OkObjectResult;
        Assert.That(okResult, Is.Not.Null);
        var returned = okResult!.Value as SkillEntity;
        Assert.That(returned!.Name, Is.EqualTo("C#"));
        Assert.That(returned.Category, Is.EqualTo(".NET"));
    }

    [Test]
    public async Task GetSkill_WhenNotExists_ReturnsNotFound()
    {
        var result = await _sut.GetSkill(999);
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }
}
