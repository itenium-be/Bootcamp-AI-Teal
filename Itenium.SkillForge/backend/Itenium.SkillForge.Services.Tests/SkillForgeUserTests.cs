using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using NSubstitute;

namespace Itenium.SkillForge.Services.Tests;

[TestFixture]
public class SkillForgeUserTests
{
    private static readonly int[] ExpectedTeamIds = [1, 3, 5];
    private IHttpContextAccessor _httpContextAccessor = null!;

    [SetUp]
    public void Setup()
    {
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
    }

    [Test]
    public void IsBackOffice_WhenUserHasBackofficeRole_ReturnsTrue()
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "backoffice") };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsBackOffice;

        Assert.That(result, Is.True);
    }

    [Test]
    public void IsBackOffice_WhenUserDoesNotHaveBackofficeRole_ReturnsFalse()
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "learner") };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsBackOffice;

        Assert.That(result, Is.False);
    }

    [Test]
    public void IsBackOffice_WhenNoUser_ReturnsFalse()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsBackOffice;

        Assert.That(result, Is.False);
    }

    [Test]
    public void Teams_WhenUserHasTeamClaims_ReturnsTeamIds()
    {
        var claims = new List<Claim>
        {
            new("team", "1"),
            new("team", "3"),
            new("team", "5")
        };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.Teams;

        Assert.That(result, Is.EquivalentTo(ExpectedTeamIds));
    }

    [Test]
    public void Teams_WhenUserHasNoTeamClaims_ReturnsEmpty()
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "learner") };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.Teams;

        Assert.That(result, Is.Empty);
    }

    [Test]
    public void Teams_WhenNoUser_ReturnsEmpty()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.Teams;

        Assert.That(result, Is.Empty);
    }

    [Test]
    public void IsManager_WhenUserHasManagerRole_ReturnsTrue()
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "manager") };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsManager;

        Assert.That(result, Is.True);
    }

    [Test]
    public void IsManager_WhenUserDoesNotHaveManagerRole_ReturnsFalse()
    {
        var claims = new List<Claim> { new(ClaimTypes.Role, "learner") };
        SetupUser(claims);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsManager;

        Assert.That(result, Is.False);
    }

    [Test]
    public void IsManager_WhenNoUser_ReturnsFalse()
    {
        _httpContextAccessor.HttpContext.Returns((HttpContext?)null);
        var sut = new SkillForgeUser(_httpContextAccessor);

        var result = sut.IsManager;

        Assert.That(result, Is.False);
    }

    private void SetupUser(List<Claim> claims)
    {
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        var httpContext = new DefaultHttpContext { User = principal };
        _httpContextAccessor.HttpContext.Returns(httpContext);
    }
}
