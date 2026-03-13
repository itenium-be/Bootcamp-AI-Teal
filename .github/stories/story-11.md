## Story

**As a** developer, **I want** a GoalEntity and CRUD API, **so that** coaches can assign goals.

## Acceptance Criteria

- [ ] `GoalEntity`: Id, ConsultantId, CoachId, SkillId, TargetLevel, Deadline, Notes, Status (Active/PendingReview/Completed/Archived)
- [ ] `GET /api/goal?consultantId=...`, `POST`, `PUT /{id}`, `DELETE /{id}`
- [ ] `PUT /api/goal/{id}/complete`
- [ ] Coach-only writes
- [ ] NUnit tests

## Epic
epic:goals

## Size
size:M

## Dependencies
Story 4
