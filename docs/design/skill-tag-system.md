# Skill-Tag-Badge System — Design Sketch

**Status**: Design complete — types & rules defined; UI implementation pending.  
**Related PR**: https://github.com/7Spade/xuanwu-xxx/pull/25

---

## 1. Problem Statement

The `schedule` feature requires workspace managers to specify **what skills they need**
and the account layer to **match and assign personnel** from three pools:

| Pool | Model | Stored on |
|------|-------|-----------|
| Internal Teams | `Team` (type: `'internal'`) | `Account.teams[]` |
| Partner Teams | `Team` (type: `'external'`) | `Account.teams[]` |
| Individuals | `MemberReference` | `Account.members[]` |

To enable skill-based matching, every entity in these pools must be **tagged** with
proficiency-graded skills.

---

## 2. Core Vocabulary

Three domain types (see `src/domain-types/skill/skill.types.ts`):

| Type | Role | Stored on |
|------|------|-----------|
| `SkillTag` | Global library entry (what the skill is) | `Account.skillTags[]` |
| `SkillGrant` | Assignment of a skill + tier to an entity | `Team.skillGrants[]` / `MemberReference.skillGrants[]` |
| `SkillRequirement` | What a schedule proposal needs | `ScheduleItem.requiredSkills[]` |

```
Account (org)
  └─ skillTags: SkillTag[]           ← global library

  └─ teams: Team[]
       └─ skillGrants: SkillGrant[]  ← "this team has Electrical Work at Expert tier"

  └─ members: MemberReference[]
       └─ skillGrants: SkillGrant[]  ← "Alice has Project Management at Grandmaster tier"

Workspace
  └─ scheduleItems: ScheduleItem[]
       └─ requiredSkills: SkillRequirement[]
            ← "need 2× Electrical Work ≥ Expert"
```

---

## 3. Seven-Tier Proficiency Scale

| Tier | Label | XP Range (inclusive) | Colour (light) |
|------|-------|----------------------|----------------|
| 1 | Apprentice   | 0–74   | `#CCEDEB` |
| 2 | Journeyman   | 75–149 | `#A2C7C7` |
| 3 | Expert       | 150–224| `#78A1A3` |
| 4 | Artisan      | 225–299| `#4D7A7F` |
| 5 | **Grandmaster**  | 300–374| `#23545B` ← core colour |
| 6 | Legendary    | 375–449| `#17393E` |
| 7 | Titan        | 450–525| `#0A1F21` |

CSS custom properties are registered in `src/styles/globals.css` as
`--tier-N-<name>` (e.g. `--tier-3-expert`).  Dark-mode variants are also defined.

The tier palette derives from a single teal hue-ramp, darkening as rank increases,
so the darkest badges signal the rarest talent.

---

## 4. Domain Rules

Pure functions live in `src/domain-rules/skill/skill.rules.ts`:

| Function | Signature | Description |
|----------|-----------|-------------|
| `resolveSkillTier(xp)` | `(number) → SkillTier` | Derive tier from XP |
| `getTierDefinition(tier)` | `(SkillTier) → TierDefinition` | Full metadata for a tier |
| `getTierRank(tier)` | `(SkillTier) → number` | Numeric rank (1–7) |
| `tierSatisfies(granted, minimum)` | `(SkillTier, SkillTier) → boolean` | Does granted tier ≥ minimum? |
| `grantSatisfiesRequirement(grants, req)` | `(SkillGrant[], SkillRequirement) → boolean` | Does the entity meet a specific requirement? |

`TIER_DEFINITIONS` is the single source of truth for all tier metadata.

---

## 5. Firestore Schema Extension

### `organizations/{orgId}` (Account document)

```json
{
  "skillTags": [
    {
      "id": "tag-abc123",
      "name": "Electrical Work",
      "slug": "electrical-work",
      "category": "Construction",
      "createdAt": "<Timestamp>"
    }
  ]
}
```

### `organizations/{orgId}` — teams array element

```json
{
  "id": "team-xyz",
  "name": "Alpha Crew",
  "type": "internal",
  "memberIds": ["uid-1", "uid-2"],
  "skillGrants": [
    { "tagId": "tag-abc123", "tier": "expert", "xp": 180 }
  ]
}
```

### `organizations/{orgId}` — members array element

```json
{
  "id": "uid-1",
  "name": "Alice",
  "skillGrants": [
    { "tagId": "tag-abc123", "tier": "grandmaster", "xp": 310 }
  ]
}
```

### `scheduleItems/{itemId}` — or inline on ScheduleItem

```json
{
  "title": "Main Panel Upgrade",
  "requiredSkills": [
    { "tagId": "tag-abc123", "minimumTier": "expert", "quantity": 2 }
  ]
}
```

---

## 6. Matching Flow (Manual)

```
WorkspaceSchedule proposes item with requiredSkills
        ↓
AccountScheduleSection receives PROPOSAL
        ↓
Admin opens "Assign" panel
        ↓
System queries Account.teams + Account.members
  → filters by grantSatisfiesRequirement(entity.skillGrants, req)
        ↓
Admin selects entities → stored in ScheduleItem.assigneeIds
        ↓
Proposal approved → becomes OFFICIAL
```

---

## 7. AI-Agent Readiness

All identifiers are designed for semantic clarity:

- `SkillTier` literals (`'expert'`, `'grandmaster'`) are LLM-safe tokens
- `SkillTag.slug` (e.g. `"electrical-work"`) provides unambiguous tag identity
- `SkillRequirement.quantity` expresses headcount as a plain integer
- `tierSatisfies()` / `grantSatisfiesRequirement()` are pure, deterministic functions
  the AI can replicate in a prompt or call via a Genkit tool

Future Genkit flow entry point (not yet implemented):
```typescript
// genkit-flows/schedule/auto-assign.flow.ts
// input: ScheduleItem with requiredSkills
// output: suggested assigneeIds ranked by tier score
```

---

## 8. UI Component Plan (pending implementation)

| Component | Location (proposed) | Shadcn primitives |
|-----------|---------------------|-------------------|
| `SkillBadge` | `src/shared/shadcn-ui/skill-badge.tsx` (or view-modules) | `Badge` + CSS var |
| `SkillTagPicker` | `view-modules/schedule/_components/` | `Command` + `Badge` |
| `SkillGrantEditor` | account settings / member editor | `Command` + `Badge` + `Slider` |
| `SkillRequirementForm` | `WorkspaceSchedule` proposal dialog | `Command` + `Input` |

`SkillBadge` renders a `Badge` with inline style `backgroundColor: var(--tier-N-name)`
and a dark/light text colour derived from the tier rank (tiers 5–7 need white text).

---

## 9. Open Questions (for team discussion)

1. **Tag library granularity** — Should `category` be a fixed enum or a free string?  
   *Proposal*: Free string for now; enum after we see real usage patterns.

2. **XP vs. direct tier** — Should admins set XP or pick the tier directly?  
   *Proposal*: Direct tier selection in UI (simpler); store `xp` as the midpoint of
   the tier range for future precision. `resolveSkillTier(xp)` is the canonical source.

3. **Team-level vs. member-level grants** — When a team is assigned, should the system
   auto-resolve individual members for shift tracking?  
   *Proposal*: Out of scope for v1; teams are assigned as units.

4. **Firestore sub-collection vs. inline array** — `skillTags` is stored as an array
   on the org document. With many tags (hundreds), this may approach document size limits.  
   *Proposal*: Migrate to `/organizations/{orgId}/skillTags/{tagId}` sub-collection when
   tag count > 50.  The type definitions are sub-collection-compatible.
