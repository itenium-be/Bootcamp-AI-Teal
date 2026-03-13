# SkillForge — Problem Description

> **Version**: 1.0 — 2026-03-13
> **Legend**: ✅ Confirmed fact | 🔷 Assumption | ❓ Open question

---

## Current Problem Statement

✅ Organizations (like Itenium) lack an internal platform to manage structured learning for employees across competence centers (teams). Course content, learner progress, and team-level assignments are not tracked in a unified system. SkillForge is being built to fill that gap.

---

## Business / User Need

✅ The organization needs to:
- Create and publish courses and learning paths for internal employees
- Assign learning content at the team level (per competence center)
- Track individual learner progress and completion
- Enforce role-based access (backoffice staff, team managers, learners)
- Support assessments to validate learning outcomes

🔷 This may also serve as a showcase/demo platform for the AI Bootcamp initiative itself.

---

## Intended Outcome

✅ A fully functional LMS where:
- Backoffice staff manage users, teams, and platform-wide content
- Team managers create/publish courses and track their team's progress
- Learners enroll in courses, complete lessons, and receive feedback on their progress
- Course content includes rich media (text, images, video, PDF, YouTube embeds)
- Quizzes/assessments validate learner knowledge with pass/fail criteria

---

## Actors Involved

| Actor | Role |
|-------|------|
| ✅ **Backoffice** | Platform admin — manages users, teams, global course catalog, analytics |
| ✅ **Manager** | Team manager — creates/publishes courses, assigns to team, tracks team progress |
| ✅ **Learner** | End user — browses/enrolls in courses, tracks personal progress, gives feedback |

---

## Scope

✅ **In scope (planned/partially built):**
- User authentication and role-based access control (OAuth/OpenID Connect via OpenIddict)
- Team (competence center) management
- Course CRUD — create, publish, archive courses
- Course structure: Modules → Courses → Lessons with rich content blocks
- Learner enrollment and progress tracking (per lesson, per course)
- Resume capability (pick up where you left off)
- Lesson status: New / Done / Later
- Quizzes/assessments with multiple question types
- Learner feedback on lessons and courses
- Internationalization (i18n)

✅ **Currently implemented:**
- Authentication (login, JWT, role-based routing)
- Course CRUD (backend + frontend listing)
- Team listing (role-filtered by manager)
- Dashboard, Settings pages
- Docker-based dev environment
- Integration test infrastructure (Testcontainers)

---

## Out of Scope

🔷 The following are assumed to be out of scope (not mentioned anywhere in the codebase or docs):
- External LMS integrations (SCORM, xAPI/Tin Can)
- Mobile native apps (web-only)
- Payment / subscription management
- Public/marketplace course catalog
- Real-time collaboration or live sessions
- Certificates of completion

❓ Confirm whether certificates of completion are planned.

---

## Constraints

✅ **Technical:**
- Frontend: React 19, TypeScript, Vite, Bun (not npm/yarn), TanStack Router, Zustand, Tailwind CSS v4
- Backend: .NET 10, ASP.NET Core, Entity Framework Core, PostgreSQL 17
- Auth: OpenIddict (OAuth/OpenID Connect)
- Containerized dev environment (Docker Compose required before running backend)
- TDD required — tests written before implementation (red/green)
- Pre-commit checks: lint + typecheck + test (frontend) and dotnet format + dotnet test (backend)
- Internal NuGet packages from GitHub Packages (`Itenium.Forge.*`)

🔷 **Organizational:**
- This is a bootcamp/learning project — some implementation choices may favor learning over production-grade concerns
- AI-assisted development is a first-class concern (see STRATEGY.md and BMAD methodology)

---

## Assumptions

🔷 The platform is primarily for internal use within a single organization (not multi-tenant SaaS).
🔷 Seed data (test users/teams) is sufficient for dev/demo; real user provisioning is a backoffice concern.
🔷 The `Itenium.Forge.*` shared libraries provide cross-cutting concerns (logging, security, health checks, Swagger) and are treated as stable dependencies.
🔷 The bootcamp context means features are built incrementally, driven by a backlog, not a fixed deadline.

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| ❓ 1 | Are certificates of completion planned? | Open |
| ❓ 2 | Is this single-tenant or will it eventually be multi-tenant? | Open |
| ❓ 3 | What is the target deployment environment (cloud provider, on-prem)? | Open |
| ❓ 4 | Is the `Itenium.Forge.*` package ecosystem versioned/stable or actively changing alongside this project? | Open |
| ❓ 5 | Are quizzes a blocking requirement for an initial release, or a phase 2 feature? | Open |
| ❓ 6 | Who owns the backlog/prioritization — the bootcamp facilitator or the project team? | Open |

---

## What Changed Since Previous Version

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-03-13 | Initial version — derived from codebase exploration (README, STRATEGY.md, BMAD.md, source code, backlog) |
