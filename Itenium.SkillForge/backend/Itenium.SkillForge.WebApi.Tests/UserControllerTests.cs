using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class UserControllerTests : DatabaseTestBase
{
    private UserController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _sut = new UserController(Db);
    }

    private static ForgeUser CreateUser(string userName, string email, string? firstName = null, string? lastName = null)
    {
        return new ForgeUser
        {
            Id = Guid.NewGuid().ToString(),
            UserName = userName,
            NormalizedUserName = userName.ToUpperInvariant(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
            FirstName = firstName,
            LastName = lastName,
        };
    }

    [Test]
    public async Task GetUsers_ReturnsAllUsers()
    {
        Db.Set<ForgeUser>().AddRange(
            CreateUser("alice", "alice@test.com", "Alice", "Smith"),
            CreateUser("bob", "bob@test.com", "Bob", "Jones"));
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var users = ok!.Value as List<UserDto>;
        Assert.That(users, Is.Not.Null);
        Assert.That(users!.Count, Is.GreaterThanOrEqualTo(2));
    }

    [Test]
    public async Task GetUsers_IncludesProfileId()
    {
        var profile = new SkillProfileEntity { Name = ".NET Developer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var user = CreateUser("charlie", "charlie@test.com", "Charlie", "Brown");
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        Db.Entry(user).Property<int?>("ProfileId").CurrentValue = profile.Id;
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        var users = ok!.Value as List<UserDto>;
        var charlie = users!.FirstOrDefault(u => u.Email == "charlie@test.com");
        Assert.That(charlie, Is.Not.Null);
        Assert.That(charlie!.ProfileId, Is.EqualTo(profile.Id));
    }

    [Test]
    public async Task AssignProfile_WhenUserExists_SetsProfileAndReturnsNoContent()
    {
        var profile = new SkillProfileEntity { Name = "Java Developer" };
        Db.SkillProfiles.Add(profile);
        var user = CreateUser("dave", "dave@test.com");
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        var result = await _sut.AssignProfile(user.Id, new AssignProfileRequest(profile.Id));

        Assert.That(result, Is.TypeOf<NoContentResult>());
        var updatedUser = await Db.Set<ForgeUser>().FindAsync(user.Id);
        var profileId = Db.Entry(updatedUser!).Property<int?>("ProfileId").CurrentValue;
        Assert.That(profileId, Is.EqualTo(profile.Id));
    }

    [Test]
    public async Task AssignProfile_WithNullProfileId_ClearsProfile()
    {
        var profile = new SkillProfileEntity { Name = "QA Engineer" };
        Db.SkillProfiles.Add(profile);
        var user = CreateUser("eve", "eve@test.com");
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        Db.Entry(user).Property<int?>("ProfileId").CurrentValue = profile.Id;
        await Db.SaveChangesAsync();

        var result = await _sut.AssignProfile(user.Id, new AssignProfileRequest(null));

        Assert.That(result, Is.TypeOf<NoContentResult>());
        var updatedUser = await Db.Set<ForgeUser>().FindAsync(user.Id);
        var profileId = Db.Entry(updatedUser!).Property<int?>("ProfileId").CurrentValue;
        Assert.That(profileId, Is.Null);
    }

    [Test]
    public async Task AssignProfile_WhenUserNotFound_ReturnsNotFound()
    {
        var result = await _sut.AssignProfile("nonexistent-id", new AssignProfileRequest(1));
        Assert.That(result, Is.TypeOf<NotFoundResult>());
    }
}
