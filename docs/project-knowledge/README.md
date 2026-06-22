# Trendify — Project Knowledge Base

> **Nếu bạn là Agent mới, hãy đọc các tài liệu trong thư mục này TRƯỚC KHI đọc source code.**
> Chỉ đọc source code khi task yêu cầu chi tiết về implementation cụ thể.

---

## Mục đích của Knowledge Base này

Thư mục này chứa bản tóm lược kiến thức đã được distill từ toàn bộ codebase và tài liệu gốc.
Một Agent đọc đủ các file ở đây sẽ hiểu **80–90% hệ thống** mà không cần scan source code.

**Tiết kiệm token. Đọc đúng file. Làm đúng việc.**

---

## Đọc theo thứ tự này

### Bước 1 — Hiểu hệ thống là gì
→ **[project-overview.md](project-overview.md)**
- Trendify là gì, mục tiêu kinh doanh, tech stack, deployment, trạng thái hiện tại

### Bước 2 — Hiểu cấu trúc modules
→ **[module-map.md](module-map.md)**
- 8 modules, trách nhiệm từng module, background jobs, shared infrastructure

### Bước 3 — Hiểu người dùng làm gì
→ **[user-flows.md](user-flows.md)**
- 8 user flows chính: onboarding, trend discovery, audience analysis, content creation, production, analytics, learning loop

### Bước 4 — Hiểu hệ thống hoạt động thế nào
→ **[system-flows.md](system-flows.md)**
- Request lifecycle, cross-module events, AI call lifecycle, background job flows, authentication, caching, multi-tenancy

### Bước 5 — Hiểu data model
→ **[database-overview.md](database-overview.md)**
- Tất cả tables, columns quan trọng, indexes, retention policy, migration rules

### Bước 6 — Hiểu API surface
→ **[api-overview.md](api-overview.md)**
- Tất cả endpoints, response envelope, auth, rate limits, error codes

### Bước 7 — Hiểu event system
→ **[events-overview.md](events-overview.md)**
- Toàn bộ domain events, ai publish, ai consume, event flow diagram

### Bước 8 — Hiểu các quy tắc nghiệp vụ
→ **[business-rules.md](business-rules.md)**
- Rules theo từng module, global invariants, architecture constraints

### Bước 9 — Hiểu hiện tại có gì
→ **[current-capabilities.md](current-capabilities.md)**
- Feature nào đã có, chưa có, frontend screens, điều kiện production-ready

### Bước 10 — Hiểu giới hạn và trade-offs
→ **[known-limitations.md](known-limitations.md)**
- Giới hạn kiến trúc, business, AI, data; technical debt có chủ đích; out of scope

---

## Khi nào cần đọc Source Code?

Chỉ đọc source code khi cần:

| Tình huống | File cần đọc |
|---|---|
| Implement feature mới cho module X | `src/modules/{x}/Domain/`, `Application/` |
| Sửa bug trong endpoint cụ thể | `src/modules/{x}/API/` |
| Thêm/sửa database migration | `src/infrastructure/Persistence/Migrations/` |
| Thay đổi AI routing logic | `src/infrastructure/AI/AIProviderRouter.cs` |
| Thêm cache key mới | `src/infrastructure/Caching/CacheKeys.cs` |
| Thêm domain event mới | `src/shared/Events/` + module's `Events/` folder |

---

## Tài liệu Gốc (Nếu cần chi tiết hơn)

| Tài liệu | Nội dung |
|---|---|
| `docs/agent-context.md` | Entry point + naming conventions |
| `docs/feature-index.md` | Trạng thái tất cả features |
| `docs/architecture.md` | Architecture diagrams + ADR references |
| `docs/database-map.md` | SQL schemas đầy đủ |
| `docs/api-map.md` | API endpoints đầy đủ |
| `docs/features/accounts.md` | Spec module Accounts |
| `docs/features/trends.md` | Spec module Trend Intelligence |
| `docs/features/audience.md` | Spec module Audience Intelligence |
| `docs/features/content.md` | Spec module Content Brain + Factory |
| `docs/features/analytics.md` | Spec module Analytics |
| `docs/features/learning.md` | Spec module Learning Engine |
| `docs/features/ai-engine.md` | Spec module AI Engine |
| `docs/decisions/*.md` | Architectural Decision Records |

---

## Quick Reference

```
Platform:     TikTok Creator Operating System
Backend:      .NET 9 / ASP.NET Core / PostgreSQL / Redis / Hangfire
Frontend:     Next.js + TypeScript
AI:           OpenAI + Anthropic + Gemini (cost-aware routing)
Storage:      MinIO (files), PostgreSQL (data), Redis (cache)
Architecture: Modular Monolith → modules giao tiếp qua MediatR domain events
Tenancy:      Row-level với tenant_id, auto-filter mọi query
Auth:         JWT (15m access + 7d refresh)
Phase:        1 — Personal tool, single VPS Docker Compose
Status:       Source code scaffolded, specs complete, tests chưa có
```

---

*Knowledge Base này được tạo tự động từ codebase và docs tính đến 2026-06-22.*
*Nếu có sai lệch với source code, source code là nguồn sự thật.*
