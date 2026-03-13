# SkillForge — MVP Implementation Plan

> **Version**: 1.0 — 2026-03-13
> **Demo target**: Bootcamp demo, 2026-03-13
> **Status**: Planning

---

## Core Demo Journeys

Two journeys must work end-to-end for the demo to be meaningful:

**Lea (Consultant/Learner)**
1. Logs in → sees Roadmap (coach-set goals, current + next tier)
2. Clicks into a goal → browses Resources filtered by skill
3. Marks a resource complete
4. Raises a Readiness Flag on a goal ("I'm ready")

**Nathalie (Coach/Manager)**
1. Logs in → sees Coach Dashboard (consultants, flags, goal summary)
2. Opens Live Session with a consultant
3. 2-tap validates a skill (goal → Validated + coaching session record)
4. Assigns a new goal

---

## MVP Scope

### In scope (demo blockers)
| # | Capability |
|---|---|
| 1 | Authentication & Role-Based Access ✅ already done |
| 5 | Consultant Roadmap (progressive disclosure: current + next tier) |
| 6 | Active Goals View (coach-assigned, pre-populated via seed) |
| 7 | Resource Library (browse, link, mark complete) |
| 8 | Readiness Flag (one per goal) |
| 9 | Coach Dashboard (team overview: flags, goals count) |
| 10 | Live Session Mode (2-tap validate, notes, new goal) |

### Deferred (post-demo)
| # | Capability | Why |
|---|---|---|
| 2 | Global Skill Catalogue UI | Skills can be seeded; browseable UI adds no demo value |
| 3 | Skill Dependency Warnings | Non-blocking warning; zero impact on demo journeys |
| 4 | Skill Profile Assignment | `SkillProfile` entities not needed for Lea/Nathalie |
| 11 | Seniority Threshold Ruleset | Depends on SkillProfile; complex query |
| — | Resource Ratings | Nice-to-have |
| — | Consultant list management | Users exist via Identity |

---

## New Domain Entities

All go in `Itenium.SkillForge.Entities/`:

| Entity | Key fields |
|---|---|
| `SkillEntity` | Id, Name, Description, Category, MaxLevel=5 |
| `ConsultantSkillEntity` | Id, ConsultantId(string), SkillId, Level, ValidatedById, ValidatedAt |
| `GoalEntity` | Id, CoachId, ConsultantId, SkillId, TargetLevel, Status(enum), DueDate, CreatedAt |
| `ReadinessFlagEntity` | Id, GoalId (unique), RaisedAt |
| `ResourceEntity` | Id, Title, Url, Description, Category, ContributedById |
| `ResourceCompletionEntity` | Id, ConsultantId, ResourceId, CompletedAt |
| `CoachingSessionEntity` | Id, CoachId, ConsultantId, GoalId, Notes, SessionDate |

**Deferred entities:** `SkillPrerequisiteEntity`, `SkillProfileEntity`, `SkillProfileItemEntity`, `ResourceRatingEntity`

`GoalStatus` enum: `Active`, `ReadyForValidation`, `Validated`, `Abandoned`

> **Note:** ConsultantId/CoachId are `string` FKs to `ForgeUser.Id` — no navigation properties to `ForgeUser` since it lives in the external package.

---

## Build Sequence

### Backend

```
Step 1  Entities (no dependencies)
Step 2  AppDbContext — 7 new DbSets + unique index on ReadinessFlagEntity(GoalId)
Step 3  EF Migration — dotnet ef migrations add SkillForgeDomain
Step 4  SeedData — skills, goals for Lea, resources, one readiness flag
Step 5  Capability enum + appsettings.json RoleCapabilities
Step 6  ISkillForgeUser — add IsManager, UserId
Step 7  Controllers (TDD: test first, then implement)
        6a  SkillController        GET /api/skill, GET /api/skill/{id}
        6b  GoalController         GET /api/goal, POST /api/goal, PUT /api/goal/{id}/status
        6c  ResourceController     GET /api/resource, POST /api/resource/{id}/complete
        6d  ReadinessFlagController POST/DELETE /api/goal/{goalId}/flag
        6e  CoachDashboardController GET /api/coach/dashboard
        6f  LiveSessionController  POST /api/coach/session
```

**RoleCapabilities (appsettings.json):**
```json
"backoffice": ["ReadSkills","ManageSkills","ReadResources","ManageResources"],
"manager":    ["ReadSkills","ReadGoals","ManageGoals","ReadResources","ManageResources","ReadCoachDashboard","ValidateGoal"],
"learner":    ["ReadSkills","ReadGoals","ReadResources"]
```

### Frontend

