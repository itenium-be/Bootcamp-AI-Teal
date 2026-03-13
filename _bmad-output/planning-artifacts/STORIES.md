# SkillForge — User Stories

> Source of truth for all MVP user stories. Each story maps to one GitHub Issue.
> Run `bash scripts/create-github-issues.sh` to bulk-create all issues.

---

## Team Division

> **Story 4 is a Day 0 mob session** — all teams implement it together before diverging. It unblocks Teams 2, 3, and 4 immediately.
> **Contract-first development** — `src/api/types.ts` defines all TypeScript interfaces. Frontend teams can build UI with placeholder/mock data and swap in real API calls once the backend story merges.

| Team | Stories | First available | Notes |
|------|---------|-----------------|-------|
| 1 | #1 #2 #3 #5 #6 | Immediately | #4 done as mob warmup |
| 2 | #7 #8 #9 #10 #18 | After mob (Story 4) | #18 moved here (depends on #8) |
| 3 | #11 #12 #13 | After mob (Story 4) | |
| 4 | #14 #15 | After mob (Story 4) | |
| 5 | #16 #17 | After Team 3 finishes #11 | Start with frontend shells on day 1 |
| 6 | #19 #20 #21 #22 | #20 #21 immediately; #19 #22 after Team 2 | |

### Wave Overview

| Wave | Trigger | Stories that unlock |
|------|---------|---------------------|
| 0 | Day 0 mob | #4 (all teams together) |
| 1 | Mob complete | #1 #2 #3 #5 (T1), #7 #8 (T2), #11 #14 (T3/T4), #20 #21 (T6) |
| 2 | After #8 | #9 #10 #18 #22 |
| 3 | After #10 | #19 |
| 4 | After #11 | #12 #13 #16 |
| 5 | After #16 | #17 |

---

## Epic 0: Quick Wins — `epic:quick-wins`

### Story 1 — Course CRUD UI `size:S` `team:1`

**As a** backoffice user, **I want** to create, edit, and delete courses from the UI, **so that** I don't need to use the API directly.

**Acceptance Criteria**
- [ ] "Add Course" button opens a modal form (Name, Description, Category, Level)
- [ ] Inline "Edit" and "Delete" actions on each table row
- [ ] Confirmation dialog before delete
- [ ] Form validates with Zod; errors shown inline
- [ ] Toast on success/failure
- [ ] Vitest tests for form; backend tests already exist

---

### Story 2 — Course Catalog Page `size:S` `team:1`

**As a** any authenticated user, **I want** to browse available courses at `/catalog`, **so that** I can see what learning is available.

**Acceptance Criteria**
- [ ] Card grid listing all courses
- [ ] Filter by Category and Level
- [ ] Route `/catalog` added to TanStack Router
- [ ] Vitest test for filter logic

---

### Story 3 — Live Dashboard Stats `size:S` `team:1`

**As a** any user, **I want** the dashboard to show real numbers, **so that** I can trust what I see.

**Acceptance Criteria**
- [ ] Replace hardcoded stats with API calls
- [ ] Counts: total courses, active consultants, active goals
- [ ] Vitest test for stats component

---

## Epic 1: Skill Catalogue — `epic:skill-catalogue`

### Story 4 — Skill Data Model `size:M` `team:all` ⚡ Day 0 Mob Session

**As a** developer, **I want** SkillEntity + SkillProfileEntity with EF migration, **so that** the rest of the domain has a foundation.

**Acceptance Criteria**
- [ ] `SkillEntity`: Id, Name, Category, Description, LevelCount (1–5), IsUniversal, ProfileId (nullable)
- [ ] `SkillProfileEntity`: Id, Name
- [ ] `SkillDependencyEntity`: SkillId → PrerequisiteSkillId
- [ ] EF migration + seed data (3–5 skills per profile, 3 universal)
- [ ] Testcontainers NUnit tests

---

### Story 5 — Skill Catalogue API `size:M` `team:1`

**As a** backoffice user, **I want** REST endpoints to manage skills, **so that** the catalogue can be maintained.

