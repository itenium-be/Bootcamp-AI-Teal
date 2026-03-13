using Itenium.SkillForge.Entities;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class SkillCatalogueTests : DatabaseTestBase
{
    [Test]
    public async Task SkillProfile_CanBeSavedAndRetrieved()
    {
        var profile = new SkillProfileEntity { Name = "Java Developer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var retrieved = await Db.SkillProfiles.FindAsync(profile.Id);

        Assert.That(retrieved, Is.Not.Null);
        Assert.That(retrieved!.Name, Is.EqualTo("Java Developer"));
    }

    [Test]
    public async Task Skill_WithProfile_CanBeSavedAndRetrieved()
    {
        var profile = new SkillProfileEntity { Name = ".NET Developer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var skill = new SkillEntity
        {
            Name = "C# Advanced",
            Category = "Backend",
            Description = "Deep C# knowledge",
            LevelCount = 5,
            IsUniversal = false,
            ProfileId = profile.Id,
        };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var retrieved = await Db.Skills.Include(s => s.Profile).FirstAsync(s => s.Id == skill.Id);

        Assert.That(retrieved.Name, Is.EqualTo("C# Advanced"));
        Assert.That(retrieved.LevelCount, Is.EqualTo(5));
        Assert.That(retrieved.IsUniversal, Is.False);
        Assert.That(retrieved.Profile!.Name, Is.EqualTo(".NET Developer"));
    }

    [Test]
    public async Task Skill_Universal_HasNullProfileId()
    {
        var skill = new SkillEntity
        {
            Name = "Communication",
            IsUniversal = true,
            LevelCount = 3,
        };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var retrieved = await Db.Skills.FindAsync(skill.Id);

        Assert.That(retrieved!.ProfileId, Is.Null);
        Assert.That(retrieved.IsUniversal, Is.True);
    }

    [Test]
    public async Task Skill_LevelCount_DefaultIsThree()
    {
        var skill = new SkillEntity { Name = "Teamwork", IsUniversal = true };
        Db.Skills.Add(skill);
        await Db.SaveChangesAsync();

        var retrieved = await Db.Skills.FindAsync(skill.Id);

        Assert.That(retrieved!.LevelCount, Is.EqualTo(3));
    }

    [Test]
    public async Task SkillDependency_CanBeCreated()
    {
        var basics = new SkillEntity { Name = "Java Basics", IsUniversal = false, LevelCount = 3 };
        var advanced = new SkillEntity { Name = "Java Advanced", IsUniversal = false, LevelCount = 5 };
        Db.Skills.AddRange(basics, advanced);
        await Db.SaveChangesAsync();

        var dependency = new SkillDependencyEntity
        {
            SkillId = advanced.Id,
            PrerequisiteSkillId = basics.Id,
        };
        Db.SkillDependencies.Add(dependency);
        await Db.SaveChangesAsync();

        var retrieved = await Db.SkillDependencies
            .Include(d => d.Prerequisite)
            .FirstAsync(d => d.SkillId == advanced.Id);

        Assert.That(retrieved.Prerequisite.Name, Is.EqualTo("Java Basics"));
    }

    [Test]
    public async Task SkillProfile_WithMultipleSkills_ReturnsAll()
    {
        var profile = new SkillProfileEntity { Name = "QA Engineer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        Db.Skills.AddRange(
            new SkillEntity { Name = "Test Automation", ProfileId = profile.Id, LevelCount = 4 },
            new SkillEntity { Name = "Manual Testing", ProfileId = profile.Id, LevelCount = 3 },
            new SkillEntity { Name = "Performance Testing", ProfileId = profile.Id, LevelCount = 3 });
        await Db.SaveChangesAsync();

        var retrieved = await Db.SkillProfiles
            .Include(p => p.Skills)
            .FirstAsync(p => p.Id == profile.Id);

        Assert.That(retrieved.Skills, Has.Count.EqualTo(3));
    }
}
