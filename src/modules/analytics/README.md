# Module: Analytics

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/analytics.md](../../../docs/features/analytics.md)

## Responsibilities

- Post metrics collection from TikTok API
- Performance aggregation and dashboarding
- Revenue tracking
- Performance benchmarking

## Dependencies

- **Publishes events to:** Learning Engine
- **Consumes events from:** Accounts (`SocialAccountConnectedEvent`), Content (`ContentIdeaPublishedEvent`)
- **Background jobs:** `AnalyticsAggregationJob`, `AnalyticsArchiveJob`
