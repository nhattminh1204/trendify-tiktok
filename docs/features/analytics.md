# Feature: Analytics Module

## Purpose

Collects, stores, and presents performance metrics for all published content across connected TikTok accounts.
Gives creators a clear view of what's working and what's not.

---

## Entities

### ContentPost
A published TikTok post tracked by the system.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| social_account_id | UUID | FK → social_accounts |
| idea_id | UUID | FK → content_ideas (optional — manual posts won't have this) |
| platform_post_id | VARCHAR(255) | TikTok's internal post ID |
| caption | TEXT | |
| posted_at | TIMESTAMPTZ | Actual publish time on TikTok |

### PostMetrics
Snapshot of a post's performance at a point in time. Append-only.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| post_id | UUID | FK → content_posts |
| recorded_at | TIMESTAMPTZ | When this snapshot was taken |
| views | BIGINT | |
| likes | BIGINT | |
| comments | BIGINT | |
| shares | BIGINT | |
| saves | BIGINT | |
| watch_time_seconds | BIGINT | |
| revenue_usd | DECIMAL(12,4) | TikTok Creator Fund earnings |

---

## Business Rules

1. `AnalyticsAggregationJob` fetches fresh metrics every hour for all posts < 30 days old
2. Posts > 30 days old are refreshed once daily
3. Posts > 90 days old are refreshed once weekly (performance stabilizes)
4. Metrics are append-only — no updates to existing `post_metrics` rows
5. Dashboard shows latest metric snapshot per post (MAX `recorded_at`)
6. Engagement rate = `(likes + comments + shares + saves) / views`
7. All revenue stored in USD — currency conversion handled at ingestion
8. Posts that return 404 from TikTok API are marked as `deleted` on `content_posts`

---

## Aggregations

Pre-computed and cached (warm TTL: 10 minutes):

- Daily/weekly/monthly totals per account
- Top 10 posts by views, engagement rate, revenue
- Account growth (follower delta over time)
- Best performing niches
- Best performing posting times

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `PerformanceMilestoneReachedEvent` | Post hits 10k/100k/1M views | Learning (trigger pattern analysis) |
| `LowPerformanceDetectedEvent` | Post has < 100 views after 24 hours | Learning (record as negative signal) |

---

## Background Jobs

### AnalyticsAggregationJob
- Schedule: Every hour
- Process:
  1. Fetch posts needing refresh based on age tier
  2. Call TikTok API for latest metrics
  3. Insert new `post_metrics` row
  4. Check for performance milestones
  5. Publish relevant domain events

### AnalyticsArchiveJob
- Schedule: Daily at 4 AM
- Process: Aggregate `post_metrics` rows > 90 days old into weekly summaries, delete originals

---

## Acceptance Criteria

### AC-1: Analytics Dashboard
- [ ] Dashboard shows total views, likes, followers for last 30 days
- [ ] Each connected account has its own metrics section
- [ ] Charts show day-by-day trend lines
- [ ] "Last updated" timestamp shown

### AC-2: Post Performance List
- [ ] All posts listed with: thumbnail, views, engagement rate, revenue
- [ ] Sortable by: views, engagement rate, revenue, posted_at
- [ ] Filterable by: account, date range, niche
- [ ] Click post → detail page with full metric history chart

### AC-3: Revenue Tracking
- [ ] Revenue shown as USD total per account, per month
- [ ] Revenue per post displayed
- [ ] Revenue chart over time

### AC-4: Benchmarking
- [ ] Average engagement rate for this account vs. niche average
- [ ] Best posting time recommendation based on historical data
- [ ] Top-performing content categories identified

---

## Implementation Notes

- TikTok API requires `video.list` scope for post metrics
- Revenue data requires `creator.info.stats` scope
- `PostMetrics` table is append-only — use `INSERT`, never `UPDATE`
- Latest snapshot queries use: `WHERE post_id = ? ORDER BY recorded_at DESC LIMIT 1`
- Dashboard aggregates are cached in Redis (warm TTL) — invalidated by `AnalyticsAggregationJob`
- Watch time is stored as seconds; displayed as minutes:seconds in UI
