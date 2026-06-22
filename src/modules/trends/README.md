# Module: Trend Intelligence

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/trends.md](../../../docs/features/trends.md)

## Responsibilities

- Automatic trend detection via TikTok API
- Trend scoring and velocity calculation
- Trend lifecycle tracking (rising → peaking → declining → dead)
- Competitor monitoring
- User watchlist management

## Internal Structure

```
trends/
  Domain/
    TrendDetection.cs
    TrendWatchlist.cs
    CompetitorProfile.cs
    TrendScoringService.cs
    TrendsErrors.cs
  Application/
    Commands/
    Queries/
    Events/
  Infrastructure/
    TrendsRepository.cs
    TrendsDbConfiguration.cs
  API/
    TrendsEndpoints.cs
    Requests/
    Responses/
```

## Dependencies

- **Publishes events to:** Content Brain, Learning Engine
- **Consumes events from:** None
- **Shared contracts used:** `ICurrentUser`, `ICacheService`, `IDomainEvent`
- **Background jobs:** `TrendScanJob`, `CompetitorScanJob`
