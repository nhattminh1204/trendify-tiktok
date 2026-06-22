# Feature: Learning Engine Module

## Purpose

Analyzes historical content performance to identify winning and losing patterns.
Generates improvement recommendations that feed back into Content Brain to make future content better.

The Learning Engine is the memory of the platform — it makes the system smarter over time.

---

## Entities

### ContentPattern
A detected pattern across historical content performance.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| pattern_type | VARCHAR(50) | 'winning', 'losing' |
| category | VARCHAR(100) | 'hook', 'length', 'posting_time', 'niche', 'cta', 'format' |
| description | TEXT | Human-readable description |
| confidence | DECIMAL(5,2) | 0–100. Based on evidence count |
| evidence_count | INT | Number of posts supporting this pattern |

Example patterns:
- Winning: "Hooks starting with a question have 2.3x higher retention" (confidence: 87, evidence: 45)
- Losing: "Videos over 60 seconds in the fitness niche have 40% lower completion rate" (confidence: 72, evidence: 28)

### ImprovementRecommendation
An actionable suggestion derived from detected patterns.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| social_account_id | UUID | Optional — account-specific or global |
| title | VARCHAR(500) | Brief recommendation |
| description | TEXT | Full explanation with evidence |
| priority | VARCHAR(20) | 'low', 'medium', 'high', 'critical' |
| status | VARCHAR(50) | 'active', 'applied', 'dismissed' |
| based_on_pattern_ids | UUID[] | Array of pattern IDs that generated this |

---

## Business Rules

1. `LearningAnalysisJob` runs daily at 3 AM — requires ≥ 10 posts with metrics to run meaningfully
2. Patterns require evidence_count ≥ 5 to be surfaced to users
3. Confidence < 50% patterns are stored but not shown in UI (used for internal accumulation)
4. A recommendation has `status = 'applied'` only when user marks it so — system cannot auto-apply
5. Dismissed recommendations are hidden for 30 days, then resurface if still valid
6. Learning Engine injects top 3 winning patterns into Content Brain idea generation prompt context
7. Patterns are per-tenant — no cross-tenant learning (Phase 4 handles aggregated insights)

---

## Pattern Detection Approach

```
Input data:
- All content_posts with ≥1 post_metrics snapshot
- Associated content_ideas (hook, script, niche, length, posting_time)
- Computed engagement rates, retention, revenue

Analysis steps:
1. Segment posts by: niche, hook_type, script_length, posting_hour, cta_type
2. For each segment, calculate: avg_views, avg_engagement_rate, avg_completion_rate
3. Compare segment performance against account baseline
4. Segments > 50% above baseline → candidate winning pattern
5. Segments > 30% below baseline → candidate losing pattern
6. AI-assisted pattern description generation (Premium tier)
7. Store patterns with evidence count
```

---

## Domain Events Consumed

| Event | Source | Action |
|---|---|---|
| `ContentIdeaPublishedEvent` | Content Brain | Record idea metadata for future learning |
| `PerformanceMilestoneReachedEvent` | Analytics | Trigger pattern analysis for high-performer |
| `LowPerformanceDetectedEvent` | Analytics | Trigger analysis for under-performer |

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `ImprovementRecommendationGeneratedEvent` | New recommendations created | Content Brain (inject into AI context) |

---

## Background Jobs

### LearningAnalysisJob
- Schedule: Daily at 3 AM
- Process:
  1. Fetch all posts with metrics for this tenant
  2. Run pattern detection algorithm
  3. Upsert `content_patterns` (update confidence + evidence_count if pattern exists)
  4. Generate new recommendations from high-confidence patterns
  5. Publish `ImprovementRecommendationGeneratedEvent`

---

## Acceptance Criteria

### AC-1: Pattern Display
- [ ] Winning patterns shown with: description, confidence bar, evidence count
- [ ] Losing patterns shown with: description, confidence bar, evidence count
- [ ] Patterns categorized by type (hook, length, posting time, niche, etc.)
- [ ] Patterns only shown when evidence_count ≥ 5

### AC-2: Recommendations
- [ ] Recommendations listed with priority badge (Critical / High / Medium / Low)
- [ ] Each recommendation links to the pattern evidence (which posts support it)
- [ ] User can mark recommendation as "Applied" or "Dismiss for 30 days"
- [ ] Applied recommendations feed back into Content Brain context

### AC-3: Learning Feedback Loop
- [ ] When generating content ideas, system uses top 3 winning patterns as context
- [ ] After user marks recommendation as applied, system tracks if next content improves
- [ ] "Insights" section on dashboard shows 3 most actionable recommendations

---

## Implementation Notes

- Pattern detection algorithm is in `PatternDetectionService` — isolated and testable
- AI is used only for: generating human-readable descriptions of patterns (not for detecting them)
- Pattern detection is statistical — deterministic, not AI-dependent
- Minimum dataset: ≥10 posts required. Below this, show "Not enough data yet" message
- Cross-account patterns (across all accounts in a workspace) are calculated separately from per-account patterns
