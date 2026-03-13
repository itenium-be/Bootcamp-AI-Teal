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
    public DbSet<SkillProfileEntity> SkillProfiles => Set<SkillProfileEntity>();
    public DbSet<SkillEntity> Skills => Set<SkillEntity>();
    public DbSet<SkillDependencyEntity> SkillDependencies => Set<SkillDependencyEntity>();
    public DbSet<ConsultantSkillLevelEntity> ConsultantSkillLevels => Set<ConsultantSkillLevelEntity>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<SkillDependencyEntity>()
            .HasKey(d => new { d.SkillId, d.PrerequisiteSkillId });

        builder.Entity<SkillDependencyEntity>()
            .HasOne(d => d.Skill)
            .WithMany(s => s.Dependencies)
            .HasForeignKey(d => d.SkillId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<SkillDependencyEntity>()
            .HasOne(d => d.Prerequisite)
            .WithMany()
            .HasForeignKey(d => d.PrerequisiteSkillId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<SkillEntity>()
            .ToTable(t => t.HasCheckConstraint("CK_Skills_LevelCount", "\"LevelCount\" BETWEEN 1 AND 5"));

        builder.Entity<ForgeUser>()
            .Property<int?>("ProfileId");

        builder.Entity<ConsultantSkillLevelEntity>()
            .HasKey(l => new { l.ConsultantId, l.SkillId });

        builder.Entity<ConsultantSkillLevelEntity>()
            .HasOne(l => l.Skill)
            .WithMany()
            .HasForeignKey(l => l.SkillId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
