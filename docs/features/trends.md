# Feature: Trend Intelligence Module

## Purpose

Automatically discovers, scores, and tracks trends on TikTok.
Alerts creators to trends before they peak so content can be created while momentum is still building.

---

## Entities

### TrendDetection
A trend signal discovered from TikTok data.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| keyword | VARCHAR(500) | Trend keyword or hashtag |
| platform | VARCHAR(50) | 'tiktok' |
| score | DECIMAL(5,2) | 0–100. Composite score |
| velocity | DECIMAL(10,2) | Rate of growth (posts/hour) |
| volume | BIGINT | Total posts/views using this trend |
| status | VARCHAR(50) | 'rising', 'peaking', 'declining', 'dead' |
| first_seen_at | TIMESTAMPTZ | When Trendify first detected it |
| peaked_at | TIMESTAMPTZ | When score was highest |

### TrendWatchlist
User's personal watchlist of tracked trends.

### CompetitorProfile
A TikTok account the user is monitoring for content strategy inspiration.

---

## Trend Score Algorithm (v1)

Score = weighted composite of:

```
score = (velocity_score * 0.40)
      + (volume_score * 0.25)
      + (engagement_rate_score * 0.20)
      + (recency_score * 0.15)
```

- `velocity_score`: normalized rate of growth in last 24 hours
- `volume_score`: log-normalized total post count
- `engagement_rate_score`: likes+comments+shares / views
- `recency_score`: freshness decay (trends > 7 days old penalized)

Score 80–100: Hot trend. Score 50–79: Rising. Score < 50: Watch or Dead.

---

## Business Rules

1. TrendScanJob runs every 15 minutes — pulls trending hashtags from TikTok API
2. A trend is "new" if no record exists for that keyword in the last 24 hours
3. Trend status transitions: `rising` → `peaking` → `declining` → `dead`
4. A trend can only go `dead`, never return to `rising`
5. Trends older than 90 days with status `dead` are archived to cold storage
6. Watchlist is per-tenant — not shared across workspaces
7. Competitor profiles are monitored for content patterns, not cloned

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `TrendDetectedEvent` | New high-score trend found | Content Brain (suggest angles) |
| `TrendPeakedEvent` | Trend hits its maximum score | — (notify user) |
| `TrendDecliningEvent` | Score drops > 20% from peak | — (notify user) |

---

## Background Jobs

### TrendScanJob
- Schedule: Every 15 minutes
- Process:
  1. Fetch trending hashtags from TikTok API (each connected account's niche)
  2. For each trend, calculate score
  3. Upsert `trend_detections` record
  4. Publish `TrendDetectedEvent` for high-score new trends (score > 70)
  5. Update status for existing trends

### CompetitorScanJob
- Schedule: Every 6 hours
- Process: Fetch recent posts from competitor profiles, extract keywords, feed into trend detection

---

## API Endpoints

See `docs/api-map.md#module-trend-intelligence`.

---

## Acceptance Criteria

### AC-1: Automatic Trend Detection
- [ ] `TrendScanJob` runs within 1 minute of its schedule
- [ ] A trend with score > 70 appears in the feed within 30 minutes of first detection
- [ ] Trend shows keyword, score, velocity, status, and first_seen_at
- [ ] Trends can be filtered by: status, platform, minimum score, date range

### AC-2: Trend Scoring
- [ ] Score displayed as a number 0–100 with a visual indicator (low/medium/high/hot)
- [ ] Velocity shown as "posts per hour" in human-readable format
- [ ] Score history chart available on trend detail page

### AC-3: Watchlist
- [ ] User can add any trend to watchlist in one click
- [ ] Watchlist shows real-time score updates
- [ ] User can add personal notes to a watchlist item

### AC-4: Competitor Monitoring
- [ ] User can add a TikTok username as a competitor
- [ ] System shows competitor's top-performing content keywords
- [ ] Competitor data refreshed every 6 hours

---

## Implementation Notes

- TikTok API rate limits: respect `X-RateLimit-*` response headers
- All TikTok API calls go through `TikTokApiClient` in `src/infrastructure/`
- Trend data for connected accounts is fetched per account's niche — not global trends
- Score algorithm is in `TrendScoringService` — isolated for easy iteration