```
Step F1  authStore — add role: 'backoffice'|'manager'|'learner' parsed from JWT
Step F2  API client files — api/goals.ts, api/resources.ts, api/coach.ts
Step F3  Roadmap page + route (_authenticated/roadmap.tsx)
Step F4  Resources page + route (_authenticated/resources.tsx)
Step F5  Coach Dashboard + route (_authenticated/coach/index.tsx)
Step F6  Coach Consultant detail + route (_authenticated/coach/$consultantId.tsx)
Step F7  Live Session modal (pages/LiveSession.tsx)
Step F8  Assign Goal form + route (_authenticated/coach/assign-goal.tsx)
Step F9  Layout.tsx — update nav for new routes per role
Step F10 i18n keys — en.json + nl.json for all new pages
```

---

## Files to Create

### Backend — new files
```
Itenium.SkillForge.Entities/SkillEntity.cs
Itenium.SkillForge.Entities/ConsultantSkillEntity.cs
Itenium.SkillForge.Entities/GoalEntity.cs
Itenium.SkillForge.Entities/ReadinessFlagEntity.cs
Itenium.SkillForge.Entities/ResourceEntity.cs
Itenium.SkillForge.Entities/ResourceCompletionEntity.cs
Itenium.SkillForge.Entities/CoachingSessionEntity.cs
Itenium.SkillForge.WebApi/Controllers/SkillController.cs
Itenium.SkillForge.WebApi/Controllers/GoalController.cs
Itenium.SkillForge.WebApi/Controllers/ReadinessFlagController.cs
Itenium.SkillForge.WebApi/Controllers/ResourceController.cs
Itenium.SkillForge.WebApi/Controllers/CoachDashboardController.cs
Itenium.SkillForge.WebApi/Controllers/LiveSessionController.cs
Itenium.SkillForge.WebApi.Tests/SkillControllerTests.cs
Itenium.SkillForge.WebApi.Tests/GoalControllerTests.cs
Itenium.SkillForge.WebApi.Tests/ReadinessFlagControllerTests.cs
Itenium.SkillForge.WebApi.Tests/ResourceControllerTests.cs
Itenium.SkillForge.WebApi.Tests/CoachDashboardControllerTests.cs
Itenium.SkillForge.WebApi.Tests/LiveSessionControllerTests.cs
```

### Backend — files to modify
```
Itenium.SkillForge.Data/AppDbContext.cs          add 7 DbSets + fluent config
Itenium.SkillForge.Data/SeedData.cs              seed skills, goals, resources, flag
Itenium.SkillForge.Services/Capability.cs        new capabilities
Itenium.SkillForge.Services/ISkillForgeUser.cs   add IsManager, UserId
Itenium.SkillForge.Services/SkillForgeUser.cs    implement IsManager
Itenium.SkillForge.WebApi/appsettings.json       RoleCapabilities
```

### Frontend — new files
```
frontend/src/api/goals.ts
frontend/src/api/resources.ts
frontend/src/api/coach.ts
frontend/src/pages/Roadmap.tsx
frontend/src/pages/Resources.tsx
frontend/src/pages/CoachDashboard.tsx
frontend/src/pages/CoachConsultant.tsx
frontend/src/pages/LiveSession.tsx
frontend/src/pages/AssignGoal.tsx
frontend/src/routes/_authenticated/roadmap.tsx
frontend/src/routes/_authenticated/resources.tsx
frontend/src/routes/_authenticated/coach/index.tsx
frontend/src/routes/_authenticated/coach/$consultantId.tsx
frontend/src/stores/__tests__/authStore-role.test.ts
```

### Frontend — files to modify
```
frontend/src/stores/authStore.ts      add role parsing from JWT
frontend/src/components/Layout.tsx    update nav per role
frontend/src/i18n/locales/en.json     new keys
frontend/src/i18n/locales/nl.json     new keys
```

---

## Key Design Decisions

| Decision | Choice | Why |
|---|---|---|
| Service layer | Skip for MVP; controllers call DbContext directly | Matches existing pattern; reduces file count |
| User names | Join `AppDbContext.Set<ForgeUser>()` in CoachDashboard | Simpler than extra frontend API call; ForgeUser is in the same DB |
| Single migration | All 7 entities in one migration | Fine for demo environment that resets |
| ConsultantId FKs | `string`, no EF navigation to ForgeUser | ForgeUser is in an external package |
| One flag per goal | Unique index on `ReadinessFlagEntity(GoalId)` | Enforced at DB level, 409 at API level |

---

## What Changed Since Previous Version

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-13 | Initial plan — derived from PRD, codebase exploration, and architecture analysis |
