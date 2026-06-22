# Workers — Background Jobs

All Hangfire background job definitions live here.
Jobs are thin orchestrators — they call Application layer services, not infrastructure directly.

## Job Registry

| Job Class | Schedule | Module |
|---|---|---|
| `TrendScanJob` | Every 15 min | Trend Intelligence |
| `CompetitorScanJob` | Every 6 hours | Trend Intelligence |
| `AudienceRefreshJob` | Daily 2 AM | Audience Intelligence |
| `AnalyticsAggregationJob` | Every hour | Analytics |
| `AnalyticsArchiveJob` | Daily 4 AM | Analytics |
| `LearningAnalysisJob` | Daily 3 AM | Learning Engine |
| `ContentPipelineJob` | On demand | Content Factory |
| `AIUsageSummaryJob` | Daily midnight | AI Engine |
| `PromptEvaluationJob` | Weekly | AI Engine |
| `AccountSyncJob` | Every 6 hours | Accounts |

## Rules

1. Jobs must be idempotent — safe to re-run if they fail midway
2. Jobs log start, completion, and failure with correlation IDs
3. Jobs do NOT directly access the database — they call Application layer commands/queries
4. Long-running jobs report progress via Hangfire's `IJobCancellationToken`