**Acceptance Criteria**
- [ ] `GET/POST /api/skill`, `GET/PUT/DELETE /api/skill/{id}`
- [ ] `GET/POST /api/skill-profile`, `GET/PUT/DELETE /api/skill-profile/{id}`
- [ ] `POST /api/skill/{id}/dependencies`
- [ ] Requires `backoffice` role
- [ ] NUnit tests

**Dependencies:** Story 4

---

### Story 6 — Skill Catalogue Admin UI `size:M` `team:1`

**As a** backoffice user, **I want** to manage skills and profiles at `/admin/skills`, **so that** I can curate the catalogue.

**Acceptance Criteria**
- [ ] CRUD table with Create/Edit/Delete modals
- [ ] Assign skills to profile or mark Universal
- [ ] Set LevelCount + level descriptors
- [ ] Multi-select for prerequisite links

**Dependencies:** Story 5

---

## Epic 2: Skill Roadmap — `epic:roadmap`

### Story 7 — Profile Assignment `size:S` `team:2`

**As a** coach, **I want** to assign a skill profile to a consultant, **so that** their roadmap shows relevant skills.

**Acceptance Criteria**
- [ ] Profile dropdown on team member list/detail
- [ ] `PUT /api/user/{id}/profile` endpoint
- [ ] Profile stored on `ForgeUser`

**Dependencies:** Story 4

---

### Story 8 — Consultant Skill Level Model `size:M` `team:2`

**As a** developer, **I want** a ConsultantSkillLevel entity, **so that** each consultant's current level per skill can be stored.

**Acceptance Criteria**
- [ ] `ConsultantSkillLevelEntity`: ConsultantId, SkillId, CurrentLevel (0 = not started)
- [ ] `GET /api/roadmap/{consultantId}` — skills grouped by category with current level + next milestone
- [ ] Coach + self-access only
- [ ] NUnit tests

**Dependencies:** Story 4

---

### Story 9 — Roadmap Consultant View `size:L` `team:2`

**As a** consultant, **I want** to see my skill roadmap at `/my-progress`, **so that** I know where I stand and what's next.

**Acceptance Criteria**
- [ ] Shows anchors (level ≥ 1) + next-tier skills
- [ ] "Show all skills" toggle
- [ ] Inline dependency warning when prerequisite unmet
- [ ] Skill cards: current level / total levels

**Dependencies:** Story 8

---

### Story 10 — Skill Level Validation `size:M` `team:2`

**As a** coach, **I want** to set a consultant's skill level, **so that** progress reflects real demonstrated ability.

**Acceptance Criteria**
- [ ] Per-skill "Set Level" control on `/team/members/{id}`
- [ ] Saves to ConsultantSkillLevel
- [ ] Read-only for consultant

**Dependencies:** Story 8

---

## Epic 3: Goals — `epic:goals`

### Story 11 — Goal Data Model & API `size:M` `team:3`

**As a** developer, **I want** a GoalEntity and CRUD API, **so that** coaches can assign goals.

**Acceptance Criteria**
- [ ] `GoalEntity`: Id, ConsultantId, CoachId, SkillId, TargetLevel, Deadline, Notes, Status (Active/PendingReview/Completed/Archived)
- [ ] `GET /api/goal?consultantId=...`, `POST`, `PUT /{id}`, `DELETE /{id}`
- [ ] `PUT /api/goal/{id}/complete`
- [ ] Coach-only writes
- [ ] NUnit tests

**Dependencies:** Story 4

---

### Story 12 — Goals Consultant View `size:M` `team:3`

**As a** consultant, **I want** to see my active goals on my home page, **so that** I know what to focus on.

**Acceptance Criteria**
- [ ] Max 3 active goals on dashboard (progressive disclosure)
- [ ] Goal card: skill, current→target level, deadline, linked resources
- [ ] "Mark Ready" button (readiness flag)
- [ ] Full list at `/my-courses`

**Dependencies:** Story 11

---

### Story 13 — Coach Goal Setting `size:M` `team:3`

**As a** coach, **I want** to create and edit goals for consultants, **so that** I can direct their growth.

**Acceptance Criteria**
- [ ] "Add Goal" on team member detail: skill picker, target level, deadline, notes (markdown)
- [ ] Edit + archive existing goals

**Dependencies:** Story 11

---

