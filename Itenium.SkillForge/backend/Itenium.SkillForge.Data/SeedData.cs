using System.Security.Claims;
using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Itenium.SkillForge.Data;

public static class SeedData
{
    public static async Task SeedDevelopmentData(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await SeedTeams(db);
        await SeedCourses(db);
        await SeedSkillProfiles(db);
        await app.SeedTestUsers();
    }

    private static async Task SeedTeams(AppDbContext db)
    {
        if (!await db.Teams.AnyAsync())
        {
            db.Teams.AddRange(
                new TeamEntity { Name = "Java" },
                new TeamEntity { Name = ".NET" },
                new TeamEntity { Name = "PO & Analysis" },
                new TeamEntity { Name = "QA" });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedCourses(AppDbContext db)
    {
        if (!await db.Courses.AnyAsync())
        {
            db.Courses.AddRange(
                new CourseEntity { Name = "Introduction to Programming", Description = "Learn the basics of programming", Category = "Development", Level = "Beginner" },
                new CourseEntity { Name = "Advanced C#", Description = "Master C# programming language", Category = "Development", Level = "Advanced" },
                new CourseEntity { Name = "Cloud Architecture", Description = "Design scalable cloud solutions", Category = "Architecture", Level = "Intermediate" },
                new CourseEntity { Name = "Agile Project Management", Description = "Learn agile methodologies", Category = "Management", Level = "Beginner" });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedSkillProfiles(AppDbContext db)
    {
        if (await db.SkillProfiles.AnyAsync())
        {
            return;
        }

        // Universal skills (no profile)
        var universal = new[]
        {
            new SkillEntity { Name = "Communication", Description = "Effective written and verbal communication", IsUniversal = true, LevelCount = 3 },
            new SkillEntity { Name = "Problem Solving", Description = "Analytical and creative problem solving", IsUniversal = true, LevelCount = 4 },
            new SkillEntity { Name = "Agile/Scrum", Description = "Agile methodology and Scrum practices", IsUniversal = true, LevelCount = 3 },
        };
        db.Skills.AddRange(universal);

        // .NET Developer profile
        var dotnet = new SkillProfileEntity { Name = ".NET Developer" };
        db.SkillProfiles.Add(dotnet);
        await db.SaveChangesAsync();

        db.Skills.AddRange(
            new SkillEntity { Name = "C#", Category = "Language", Description = "C# language and ecosystem", LevelCount = 5, ProfileId = dotnet.Id },
            new SkillEntity { Name = "ASP.NET Core", Category = "Framework", Description = "Web API and MVC development", LevelCount = 4, ProfileId = dotnet.Id },
            new SkillEntity { Name = "Entity Framework Core", Category = "Framework", Description = "ORM and database migrations", LevelCount = 4, ProfileId = dotnet.Id },
            new SkillEntity { Name = "Azure", Category = "Cloud", Description = "Azure services and deployments", LevelCount = 3, ProfileId = dotnet.Id });

        // Java Developer profile
        var java = new SkillProfileEntity { Name = "Java Developer" };
        db.SkillProfiles.Add(java);
        await db.SaveChangesAsync();

        db.Skills.AddRange(
            new SkillEntity { Name = "Java", Category = "Language", Description = "Core Java and JVM ecosystem", LevelCount = 5, ProfileId = java.Id },
            new SkillEntity { Name = "Spring Boot", Category = "Framework", Description = "Spring Boot application development", LevelCount = 4, ProfileId = java.Id },
            new SkillEntity { Name = "Maven/Gradle", Category = "Tooling", Description = "Build tools and dependency management", LevelCount = 3, ProfileId = java.Id },
            new SkillEntity { Name = "JUnit & Mockito", Category = "Testing", Description = "Unit and integration testing", LevelCount = 3, ProfileId = java.Id });

        // QA Engineer profile
        var qa = new SkillProfileEntity { Name = "QA Engineer" };
        db.SkillProfiles.Add(qa);
        await db.SaveChangesAsync();

        db.Skills.AddRange(
            new SkillEntity { Name = "Test Automation", Category = "Testing", Description = "Automated test frameworks and strategies", LevelCount = 4, ProfileId = qa.Id },
            new SkillEntity { Name = "Manual Testing", Category = "Testing", Description = "Exploratory and manual test techniques", LevelCount = 3, ProfileId = qa.Id },
            new SkillEntity { Name = "Performance Testing", Category = "Testing", Description = "Load and performance testing tools", LevelCount = 3, ProfileId = qa.Id });

        await db.SaveChangesAsync();
    }

    private static async Task SeedTestUsers(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ForgeUser>>();

        // BackOffice admin - no team claim (manages all)
        if (await userManager.FindByEmailAsync("backoffice@test.local") == null)
        {
            var admin = new ForgeUser
            {
                UserName = "backoffice",
                Email = "backoffice@test.local",
                EmailConfirmed = true,
                FirstName = "BackOffice",
                LastName = "Admin"
            };
            var result = await userManager.CreateAsync(admin, "AdminPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRolesAsync(admin, ["backoffice"]);
            }
        }

        // Local user for Java team only
        if (await userManager.FindByEmailAsync("java@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "java",
                Email = "java@test.local",
                EmailConfirmed = true,
                FirstName = "Java",
                LastName = "Developer"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "manager");
                await userManager.AddClaimAsync(user, new Claim("team", "1")); // Java
            }
        }

        // Local user for .NET team only
        if (await userManager.FindByEmailAsync("dotnet@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "dotnet",
                Email = "dotnet@test.local",
                EmailConfirmed = true,
                FirstName = "DotNet",
                LastName = "Developer"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "manager");
                await userManager.AddClaimAsync(user, new Claim("team", "2")); // .NET
            }
        }

        // User with access to multiple teams (Java + .NET)
        if (await userManager.FindByEmailAsync("multi@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "multi",
                Email = "multi@test.local",
                EmailConfirmed = true,
                FirstName = "Multi",
                LastName = "Team"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "manager");
                await userManager.AddClaimAsync(user, new Claim("team", "1")); // Java
                await userManager.AddClaimAsync(user, new Claim("team", "2")); // .NET
            }
        }

        // Learner user - basic learner role
        if (await userManager.FindByEmailAsync("learner@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "learner",
                Email = "learner@test.local",
                EmailConfirmed = true,
                FirstName = "Test",
                LastName = "Learner"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "learner");
            }
        }
    }
}
