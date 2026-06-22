# AI Cost Standards — Trendify

## Principle

Every AI feature has a defined cost budget. Unbounded AI spending is a business risk.
AI costs are tracked, alerted, and reported. No AI call is anonymous.

---

## Provider Routing Tiers

Route by task complexity to minimize cost while maintaining quality.

| Tier | Use Case | Preferred Models |
|---|---|---|
| Micro | Classification, tagging, scoring, short completions (< 200 tokens output) | `gemini-flash-1.5`, `claude-haiku-4-5` |
| Standard | Idea generation, hook writing, persona generation (200–1000 tokens output) | `gpt-4o-mini`, `claude-sonnet-4-6` |
| Premium | Full script generation, strategy building, deep analysis (1000+ tokens output) | `gpt-4o`, `claude-opus-4-8` |

Routing is defined per feature in `ai_prompts.model`. `NULL` model means auto-route by `AIProviderRouter`.

---

## Token Budget per Feature

These are soft limits per single operation call. Enforce with prompt engineering, not truncation.

| Feature | Max Input Tokens | Max Output Tokens | Tier |
|---|---|---|---|
| Idea generation (single) | 2,000 | 500 | Standard |
| Idea generation (batch x10) | 3,000 | 2,000 | Standard |
| Hook writing | 1,500 | 300 | Micro |
| Script generation (short < 60s) | 2,500 | 1,500 | Standard |
| Script generation (long > 60s) | 3,000 | 3,000 | Premium |
| CTA generation | 1,000 | 200 | Micro |
| Persona generation | 3,000 | 2,000 | Standard |
| Pattern analysis | 5,000 | 1,000 | Premium |
| Improvement recommendation | 4,000 | 800 | Standard |
| Trend scoring (AI-assisted) | 1,000 | 100 | Micro |
| Audience profile summary | 2,000 | 600 | Standard |

---

## Monthly Budget Tiers (Phase 3 SaaS)

| Plan | Monthly AI Budget (USD) | Hard Cap |
|---|---|---|
| Free | $2.00 | Yes — operations blocked when exceeded |
| Pro | $20.00 | Soft — alert at 80%, blocked at 110% |
| Agency | $100.00 | Soft — alert at 80%, blocked at 110% |

Budget enforcement is in `AIEngine.TokenBudgetService`. Any handler calling AI must check budget first.

---

## Every AI Call Must Include

```csharp
var result = await _aiProvider.CompleteAsync(new AIRequest
{
    Prompt = sanitizedPrompt,
    MaxTokens = AICostBudget.ScriptGeneration.MaxOutputTokens,
    FeatureContext = "content-brain.script-generation",  // required
    TenantId = _currentUser.TenantId,                    // required
    UserId = _currentUser.UserId,                        // required
    CorrelationId = _correlationId.Value                 // required
});
```

Missing any required field throws `AICallMissingContextException` at the infrastructure level.

---

## Cost Tracking

Every AI call is recorded in `ai_usage_logs` with:

```sql
provider            VARCHAR(50)   -- 'openai', 'anthropic', 'google'
model               VARCHAR(100)  -- 'gpt-4o-mini', 'claude-sonnet-4-6'
feature_context     VARCHAR(255)  -- 'content-brain.script-generation'
prompt_tokens       INT
completion_tokens   INT
estimated_cost_usd  DECIMAL(12,6)
tenant_id           UUID
user_id             UUID
correlation_id      UUID
status              VARCHAR(50)   -- 'success', 'failed', 'budget_exceeded'
```

---

## Cost Estimation Formula

Use provider-published token pricing. Updated when pricing changes.

```csharp
// Centralized in AICostCalculator.cs
public static decimal EstimateCost(string model, int promptTokens, int completionTokens)
{
    var pricing = ModelPricing[model]; // throws if unknown model
    return (promptTokens / 1_000_000m * pricing.InputPricePerMillion)
         + (completionTokens / 1_000_000m * pricing.OutputPricePerMillion);
}
```

---

## Fallback Chain

If the primary provider fails, fallback to secondary. Never fail silently.

```
Primary fails → Secondary → Log Warning + alert → Return error to user
```

Do NOT silently fall back to a more expensive model. Log the fallback and the reason.

---

## Prompt Versioning

- Every prompt template lives in `ai_prompts` table with `version INT`
- Updating a prompt creates a new record (version + 1), does not overwrite
- Old prompt versions are never deleted — they are used for evaluation and rollback
- `ai_usage_logs.prompt_id` references which version was used

---

## Evaluation

- Every prompt has an evaluation set: 10–20 golden input/output pairs
- Prompt changes require running the eval set before deployment
- Eval results stored in `ai_prompt_evaluations` table
- Regression threshold: new version must not score more than 10% worse than previous

---

## Cost Reporting

`AIUsageSummaryJob` runs daily at midnight and produces:
- Per-tenant daily/weekly/monthly spend
- Per-feature cost breakdown
- Provider comparison (which features would be cheaper on a different provider)

Internal admin dashboard (`/admin/ai-costs`) shows real-time spend.
