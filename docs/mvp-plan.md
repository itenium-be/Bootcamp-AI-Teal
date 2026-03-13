# SkillForge — MVP Implementation Plan

> **Version**: 1.1 — 2026-03-13
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

### Slice 0 — Foundation *(no user-visible feature; unblocks everything)*

| # | What | Where |
|---|------|-------|
| B1 | Create 7 entities + `GoalStatus` enum | `Entities/` |
| B2 | Add 7 DbSets to `AppDbContext` + unique index on `ReadinessFlagEntity(GoalId)` | `Data/AppDbContext.cs` |
| B3 | Run EF migration: `dotnet ef migrations add SkillForgeDomain` | `Data/Migrations/` |
| B4 | Seed: skills, Lea's goals (Active), resources, one readiness flag | `Data/SeedData.cs` |
| B5 | Extend `Capability` enum + `appsettings.json` RoleCapabilities | `Services/Capability.cs`, `WebApi/appsettings.json` |
| B6 | Add `IsManager` + `UserId` to `ISkillForgeUser`; implement in `SkillForgeUser` | `Services/` |
| F1 | Parse `role` claim from JWT in `authStore` + test | `stores/authStore.ts` |

**RoleCapabilities (appsettings.json):**
```json
"backoffice": ["ReadSkills","ManageSkills","ReadResources","ManageResources"],
"manager":    ["ReadSkills","ReadGoals","ManageGoals","ReadResources","ManageResources","ReadCoachDashboard","ValidateGoal"],
"learner":    ["ReadSkills","ReadGoals","ReadResources"]
```

---

### Slice 1 — Lea sees her Roadmap
> *"Logs in → sees Roadmap (coach-set goals, current + next tier)"*

| # | What | TDD |
|---|------|-----|
| B7 | `SkillController` — `GET /api/skill`, `GET /api/skill/{id}` | `SkillControllerTests` (red → green) |
| B8 | `GoalController` — `GET /api/goal` (filtered to current user) | `GoalControllerTests` (red → green) |
| F2 | `api/goals.ts` + `api/skills.ts` client functions | — |
| F3 | `Roadmap` page + route `_authenticated/roadmap.tsx` (groups goals by skill level; current tier + next tier) | — |
| F4 | Update `Layout.tsx` nav: show Roadmap for `learner` role | — |

---

### Slice 2 — Lea browses Resources for a goal
> *"Clicks into a goal → browses Resources filtered by skill"*

| # | What | TDD |
|---|------|-----|
| B9 | `ResourceController` — `GET /api/resource` (supports `?skillId=` filter) | `ResourceControllerTests` (red → green) |
| F5 | `api/resources.ts` client | — |
| F6 | `Resources` page + route `_authenticated/resources.tsx` (filtered by skill from goal context) | — |

---

### Slice 3 — Lea marks a resource complete
> *"Marks a resource complete"*

| # | What | TDD |
|---|------|-----|
| B10 | `ResourceController` — `POST /api/resource/{id}/complete` | extend `ResourceControllerTests` |
| F7 | "Mark complete" toggle in Resources page (optimistic update) | — |

---

### Slice 4 — Lea raises a Readiness Flag
> *"Raises a Readiness Flag on a goal ('I'm ready')"*

| # | What | TDD |
|---|------|-----|
| B11 | `ReadinessFlagController` — `POST /api/goal/{goalId}/flag` + `DELETE /api/goal/{goalId}/flag`; return 409 if flag already exists | `ReadinessFlagControllerTests` (red → green) |
| F8 | "I'm ready" button on Roadmap goal card; toggles flag state | — |

---

### Slice 5 — Nathalie sees Coach Dashboard
> *"Logs in → sees Coach Dashboard (consultants, flags, goal summary)"*

| # | What | TDD |
|---|------|-----|
| B12 | `CoachDashboardController` — `GET /api/coach/dashboard` (joins ForgeUser for names; returns consultants with flag counts + goal counts) | `CoachDashboardControllerTests` (red → green) |
| F9 | `api/coach.ts` client | — |
| F10 | `CoachDashboard` page + route `_authenticated/coach/index.tsx` | — |
| F11 | Update `Layout.tsx` nav: show Coach Dashboard for `manager` role | — |

---

### Slice 6 — Nathalie validates a skill + assigns a new goal
> *"Opens Live Session → 2-tap validates a skill → assigns a new goal"*

| # | What | TDD |
|---|------|-----|
| B13 | `GoalController` — `PUT /api/goal/{id}/status` (Active → ReadyForValidation → Validated) | extend `GoalControllerTests` |
| B14 | `GoalController` — `POST /api/goal` (assign new goal) | extend `GoalControllerTests` |
| B15 | `LiveSessionController` — `POST /api/coach/session` (records `CoachingSessionEntity`; validates goal in one request) | `LiveSessionControllerTests` (red → green) |
| F12 | `CoachConsultant` detail page + route `_authenticated/coach/$consultantId.tsx` | — |
| F13 | `LiveSession` modal — step 1: validate goal (2 taps); step 2: optional notes | — |
| F14 | `AssignGoal` form + route `_authenticated/coach/assign-goal.tsx` | — |

---

### Slice 7 — i18n
> *All pages translated*

| # | What |
|---|------|
| F15 | Add `en.json` + `nl.json` keys for all new pages (Roadmap, Resources, CoachDashboard, LiveSession, AssignGoal) |

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
| 1.1 | 2026-03-13 | Refined build sequence into 7 vertical slices mapped to user story steps |
| 1.0 | 2026-03-13 | Initial plan — derived from PRD, codebase exploration, and architecture analysis |
