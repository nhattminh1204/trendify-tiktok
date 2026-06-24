# Trendify — AI-Powered Creator Operating System

## Quick Context for AI Agents

This is a modular monolith built with .NET 9 + Next.js.
Read these files in order before doing any work:

1. `docs/agent-context.md` — How to navigate this project
2. `docs/feature-index.md` — All features and their status
3. Target feature doc in `docs/features/<module>.md`

Do NOT scan the entire repository. Minimize token usage.

---

## Project Structure

```
/docs                       — All documentation
  /features                 — One file per module
  /decisions                — Architectural Decision Records (ADRs)
  /standards                — Coding and platform standards
/src
  /modules                  — Vertical slice modules
    /accounts
    /audience
    /trends
    /content
    /analytics
    /learning
    /ai-engine
  /shared                   — Cross-cutting contracts (interfaces, base types)
  /infrastructure           — Implementations (db, cache, messaging, storage)
  /workers                  — Background job definitions
/tests
  /unit
  /integration
  /e2e
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8 |
| Frontend | Next.js + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Background Jobs | Hangfire |
| Storage | MinIO |
| Search | OpenSearch |
| AI | OpenAI, Claude, Gemini |
| Deployment | Docker on Linux VPS |

---

## Core Rules

### Architecture Rules

1. Every module is independently removable
2. Modules communicate only via domain events — never direct service imports
3. No God Classes, no Massive Controllers, no hidden business logic
4. Prefer modular monolith — no microservices without explicit justification in an ADR
5. Every database table that will be tenant-scoped must have `tenant_id UUID NOT NULL` from day one
6. All APIs are stateless

### Code Rules

1. No feature begins without a spec in `docs/features/`
2. Every API endpoint follows the standard response envelope (see `docs/standards/api-standards.md`)
3. Every AI call must log provider, model, tokens, cost, feature, and user
4. No unbounded AI loops — every loop has a hard iteration cap
5. No secrets in code — environment variables only
6. All user input validated at API boundary, not inside services
7. Prompt injection prevention on all AI endpoints that accept user content
8. Every UI component must support light mode, dark mode, and system mode — never hardcode one theme
9. After building a new feature, do NOT auto-commit or push — wait for user to verify and run commit/push command

### PR Rules

1. Feature spec must exist before PR is opened
2. No PR merges without passing CI
3. Database migration PRs must include rollback instructions
4. Every PR that touches an AI endpoint must include estimated token cost per operation

---

## Definition of Ready

A task is not startable until:
- [ ] Feature specification written in `docs/features/`
- [ ] Acceptance criteria with ≥3 verifiable conditions
- [ ] Database impact assessed
- [ ] API contract drafted
- [ ] Cross-module dependencies identified
- [ ] Effort estimated

## Definition of Done

A task is complete when:
- [ ] Works against all acceptance criteria
- [ ] Unit tests: happy path + ≥2 edge cases
- [ ] Integration test: full vertical slice
- [ ] Feature doc updated
- [ ] `docs/feature-index.md` updated
- [ ] No new compiler warnings
- [ ] PR reviewed and approved

---

## Module Ownership

| Module | Owner | Status |
|---|---|---|
| Accounts | — | Planned |
| Audience Intelligence | — | Planned |
| Trend Intelligence | — | Planned |
| Content Brain | — | Planned |
| Content Factory | — | Planned |
| Analytics | — | Planned |
| Learning Engine | — | Planned |
| AI Engine | — | Planned |

---

## Before Generating Code

Always produce in this order:
1. Goal
2. Requirements
3. Architecture Impact
4. Database Impact
5. API Impact
6. Risks
7. Implementation Plan

Only then generate code.
