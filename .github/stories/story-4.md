## Story

**As a** developer, **I want** SkillEntity + SkillProfileEntity with EF migration, **so that** the rest of the domain has a foundation.

## Acceptance Criteria

- [ ] `SkillEntity`: Id, Name, Category, Description, LevelCount (1–5), IsUniversal, ProfileId (nullable)
- [ ] `SkillProfileEntity`: Id, Name
- [ ] `SkillDependencyEntity`: SkillId → PrerequisiteSkillId
- [ ] EF migration + seed data (3–5 skills per profile, 3 universal)
- [ ] Testcontainers NUnit tests

## Epic
epic:skill-catalogue

## Size
size:M

## Dependencies
None
