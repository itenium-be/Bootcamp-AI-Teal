using Itenium.Forge.Security.OpenIddict;
using Itenium.SkillForge.Entities;
using Microsoft.EntityFrameworkCore;

namespace Itenium.SkillForge.Data;

public class AppDbContext : ForgeIdentityDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TeamEntity> Teams => Set<TeamEntity>();
    public DbSet<CourseEntity> Courses => Set<CourseEntity>();
    public DbSet<SkillEntity> Skills => Set<SkillEntity>();
    public DbSet<ConsultantSkillEntity> ConsultantSkills => Set<ConsultantSkillEntity>();
    public DbSet<GoalEntity> Goals => Set<GoalEntity>();
    public DbSet<ReadinessFlagEntity> ReadinessFlags => Set<ReadinessFlagEntity>();
    public DbSet<ResourceEntity> Resources => Set<ResourceEntity>();
    public DbSet<ResourceCompletionEntity> ResourceCompletions => Set<ResourceCompletionEntity>();
    public DbSet<CoachingSessionEntity> CoachingSessions => Set<CoachingSessionEntity>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ReadinessFlagEntity>()
            .HasIndex(f => f.GoalId)
            .IsUnique();
    }
}
