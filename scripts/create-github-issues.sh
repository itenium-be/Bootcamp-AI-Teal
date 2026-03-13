#!/usr/bin/env bash
# SkillForge — bulk-create GitHub Issues from .github/stories/
#
# Prerequisites:
#   gh auth login        (authenticate with GitHub)
#   gh auth status       (verify authentication)
#
# Usage:
#   bash scripts/create-github-issues.sh
#
# The script is idempotent for labels (--force flag).
# Issues are NOT idempotent — run once only, or use --dry-run to preview.
#
# Options:
#   --dry-run   Print what would be created without calling the API

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[dry-run] No GitHub API calls will be made."
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
if [[ -z "$REPO" && "$DRY_RUN" == "false" ]]; then
  echo "ERROR: Not inside a GitHub repo or not authenticated. Run 'gh auth login' first."
  exit 1
fi
echo "Target repo: ${REPO:-<dry-run>}"

# ---------------------------------------------------------------------------
# 1. Create labels
# ---------------------------------------------------------------------------
echo ""
echo "==> Creating labels..."

create_label() {
  local name="$1" color="$2" description="$3"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [dry-run] label: $name ($color)"
    return
  fi
  gh label create "$name" --color "$color" --description "$description" --force 2>/dev/null || true
}

# Epic labels (blue family)
create_label "epic:quick-wins"     "0075ca" "Epic: Quick Wins"
create_label "epic:skill-catalogue" "0075ca" "Epic: Skill Catalogue"
create_label "epic:roadmap"        "0075ca" "Epic: Skill Roadmap"
create_label "epic:goals"          "0075ca" "Epic: Goals"
create_label "epic:resources"      "0075ca" "Epic: Resource Library"
create_label "epic:coaching"       "0075ca" "Epic: Coaching"
create_label "epic:live-session"   "0075ca" "Epic: Live Session Mode"
create_label "epic:admin"          "0075ca" "Epic: Admin"
create_label "epic:seniority"      "0075ca" "Epic: Seniority"

# Size labels (yellow family)
create_label "size:S" "fbca04" "Small story (~1 day)"
create_label "size:M" "e4a000" "Medium story (~2-3 days)"
create_label "size:L" "d93f0b" "Large story (~4-5 days)"

# Team labels (green family)
create_label "team:1" "0e8a16" "Team 1"
create_label "team:2" "0e8a16" "Team 2"
create_label "team:3" "0e8a16" "Team 3"
create_label "team:4" "0e8a16" "Team 4"
create_label "team:5" "0e8a16" "Team 5"
create_label "team:6" "0e8a16" "Team 6"

echo "Labels done."

# ---------------------------------------------------------------------------
# 2. Helper: create one issue
# ---------------------------------------------------------------------------
create_issue() {
  local story_num="$1" title="$2" labels="$3"
  local story_file=".github/stories/story-${story_num}.md"

  if [[ ! -f "$story_file" ]]; then
    echo "  WARNING: $story_file not found, skipping story $story_num"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [dry-run] issue: Story ${story_num}: ${title} [${labels}]"
    return
  fi

  local issue_url
  issue_url=$(gh issue create \
    --title "Story ${story_num}: ${title}" \
    --body "$(cat "$story_file")" \
    --label "$labels")
  echo "  Created: $issue_url"
}

# ---------------------------------------------------------------------------
# 3. Create all 22 issues
# ---------------------------------------------------------------------------
echo ""
echo "==> Creating issues..."

# Epic 0: Quick Wins
create_issue 1  "Course CRUD UI"           "epic:quick-wins,size:S,team:1"
create_issue 2  "Course Catalog Page"      "epic:quick-wins,size:S,team:1"
create_issue 3  "Live Dashboard Stats"     "epic:quick-wins,size:S,team:1"

# Epic 1: Skill Catalogue
create_issue 4  "Skill Data Model"         "epic:skill-catalogue,size:M,team:1"
create_issue 5  "Skill Catalogue API"      "epic:skill-catalogue,size:M,team:1"
create_issue 6  "Skill Catalogue Admin UI" "epic:skill-catalogue,size:M,team:1"

# Epic 2: Skill Roadmap
create_issue 7  "Profile Assignment"           "epic:roadmap,size:S,team:2"
create_issue 8  "Consultant Skill Level Model" "epic:roadmap,size:M,team:2"
create_issue 9  "Roadmap Consultant View"      "epic:roadmap,size:L,team:2"
create_issue 10 "Skill Level Validation"       "epic:roadmap,size:M,team:2"

# Epic 3: Goals
create_issue 11 "Goal Data Model & API"    "epic:goals,size:M,team:3"
create_issue 12 "Goals Consultant View"    "epic:goals,size:M,team:3"
create_issue 13 "Coach Goal Setting"       "epic:goals,size:M,team:3"

# Epic 4: Resource Library
create_issue 14 "Resource Data Model & API" "epic:resources,size:M,team:4"
create_issue 15 "Resource Library UI"       "epic:resources,size:M,team:4"

# Epic 5: Coaching
create_issue 16 "Readiness Flag"      "epic:coaching,size:S,team:5"
create_issue 17 "Coach Dashboard"     "epic:coaching,size:M,team:5"
create_issue 18 "Team Members Page"   "epic:coaching,size:M,team:5"

# Epic 6: Live Session Mode
create_issue 19 "Live Session Mode"   "epic:live-session,size:M,team:6"

# Epic 7: Admin
create_issue 20 "User Management UI"  "epic:admin,size:M,team:6"
create_issue 21 "Team Management UI"  "epic:admin,size:S,team:6"

# Epic 8: Seniority
create_issue 22 "Seniority Threshold Rules" "epic:seniority,size:M,team:6"

echo ""
echo "==> All done!"
echo ""
echo "Next steps:"
echo "  1. Create a GitHub Project board at: https://github.com/${REPO:-<owner>/<repo>}/projects/new"
echo "  2. Add all issues to the board (Backlog column)"
echo "  3. Assign teams to sub-projects or milestones"
echo "  4. Each team: gh issue list --label team:N to see their stories"
echo ""
echo "Useful queries:"
echo "  gh issue list --label epic:quick-wins"
echo "  gh issue list --label team:1"
echo "  gh issue list --label size:L"
