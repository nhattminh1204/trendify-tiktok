# Feature: Audience Intelligence Module

## Purpose

Analyzes the audience of each connected TikTok account.
Generates AI-powered personas and identifies niche opportunities to help creators make better targeting decisions.

---

## Entities

### AudienceProfile
Demographic and behavioral snapshot of a social account's audience.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| social_account_id | UUID | FK → social_accounts |
| age_distribution | JSONB | `{"18-24": 0.42, "25-34": 0.31, ...}` |
| gender_split | JSONB | `{"female": 0.65, "male": 0.35}` |
| top_countries | JSONB | `[{"code": "US", "pct": 0.45}, ...]` |
| top_interests | JSONB | `["fitness", "nutrition", "lifestyle"]` |
| active_hours | JSONB | `{"monday": [18, 19, 20, 21], ...}` |
| analyzed_at | TIMESTAMPTZ | When this snapshot was taken |

### AudiencePersona
AI-generated representation of a typical audience member.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| social_account_id | UUID | Optional — can be cross-account |
| name | VARCHAR(255) | e.g., "Ambitious Alex" |
| description | TEXT | Narrative summary |
| demographics | JSONB | Age, gender, location |
| pain_points | JSONB | List of pain points |
| motivations | JSONB | List of motivations |
| content_preferences | JSONB | Preferred formats, topics, tone |
| generated_by_ai | BOOLEAN | |

---

## Business Rules

1. `AudienceRefreshJob` runs daily at 2 AM for each connected account
2. Manual refresh available but rate-limited (once per hour per account)
3. Persona generation costs AI tokens — check budget before generating
4. Up to 5 personas per social account (Phase 1)
5. Personas can be manually edited after AI generation
6. Niche discovery is derived from audience interests + trend data cross-reference

---

## Niche Discovery Logic

```
1. Extract top interests from AudienceProfile.top_interests
2. Cross-reference with TrendDetections that match those interests
3. Score each niche by: (audience match %) * (trend score) * (content gap factor)
4. Return top 5 niches with monetization potential assessment
```

Content gap factor: how many posts exist vs. how many the audience wants (estimated from engagement rates).

---

## Monetization Opportunities

For each identified niche, the system assesses:
- Typical CPM rates (from TikTok Creator Fund data)
- Brand partnership likelihood (based on niche category)
- Digital product potential (courses, presets, templates)
- Affiliate marketing suitability

Data sourced from: TikTok API analytics + AI knowledge about creator monetization.

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `AudienceProfileUpdatedEvent` | Profile re-analyzed | Content Brain (update persona context) |
| `PersonaGeneratedEvent` | New persona created | Content Brain (available for idea targeting) |

---

## Background Jobs

### AudienceRefreshJob
- Schedule: Daily at 2 AM
- Process:
  1. For each active social account
  2. Fetch audience analytics from TikTok API
  3. Update or create `audience_profiles` record
  4. Publish `AudienceProfileUpdatedEvent`

---

## Acceptance Criteria

### AC-1: Audience Profile Display
- [ ] Profile shows age distribution as a chart
- [ ] Profile shows top 5 countries
- [ ] Profile shows top 5 interests as tags
- [ ] Profile shows best posting hours as a weekly heatmap
- [ ] "Last analyzed" timestamp shown
- [ ] "Refresh now" button available (with cooldown)

### AC-2: Persona Generation
- [ ] User clicks "Generate Personas" → system uses audience data + AI
- [ ] Persona shows: name, narrative, demographics, pain points, motivations, content preferences
- [ ] User can edit any field on the persona after generation
- [ ] User can delete a persona
- [ ] Maximum 5 personas per account enforced with clear message

### AC-3: Niche Discovery
- [ ] At least 3 niche opportunities shown per account
- [ ] Each niche shows: name, audience match %, trend score, monetization potential label
- [ ] Clicking a niche shows relevant trending content examples

---

## Implementation Notes

- TikTok Audience Analytics requires `user.info.stats` scope in OAuth
- JSONB fields for flexible demographic data — structure documented above
- Persona AI prompt lives in `ai_prompts` with slug `audience.persona-generation`
- All AI calls for persona generation use `Standard` tier routing
