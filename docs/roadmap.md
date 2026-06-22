# Roadmap — Trendify

## Phase Overview

| Phase | Target | Focus |
|---|---|---|
| Phase 1 | 1 user, 1–10 TikTok accounts | Personal productivity, core feature delivery |
| Phase 2 | Small teams, 2–10 users | Collaboration, shared workspaces |
| Phase 3 | 100–10,000 paying users | Public SaaS, billing, onboarding |
| Phase 4 | Platform play | Creator intelligence data, ecosystem |

---

## Phase 1 — Personal Productivity Tool

**Goal:** A single creator can manage multiple TikTok accounts, discover trends, generate content ideas, and analyze performance — all from one tool.

**Success Criteria:**
- [ ] 10+ TikTok accounts manageable from one dashboard
- [ ] Trend detection running automatically every 15 minutes
- [ ] AI content idea generation in < 30 seconds
- [ ] Full script generated in < 60 seconds
- [ ] Analytics dashboard showing last 90 days of performance
- [ ] Learning engine producing ≥1 recommendation per week
- [ ] System runs on a single $20/month VPS

### Sprint 1 — Foundation
- [ ] Project scaffold (backend + frontend)
- [ ] Docker Compose setup (postgres, redis, minio, opensearch)
- [ ] Shared infrastructure: `ApiResponse<T>`, `ErrorResponse`, `ICurrentUser`, `IDomainEvent`
- [ ] Auth: register, login, JWT, refresh token
- [ ] CI pipeline (lint, build, test)

### Sprint 2 — Accounts Module
- [ ] Workspace management
- [ ] TikTok OAuth integration
- [ ] Multi-account dashboard (list, connect, disconnect)
- [ ] Account grouping
- [ ] Account profile sync

### Sprint 3 — Trend Intelligence
- [ ] TrendScanJob (every 15 min)
- [ ] Trend detection from TikTok API
- [ ] Trend scoring algorithm v1
- [ ] Trend list UI with filters
- [ ] Trend watchlist
- [ ] Trend detail page with lifecycle chart

### Sprint 4 — Content Brain
- [ ] Idea board UI
- [ ] Manual idea creation
- [ ] AI idea generation from trend
- [ ] Hook generation
- [ ] Script generation
- [ ] CTA generation
- [ ] AI cost tracking integration

### Sprint 5 — Analytics
- [ ] Post ingestion from TikTok API
- [ ] Metrics storage (views, likes, comments, shares, saves)
- [ ] Analytics dashboard UI
- [ ] Per-account performance overview
- [ ] Top performing posts list

### Sprint 6 — Learning Engine
- [ ] Historical content analysis job
- [ ] Winning/losing pattern detection v1
- [ ] Improvement recommendations UI
- [ ] Integration: recommendations feed into Content Brain ideas

### Sprint 7 — Content Factory (Basic)
- [ ] Voice generation (via ElevenLabs or similar)
- [ ] Subtitle generation (via Whisper)
- [ ] Asset storage in MinIO
- [ ] Pipeline definition UI (basic)

### Sprint 8 — Audience Intelligence
- [ ] Audience profile analysis (from TikTok data)
- [ ] Persona generation with AI
- [ ] Niche discovery
- [ ] Monetization opportunities display

### Sprint 9 — Polish & Hardening
- [ ] Full observability (Serilog, Seq)
- [ ] Health checks
- [ ] Error alerting
- [ ] Performance tuning (N+1 queries, slow endpoints)
- [ ] Security review (OWASP basics)
- [ ] Documentation review

---

## Phase 2 — Team Collaboration

**Goal:** Creator agencies and small teams can collaborate on content, share accounts, and manage workflows together.

**Success Criteria:**
- [ ] 2–10 team members per workspace
- [ ] Role-based permissions working (Owner, Admin, Editor, Viewer)
- [ ] Shared content idea board with assignment
- [ ] Team activity feed
- [ ] Approval workflow for content

### Key Features
- [ ] User invitation system
- [ ] Role-based access control (RBAC) enforcement
- [ ] Shared content pipelines
- [ ] Content approval workflow
- [ ] Team activity log
- [ ] Notification system (in-app)
- [ ] Workspace billing (per-seat)

---

## Phase 3 — Public SaaS

**Goal:** Publicly launch with subscription billing, self-serve onboarding, and a support infrastructure.

**Success Criteria:**
- [ ] < 5 minutes from signup to first trend displayed
- [ ] Subscription tiers (Free, Pro, Agency)
- [ ] 99.9% uptime SLA
- [ ] AI token budgets enforced per plan tier
- [ ] Support ticket system

### Key Features
- [ ] Stripe billing integration
- [ ] Subscription tier enforcement
- [ ] AI token budget per tier
- [ ] Self-serve onboarding flow
- [ ] Public marketing site
- [ ] Help center / documentation
- [ ] Public API (API key auth)
- [ ] Multi-region consideration
- [ ] Data export (GDPR compliance)

---

## Phase 4 — Creator Intelligence Platform

**Goal:** Aggregate anonymized data across creators to provide industry benchmarks, trend forecasting, and niche intelligence.

**Success Criteria:**
- [ ] Benchmark data available for top 20 TikTok niches
- [ ] Trend forecasting 48 hours ahead with >70% accuracy
- [ ] Platform data marketplace (opt-in)

### Key Features
- [ ] Anonymized trend aggregation across tenants
- [ ] Industry benchmark dashboards
- [ ] Trend forecasting model
- [ ] Niche intelligence reports
- [ ] Creator economy data API (B2B)
- [ ] Playbook generation per niche

---

## Technical Milestones

| Milestone | Phase | Description |
|---|---|---|
| Multi-tenancy isolation verified | 1 | Every query tested with tenant isolation |
| AI cost per feature documented | 1 | Budget defined for every AI feature |
| 100% API coverage with tests | 1 | All endpoints have integration tests |
| Tenant data encryption at rest | 2 | PII columns encrypted in PostgreSQL |
| Load test: 100 concurrent users | 2 | No degradation under team usage |
| SOC 2 prep started | 3 | Security controls documented |
| Load test: 10,000 concurrent users | 3 | Horizontal scale validation |
| Data anonymization pipeline | 4 | Cross-tenant analytics without PII leak |
