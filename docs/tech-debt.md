# Tech Debt — Trendify

## Rules

- Every debt item must have: severity, estimated fix cost, date added, and a clear description
- Items older than 90 days without a resolution plan are escalated as risks (see `docs/architecture.md#risks`)
- Review this file at the end of every sprint

## Severity Levels

| Level | Meaning |
|---|---|
| Critical | Blocks scalability or creates security risk — fix within 1 sprint |
| High | Will become critical if left past Phase 2 — fix within 3 sprints |
| Medium | Slows down development — fix when convenient |
| Low | Nice to fix — address during refactor sprints |

---

## Active Debt Items

*No debt recorded yet — project is in initial setup.*

---

## Template

When adding a new item, use this format:

```
### [SHORT TITLE]
- **Severity:** Critical | High | Medium | Low
- **Date Added:** YYYY-MM-DD
- **Estimated Effort:** X days
- **Location:** file path or module name
- **Description:** What is wrong and why it was done this way.
- **Impact:** What breaks or becomes harder because of this.
- **Fix Plan:** What the correct solution looks like.
- **Resolution Date:** YYYY-MM-DD (fill when resolved)
```

---

## Resolved Debt

*None yet.*
