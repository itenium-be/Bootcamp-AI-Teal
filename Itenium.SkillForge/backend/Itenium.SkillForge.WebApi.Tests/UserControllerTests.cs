using System.Globalization;
using System.Security.Claims;
using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Itenium.SkillForge.WebApi.Controllers;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;

namespace Itenium.SkillForge.WebApi.Tests;

[TestFixture]
public class UserControllerTests : DatabaseTestBase
{
    private UserManager<ForgeUser> _userManager = null!;
    private UserController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _userManager = Substitute.For<UserManager<ForgeUser>>(
            Substitute.For<IUserStore<ForgeUser>>(),
            null, null, null, null, null, null, null, null);
        _sut = new UserController(Db, _userManager);
    }

    [TearDown]
    public void TearDown()
    {
        _userManager.Dispose();
    }

    private static ForgeUser MakeUser(string firstName, string lastName, string email) =>
        new()
        {
            Id = Guid.NewGuid().ToString(),
            UserName = email,
            NormalizedUserName = email.ToUpperInvariant(),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            FirstName = firstName,
            LastName = lastName,
            SecurityStamp = Guid.NewGuid().ToString(),
        };

    private static IdentityRole MakeRole(string name) =>
        new() { Id = Guid.NewGuid().ToString(), Name = name, NormalizedName = name.ToUpperInvariant() };

    // -------------------------------------------------------
    // GetUsers
    // -------------------------------------------------------

    [Test]
    public async Task GetUsers_ReturnsAllUsers()
    {
        var user1 = MakeUser("Alice", "Smith", "alice@test.local");
        var user2 = MakeUser("Bob", "Jones", "bob@test.local");
        Db.Set<ForgeUser>().AddRange(user1, user2);
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var users = ok!.Value as List<UserController.UserResponse>;
        Assert.That(users, Has.Count.EqualTo(2));
    }

    [Test]
    public async Task GetUsers_IncludesRoleTeamsAndProfile()
    {
        var user = MakeUser("Carol", "White", "carol@test.local");
        var role = MakeRole("learner");
        var profile = new SkillProfileEntity { Name = "Java Developer" };
        Db.SkillProfiles.Add(profile);
        Db.Set<ForgeUser>().Add(user);
        Db.Set<IdentityRole>().Add(role);
        await Db.SaveChangesAsync();
        Db.Set<IdentityUserRole<string>>().Add(new IdentityUserRole<string> { UserId = user.Id, RoleId = role.Id });
        Db.Set<IdentityUserClaim<string>>().AddRange(
            new IdentityUserClaim<string> { UserId = user.Id, ClaimType = "team", ClaimValue = "1" },
            new IdentityUserClaim<string> { UserId = user.Id, ClaimType = "profile", ClaimValue = profile.Id.ToString(CultureInfo.InvariantCulture) });
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        var users = ok!.Value as List<UserController.UserResponse>;
        var response = users!.Single();
        Assert.That(response.Name, Is.EqualTo("Carol White"));
        Assert.That(response.Email, Is.EqualTo("carol@test.local"));
        Assert.That(response.Role, Is.EqualTo("learner"));
        Assert.That(response.TeamIds, Contains.Item(1));
        Assert.That(response.ProfileId, Is.EqualTo(profile.Id));
        Assert.That(response.ProfileName, Is.EqualTo("Java Developer"));
    }

    [Test]
    public async Task GetUsers_ActiveUser_IsActiveTrue()
    {
        var user = MakeUser("Dave", "Black", "dave@test.local");
        user.LockoutEnabled = false;
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        var users = ok!.Value as List<UserController.UserResponse>;
        Assert.That(users!.Single().IsActive, Is.True);
    }

    [Test]
    public async Task GetUsers_DeactivatedUser_IsActiveFalse()
    {
        var user = MakeUser("Eve", "Grey", "eve@test.local");
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;
        Db.Set<ForgeUser>().Add(user);
        await Db.SaveChangesAsync();

        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        var users = ok!.Value as List<UserController.UserResponse>;
        Assert.That(users!.Single().IsActive, Is.False);
    }

    [Test]
    public async Task GetUsers_WhenNoUsers_ReturnsEmptyList()
    {
        var result = await _sut.GetUsers();

        var ok = result.Result as OkObjectResult;
        var users = ok!.Value as List<UserController.UserResponse>;
        Assert.That(users, Is.Empty);
    }

    // -------------------------------------------------------
    // CreateUser
    // -------------------------------------------------------

    [Test]
    public async Task CreateUser_CallsUserManagerCreateAndReturnsCreated()
    {
        var request = new CreateUserRequest("Frank", "Green", "frank@test.local", "learner", null, null);
        _userManager.CreateAsync(Arg.Any<ForgeUser>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);
        _userManager.AddToRoleAsync(Arg.Any<ForgeUser>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);

        var result = await _sut.CreateUser(request);

        var created = result.Result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);
        var response = created!.Value as UserController.UserResponse;
        Assert.That(response!.Name, Is.EqualTo("Frank Green"));
        Assert.That(response.Email, Is.EqualTo("frank@test.local"));
        Assert.That(response.Role, Is.EqualTo("learner"));
    }

    [Test]
    public async Task CreateUser_WithTeamAndProfile_AddsClaimsViaUserManager()
    {
        var profile = new SkillProfileEntity { Name = ".NET Developer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        var request = new CreateUserRequest("Grace", "Blue", "grace@test.local", "manager", 2, profile.Id);
        _userManager.CreateAsync(Arg.Any<ForgeUser>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);
        _userManager.AddToRoleAsync(Arg.Any<ForgeUser>(), Arg.Any<string>())
            .Returns(IdentityResult.Success);
        _userManager.AddClaimAsync(Arg.Any<ForgeUser>(), Arg.Any<Claim>())
            .Returns(IdentityResult.Success);

        var result = await _sut.CreateUser(request);

        var created = result.Result as CreatedAtActionResult;
        var response = created!.Value as UserController.UserResponse;
        Assert.That(response!.TeamIds, Contains.Item(2));
        Assert.That(response.ProfileId, Is.EqualTo(profile.Id));
        Assert.That(response.ProfileName, Is.EqualTo(".NET Developer"));
        await _userManager.Received(1).AddClaimAsync(Arg.Any<ForgeUser>(), Arg.Is<Claim>(c => c.Type == "team" && c.Value == "2"));
        await _userManager.Received(1).AddClaimAsync(Arg.Any<ForgeUser>(), Arg.Is<Claim>(c => c.Type == "profile"));
    }

    [Test]
    public async Task CreateUser_WhenCreateFails_ReturnsBadRequest()
    {
        var request = new CreateUserRequest("Henry", "Red", "henry@test.local", "learner", null, null);
        _userManager.CreateAsync(Arg.Any<ForgeUser>(), Arg.Any<string>())
            .Returns(IdentityResult.Failed(new IdentityError { Description = "Email taken" }));

        var result = await _sut.CreateUser(request);

        Assert.That(result.Result, Is.TypeOf<BadRequestObjectResult>());
    }

    // -------------------------------------------------------
    // UpdateUser
    // -------------------------------------------------------

    [Test]
    public async Task UpdateUser_WhenNotExists_ReturnsNotFound()
    {
        _userManager.FindByIdAsync("nonexistent").Returns((ForgeUser?)null);

        var result = await _sut.UpdateUser("nonexistent", new UpdateUserRequest("learner", null, null));

        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task UpdateUser_ChangesRoleTeamAndProfile()
    {
        var user = MakeUser("Ivan", "Brown", "ivan@test.local");
        var profile = new SkillProfileEntity { Name = "QA Engineer" };
        Db.SkillProfiles.Add(profile);
        await Db.SaveChangesAsync();

        _userManager.FindByIdAsync(user.Id).Returns(user);
        _userManager.GetRolesAsync(user).Returns(["manager"]);
        _userManager.RemoveFromRolesAsync(user, Arg.Any<IEnumerable<string>>()).Returns(IdentityResult.Success);
        _userManager.AddToRoleAsync(user, Arg.Any<string>()).Returns(IdentityResult.Success);
        _userManager.GetClaimsAsync(user).Returns([new Claim("team", "1")]);
        _userManager.RemoveClaimsAsync(user, Arg.Any<IEnumerable<Claim>>()).Returns(IdentityResult.Success);
        _userManager.AddClaimAsync(user, Arg.Any<Claim>()).Returns(IdentityResult.Success);

        var result = await _sut.UpdateUser(user.Id, new UpdateUserRequest("learner", 3, profile.Id));

        var ok = result.Result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var response = ok!.Value as UserController.UserResponse;
        Assert.That(response!.Role, Is.EqualTo("learner"));
        Assert.That(response.TeamIds, Contains.Item(3));
        Assert.That(response.ProfileId, Is.EqualTo(profile.Id));
        Assert.That(response.ProfileName, Is.EqualTo("QA Engineer"));
    }

    // -------------------------------------------------------
    // DeactivateUser
    // -------------------------------------------------------

    [Test]
    public async Task DeactivateUser_WhenNotExists_ReturnsNotFound()
    {
        _userManager.FindByIdAsync("nonexistent").Returns((ForgeUser?)null);

        var result = await _sut.DeactivateUser("nonexistent");

        Assert.That(result, Is.TypeOf<NotFoundResult>());
    }

    [Test]
    public async Task DeactivateUser_SetsLockoutEndAndReturnsNoContent()
    {
        var user = MakeUser("Jane", "Doe", "jane@test.local");
        _userManager.FindByIdAsync(user.Id).Returns(user);
        _userManager.UpdateAsync(Arg.Any<ForgeUser>()).Returns(IdentityResult.Success);

        var result = await _sut.DeactivateUser(user.Id);

        Assert.That(result, Is.TypeOf<NoContentResult>());
        Assert.That(user.LockoutEnabled, Is.True);
        Assert.That(user.LockoutEnd, Is.EqualTo(DateTimeOffset.MaxValue));
        await _userManager.Received(1).UpdateAsync(user);
    }
}
