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
        await SeedSkills(db);
        await app.SeedTestUsers();
        await SeedGoalsAndResources(app, db);
    }

    private static async Task SeedTeams(AppDbContext db)
    {
        if (!await db.Teams.AnyAsync())
        {
            db.Teams.AddRange(
                new TeamEntity { Id = 1, Name = "Java" },
                new TeamEntity { Id = 2, Name = ".NET" },
                new TeamEntity { Id = 3, Name = "PO & Analysis" },
                new TeamEntity { Id = 4, Name = "QA" });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedCourses(AppDbContext db)
    {
        if (!await db.Courses.AnyAsync())
        {
            db.Courses.AddRange(
                new CourseEntity { Id = 1, Name = "Introduction to Programming", Description = "Learn the basics of programming", Category = "Development", Level = "Beginner" },
                new CourseEntity { Id = 2, Name = "Advanced C#", Description = "Master C# programming language", Category = "Development", Level = "Advanced" },
                new CourseEntity { Id = 3, Name = "Cloud Architecture", Description = "Design scalable cloud solutions", Category = "Architecture", Level = "Intermediate" },
                new CourseEntity { Id = 4, Name = "Agile Project Management", Description = "Learn agile methodologies", Category = "Management", Level = "Beginner" });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedSkills(AppDbContext db)
    {
        if (!await db.Skills.AnyAsync())
        {
            db.Skills.AddRange(
                new SkillEntity { Id = 1, Name = "C#", Description = "C# programming language", Category = ".NET", MaxLevel = 5 },
                new SkillEntity { Id = 2, Name = ".NET Core", Description = "ASP.NET Core web framework", Category = ".NET", MaxLevel = 5 },
                new SkillEntity { Id = 3, Name = "Design Patterns", Description = "Software design patterns and principles", Category = "Architecture", MaxLevel = 5 },
                new SkillEntity { Id = 4, Name = "Entity Framework Core", Description = "ORM for .NET", Category = ".NET", MaxLevel = 5 },
                new SkillEntity { Id = 5, Name = "React", Description = "React frontend library", Category = "Frontend", MaxLevel = 5 });
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedGoalsAndResources(WebApplication app, AppDbContext db)
    {
        using var scope = app.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ForgeUser>>();

        var lea = await userManager.FindByEmailAsync("lea@test.local");
        var nathalie = await userManager.FindByEmailAsync("nathalie@test.local");

        if (lea == null || nathalie == null)
        {
            return;
        }

        if (!await db.Resources.AnyAsync())
        {
            db.Resources.AddRange(
                new ResourceEntity { Id = 1, Title = "C# in Depth", Url = "https://csharpindepth.com", Description = "Comprehensive C# book by Jon Skeet", Category = "Book", SkillId = 1 },
                new ResourceEntity { Id = 2, Title = "Microsoft C# Docs", Url = "https://learn.microsoft.com/en-us/dotnet/csharp/", Description = "Official C# documentation", Category = "Documentation", SkillId = 1 },
                new ResourceEntity { Id = 3, Title = "ASP.NET Core Tutorial", Url = "https://learn.microsoft.com/en-us/aspnet/core/", Description = "Official ASP.NET Core docs", Category = "Documentation", SkillId = 2 },
                new ResourceEntity { Id = 4, Title = "Refactoring Guru — Design Patterns", Url = "https://refactoring.guru/design-patterns", Description = "Visual guide to design patterns", Category = "Website", SkillId = 3 },
                new ResourceEntity { Id = 5, Title = "EF Core Getting Started", Url = "https://learn.microsoft.com/en-us/ef/core/get-started/", Description = "Official EF Core quickstart", Category = "Documentation", SkillId = 4 });
            await db.SaveChangesAsync();
        }

        if (!await db.Goals.AnyAsync())
        {
            db.Goals.AddRange(
                new GoalEntity { Id = 1, CoachId = nathalie.Id, ConsultantId = lea.Id, SkillId = 1, TargetLevel = 3, Status = GoalStatus.Active, DueDate = DateTime.UtcNow.AddMonths(2) },
                new GoalEntity { Id = 2, CoachId = nathalie.Id, ConsultantId = lea.Id, SkillId = 2, TargetLevel = 2, Status = GoalStatus.ReadyForValidation, DueDate = DateTime.UtcNow.AddMonths(1) },
                new GoalEntity { Id = 3, CoachId = nathalie.Id, ConsultantId = lea.Id, SkillId = 3, TargetLevel = 1, Status = GoalStatus.Active, DueDate = DateTime.UtcNow.AddMonths(3) });
            await db.SaveChangesAsync();
        }

        if (!await db.ReadinessFlags.AnyAsync())
        {
            db.ReadinessFlags.Add(new ReadinessFlagEntity { Id = 1, GoalId = 2, RaisedAt = DateTime.UtcNow.AddDays(-1) });
            await db.SaveChangesAsync();
        }
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

        // Lea - demo consultant/learner
        if (await userManager.FindByEmailAsync("lea@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "lea",
                Email = "lea@test.local",
                EmailConfirmed = true,
                FirstName = "Lea",
                LastName = "Consultant"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "learner");
            }
        }

        // Nathalie - demo coach/manager
        if (await userManager.FindByEmailAsync("nathalie@test.local") == null)
        {
            var user = new ForgeUser
            {
                UserName = "nathalie",
                Email = "nathalie@test.local",
                EmailConfirmed = true,
                FirstName = "Nathalie",
                LastName = "Coach"
            };
            var result = await userManager.CreateAsync(user, "UserPassword123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "manager");
            }
        }
    }
}
