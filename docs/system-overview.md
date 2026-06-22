# System Overview — Trendify

## What Is Trendify?

Trendify is an AI-powered Creator Operating System. It helps content creators manage multiple accounts, discover trends, understand their audience, generate content ideas, produce content, analyze performance, and continuously improve — all from a single platform.

The system is designed to become a creator's entire operational brain.

---

## Product Vision

> From personal tool → Team workspace → Public SaaS → Creator Intelligence Platform

### Phase 1 — Personal Productivity Tool
Single user. Full feature set. No multi-tenancy complexity. Focus on core value delivery.

Target: 1 creator managing up to 10 TikTok accounts.

### Phase 2 — Team Collaboration
Small teams (2–10 users). Shared workspaces. Role-based permissions. Collaborative content workflows.

Target: Creator agencies and small media teams.

### Phase 3 — Public SaaS
Multi-tenant. Subscription billing. Onboarding flows. Public API. Support infrastructure.

Target: 100–10,000 paying creators.

### Phase 4 — Creator Intelligence Platform
Aggregated trend intelligence. Industry benchmarking. Creator economy data marketplace. AI-generated playbooks per niche.

Target: The operating system for the creator economy.

---

## Business Goals

Help creators:
- Manage multiple accounts from one dashboard
- Discover trends before they peak
- Identify their most profitable audience segments
- Generate content ideas on demand
- Create scripts, hooks, and CTAs with AI assistance
- Analyze what content performs and why
- Learn from historical content to improve future content
- Automate repetitive workflows

---

## System Modules

```
┌─────────────────────────────────────────────────────────────┐
│                     Trendify Platform                        │
├──────────────┬──────────────────┬───────────────────────────┤
│   Accounts   │ Trend Intelligence│   Audience Intelligence  │
├──────────────┼──────────────────┼───────────────────────────┤
│ Content Brain│ Content Factory  │       Analytics           │
├──────────────┴──────────────────┴───────────────────────────┤
│                    Learning Engine                           │
├─────────────────────────────────────────────────────────────┤
│                      AI Engine                              │
├─────────────────────────────────────────────────────────────┤
│         Shared Infrastructure (Auth, Cache, Events)         │
└─────────────────────────────────────────────────────────────┘
```

### Accounts
- Multi-account management
- Account grouping and profiles
- Permissions and access control
- Platform credential management (TikTok OAuth)

### Audience Intelligence
- Audience demographic analysis
- Persona generation
- Niche discovery
- Monetization opportunity identification

### Trend Intelligence
- Real-time trend detection
- Trend scoring and velocity tracking
- Competitor monitoring
- Trend lifecycle analysis

### Content Brain
- AI-powered idea generation
- Hook writing
- Script generation
- CTA recommendations
- Content strategy building

### Content Factory
- Content production pipelines
- Voice/audio generation
- Subtitle generation
- Media asset management

### Analytics
- Views, engagement, retention metrics
- Revenue tracking
- Performance benchmarking
- Cohort analysis

### Learning Engine
- Historical content analysis
- Winning pattern identification
- Losing pattern identification
- Improvement recommendation generation

### AI Engine
- Prompt management and versioning
- Multi-provider workflow orchestration
- Prompt evaluation and quality scoring
- AI cost tracking and budget enforcement

---

## Key Constraints

1. **Single VPS deployment** — System must run on one Linux VPS (Docker Compose) for Phase 1 and Phase 2
2. **Low operating cost** — AI calls must be budgeted per feature, not unbounded
3. **Agent readability** — Any AI agent must understand a module within 2 minutes
4. **No premature microservices** — Modular monolith until Phase 3 justifies decomposition
5. **Multi-tenancy ready from day 1** — `tenant_id` on all tenant-scoped tables

---

## Technology Decisions

See `/docs/decisions/` for the full rationale behind each major technology choice.

| Decision | Choice | ADR |
|---|---|---|
| Backend framework | .NET 9 | — |
| Database | PostgreSQL | — |
| Multi-tenancy model | Row-level with `tenant_id` | `2026-06-20-multi-tenancy-model.md` |
| Inter-module communication | In-process domain events (MediatR) | `2026-06-20-inter-module-communication.md` |
| Caching strategy | Cache-aside with Redis, tiered TTL | `2026-06-20-caching-strategy.md` |
| AI provider routing | Cost-aware routing with fallback | `2026-06-20-ai-provider-routing.md` |
| Architecture pattern | Modular monolith | `2026-06-20-modular-monolith.md` |
