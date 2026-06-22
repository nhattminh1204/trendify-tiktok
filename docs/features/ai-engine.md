# Feature: AI Engine Module

## Purpose

Central orchestration layer for all AI operations in Trendify.
Manages prompt templates, provider routing, cost tracking, budget enforcement, and prompt evaluation.

No module calls an AI provider directly — all AI calls go through the AI Engine.

---

## Entities

### AIPrompt
A versioned prompt template.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | NULL = system-level prompt |
| name | VARCHAR(255) | Human-readable name |
| slug | VARCHAR(255) | Unique identifier used in code |
| version | INT | Increments on each update |
| template | TEXT | Prompt text with `{variable}` placeholders |
| provider | VARCHAR(50) | NULL = any provider |
| model | VARCHAR(100) | NULL = auto-route |
| max_tokens | INT | |
| temperature | DECIMAL(3,2) | |
| is_active | BOOLEAN | Only one version active per slug |

### AIUsageLog
Immutable record of every AI call.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| user_id | UUID | |
| correlation_id | UUID | |
| feature_context | VARCHAR(255) | e.g. 'content-brain.script-generation' |
| prompt_id | UUID | Which prompt version was used |
| provider | VARCHAR(50) | |
| model | VARCHAR(100) | |
| prompt_tokens | INT | |
| completion_tokens | INT | |
| estimated_cost_usd | DECIMAL(12,6) | |
| duration_ms | INT | |
| status | VARCHAR(50) | 'success', 'failed', 'budget_exceeded' |

---

## Provider Routing

Routing logic in `AIProviderRouter`:

```
1. Check prompt's explicit provider/model — if set, use it
2. If no explicit model, determine tier from feature_context
3. Route to cheapest model for that tier
4. If primary provider fails → fallback to secondary
5. If all providers fail → throw AIProviderUnavailableException
6. Log every routing decision
```

### Tier → Model Mapping

| Tier | Primary | Fallback |
|---|---|---|
| Micro | `gemini-flash-1.5` | `claude-haiku-4-5` |
| Standard | `gpt-4o-mini` | `claude-sonnet-4-6` |
| Premium | `gpt-4o` | `claude-opus-4-8` |

---

## Budget Enforcement

`TokenBudgetService` is called BEFORE every AI request:

```csharp
public async Task<BudgetCheckResult> CheckBudgetAsync(Guid tenantId, string featureContext)
{
    var monthlySpend = await _repository.GetMonthlySpendAsync(tenantId);
    var limit = await _planService.GetAIBudgetLimitAsync(tenantId);

    if (monthlySpend >= limit)
        return BudgetCheckResult.Exceeded(monthlySpend, limit);

    if (monthlySpend >= limit * 0.8m)
        return BudgetCheckResult.Warning(monthlySpend, limit);

    return BudgetCheckResult.Ok(monthlySpend, limit);
}
```

If `Exceeded` → throw `AIBudgetExceededException` → API returns `429` with code `AI_BUDGET_EXCEEDED`.

---

## Prompt Management

- Prompts are loaded by `slug` at runtime — not hardcoded in services
- Prompt updates never overwrite existing records — always insert new version + deactivate old
- Prompt variables use `{variable_name}` syntax
- Variable injection is validated before sending — missing variables throw `PromptVariableMissingException`

Example:
```
Template: "Generate {count} content ideas for a TikTok creator in the {niche} niche. 
Audience persona: {persona_description}.
Recent winning patterns: {winning_patterns}."

Variables required: count, niche, persona_description, winning_patterns
```

---

## Prompt Evaluation

For each prompt, maintain an eval set of 10–20 golden examples.

### Evaluation Schema

```
ai_prompt_evaluations:
  id UUID PK
  prompt_id UUID
  input_variables JSONB
  expected_output TEXT
  actual_output TEXT
  score DECIMAL(5,2)    -- 0-100, human or AI-judged
  evaluated_at TIMESTAMPTZ
```

Evaluation runs:
- Automatically when a prompt version is created (regression test)
- Manually via `POST /ai/prompts/{id}/evaluate`
- Weekly batch via `PromptEvaluationJob`

---

## Business Rules

1. Every AI call must supply `feature_context`, `tenant_id`, `user_id`, `correlation_id` — no exceptions
2. Prompt slugs are the contract — changing a slug is a breaking change
3. A prompt with `is_active = false` cannot be used — throws at load time
4. Budget check happens before provider call — never after
5. Failed AI calls are logged with `status = 'failed'` but do NOT count against budget
6. Token costs are estimated at call time using published pricing — actual costs verified monthly

---

## Domain Events Published

None — AI Engine is purely a service layer, not a domain.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ai/prompts` | List all active prompts |
| POST | `/ai/prompts` | Create new prompt |
| PATCH | `/ai/prompts/{id}` | Update prompt (creates new version) |
| GET | `/ai/usage` | Usage summary by feature, date range |
| GET | `/ai/budget` | Current month spend vs. limit |
| GET | `/ai/usage/logs` | Detailed per-call log |

---

## Acceptance Criteria

### AC-1: Prompt Management
- [ ] Admin can view all active prompts with their version history
- [ ] Editing a prompt creates a new version, old version retained
- [ ] Prompt can be tested with sample variables before activating
- [ ] Rolling back to previous version is a one-click action

### AC-2: Cost Tracking
- [ ] Real-time cost dashboard shows spend by feature, by day
- [ ] Monthly spend shown with progress bar vs. budget limit
- [ ] Alert shown when spend reaches 80% of limit
- [ ] Per-request cost breakdown available in usage logs

### AC-3: Budget Enforcement
- [ ] API returns `429 AI_BUDGET_EXCEEDED` when limit hit
- [ ] User sees clear message in UI (not a generic error)
- [ ] Free tier budget resets on the 1st of each month

---

## Implementation Notes

- `IAIProvider` interface in `src/shared/` — `OpenAIProvider`, `AnthropicProvider`, `GeminiProvider` in `src/infrastructure/`
- `AIProviderRouter` in `src/infrastructure/AI/` handles routing and fallback
- `AICostCalculator` in `src/infrastructure/AI/` handles cost estimation per provider/model
- Pricing table is updated manually when providers change pricing — document in tech-debt if out of date
- All AI infrastructure code has integration tests using WireMock to simulate provider responses
