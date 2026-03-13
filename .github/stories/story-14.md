## Story

**As a** developer, **I want** a ResourceEntity linked to skills, **so that** learning materials can be attached to goals.

## Acceptance Criteria

- [ ] `ResourceEntity`: Id, Title, URL, Type, SkillId, FromLevel, ToLevel, AddedByUserId
- [ ] `GET /api/resource?skillId=&fromLevel=`, `POST`, `PUT`, `DELETE`
- [ ] `POST /api/resource/{id}/rate` (thumbs up/down, one per user)
- [ ] `POST /api/resource/{id}/complete`
- [ ] NUnit tests

## Epic
epic:resources

## Size
size:M

## Dependencies
Story 4
