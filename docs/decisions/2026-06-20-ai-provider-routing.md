# ADR: AI Provider Routing Strategy

- **Date:** 2026-06-20
- **Status:** Accepted

## Context

Trendify uses AI for: idea generation, script writing, persona creation, pattern description, and strategy building. Three providers are available (OpenAI, Anthropic, Google Gemini), each with different pricing, capabilities, and reliability.

Without a routing strategy, every AI call will use the most expensive model by default, which will make the product economically unviable at Phase 3 scale.

## Decision

Use **cost-aware tiered routing** with provider fallback.

- Define 3 complexity tiers: Micro, Standard, Premium
- Each tier maps to the cheapest model that delivers acceptable quality for that complexity
- Routing is defined per feature in the prompt template
- On primary provider failure, fallback to secondary provider in the same tier
- All routing decisions are logged

## Tier Definitions

| Tier | Use Case | Primary | Fallback |
|---|---|---|---|
| Micro | Short completions: tagging, scoring, CTA writing, hook writing (<200 output tokens) | `gemini-flash-1.5` | `claude-haiku-4-5` |
| Standard | Medium tasks: idea generation, persona summary, profile analysis (200-1000 output tokens) | `gpt-4o-mini` | `claude-sonnet-4-6` |
| Premium | Complex: full script, strategy, deep analysis (1000+ output tokens) | `gpt-4o` | `claude-opus-4-8` |

## Routing Logic

```
1. Load prompt template by slug
2. If prompt.model is set → use that model directly
3. Else → determine tier from feature_context lookup table
4. Select primary model for that tier
5. Call primary
6. On failure (timeout, rate limit, 5xx) → log warning → call fallback
7. On fallback failure → throw AIProviderUnavailableException
8. Log: provider used, tier, feature_context, reason for fallback (if any)
```

## Provider Priority Rationale

- Gemini Flash chosen for Micro tier: most cost-efficient for short tasks
- GPT-4o-mini chosen for Standard tier: best quality/price ratio for medium tasks
- GPT-4o chosen for Premium tier: most reliable for complex multi-step reasoning
- Anthropic models as fallbacks: good quality, different failure modes than OpenAI

## Alternatives Considered

### Always use the best model
- Simple implementation
- Rejected: cost is 10–50× higher than tiered routing; economically unsustainable at scale

### Let users choose the model
- Flexible
- Rejected for Phase 1: adds complexity to UX; most users don't know which model to choose; complicates cost budgeting

### Single provider only
- Simple operations
- Rejected: single point of failure; pricing changes from one provider would break the entire product

## Consequences

**Made easier:**
- AI cost per operation is predictable and bounded
- Provider outages affect only one tier's primary model
- Cost optimization is centralized — change routing table, not business code
- AI cost per feature can be calculated and budgeted

**Made harder:**
- Quality differences between tiers must be validated for each feature (prompt tuning required)
- Fallback adds latency (typically 1–3 seconds) when triggered
- Provider pricing changes require updating the routing table and cost calculator

## Cost Impact Estimate

Assuming 10,000 AI operations/month per tenant:
- Without routing (all Premium): ~$50–80/month
- With tiered routing (mix of Micro/Standard/Premium): ~$8–15/month
- Reduction: ~75–80% cost savings

This is the difference between a $20/month Pro plan being viable vs. requiring $50+/month pricing.
