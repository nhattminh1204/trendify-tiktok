# Module: AI Engine

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/ai-engine.md](../../../docs/features/ai-engine.md)

## Responsibilities

- Prompt template management and versioning
- Cost-aware AI provider routing
- Token budget enforcement
- AI cost tracking and reporting
- Prompt evaluation

## Rules

- NO other module calls AI providers directly
- ALL AI calls go through `IAIProvider` in src/shared/
- ALL AI calls check budget via `TokenBudgetService` first

## Dependencies

- **Publishes events to:** None (pure service layer)
- **Consumes events from:** Accounts (`AccountCreatedEvent` — initialize default prompts)
- **Background jobs:** `AIUsageSummaryJob`, `PromptEvaluationJob`