## Epic 4: Resource Library — `epic:resources`

### Story 14 — Resource Data Model & API `size:M` `team:4`

**As a** developer, **I want** a ResourceEntity linked to skills, **so that** learning materials can be attached to goals.

**Acceptance Criteria**
- [ ] `ResourceEntity`: Id, Title, URL, Type, SkillId, FromLevel, ToLevel, AddedByUserId
- [ ] `GET /api/resource?skillId=&fromLevel=`, `POST`, `PUT`, `DELETE`
- [ ] `POST /api/resource/{id}/rate` (thumbs up/down, one per user)
- [ ] `POST /api/resource/{id}/complete`
- [ ] NUnit tests

**Dependencies:** Story 4

---

### Story 15 — Resource Library UI `size:M` `team:4`

**As a** any user, **I want** to browse and add learning resources, **so that** I can find and share materials.

**Acceptance Criteria**
- [ ] Filter by skill, type, level range
- [ ] Add resource form
- [ ] Thumbs up/down rating
- [ ] Completed checkbox
- [ ] Resources shown inline on goal cards

**Dependencies:** Story 14

---

## Epic 5: Coaching — `epic:coaching`

### Story 16 — Readiness Flag `size:S` `team:5`

**As a** consultant, **I want** to signal "I'm ready" on a goal, **so that** my coach knows to validate me.

**Acceptance Criteria**
- [ ] "Mark Ready" on goal card → sets `ReadyAt`, status → PendingReview
- [ ] Button disabled until coach reviews (spam prevention)

**Dependencies:** Story 11

---

### Story 17 — Coach Dashboard `size:M` `team:5`

**As a** coach, **I want** a team overview on my dashboard, **so that** I see who needs attention.

**Acceptance Criteria**
- [ ] Summary cards: active goals, pending flags, inactive consultants (3+ weeks)
- [ ] Readiness flags list with age; "Review" action
- [ ] Inactive consultant list

**Dependencies:** Story 16

---

### Story 18 — Team Members Page `size:M` `team:2`

**As a** coach, **I want** to see all my consultants at `/team/members`, **so that** I can access each person's roadmap.

**Acceptance Criteria**
- [ ] Table: name, profile, active goals, last activity, flags
- [ ] Click-through to consultant roadmap + goals

**Dependencies:** Story 8

---

## Epic 6: Live Session Mode — `epic:live-session`

### Story 19 — Live Session Mode `size:M` `team:6`

**As a** coach, **I want** a focused session UI, **so that** I can run coaching sessions efficiently.

**Acceptance Criteria**
- [ ] "Start Session" from consultant detail → `/team/members/{id}/session`
- [ ] 2-tap skill level validation (increment/decrement)
- [ ] Inline notes per skill
- [ ] "Add Goal" shortcut
- [ ] "End Session" saves atomically and returns to team view

**Dependencies:** Story 10

---

## Epic 7: Admin — `epic:admin`

### Story 20 — User Management UI `size:M` `team:6`

**As a** backoffice admin, **I want** to create, edit, and deactivate users at `/admin/users`, **so that** I manage accounts.

**Acceptance Criteria**
- [ ] Table: name, email, role, team(s), profile, status
- [ ] Create: name, email, role, team, profile
- [ ] Edit role/team/profile
- [ ] Soft deactivate

---

### Story 21 — Team Management UI `size:S` `team:6`

**As a** backoffice admin, **I want** to manage teams at `/admin/teams`, **so that** structures stay up to date.

**Acceptance Criteria**
- [ ] Table with member count
- [ ] Create/rename/archive team
- [ ] Assign/remove members

---

## Epic 8: Seniority — `epic:seniority`

### Story 22 — Seniority Threshold Rules `size:M` `team:6`

**As a** coach, **I want** Junior/Medior/Senior thresholds per profile, **so that** I can see how close a consultant is to the next level.

**Acceptance Criteria**
- [ ] `SeniorityThresholdEntity`: ProfileId, Level, SkillId, RequiredLevel
- [ ] Admin UI to configure thresholds
- [ ] Roadmap view shows seniority badge + % to next
- [ ] `GET /api/roadmap/{consultantId}/seniority`

**Dependencies:** Story 8
