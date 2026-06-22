# Project Overview — Trendify

## Trendify là gì?

Trendify là một **AI-Powered Creator Operating System** — hệ điều hành cho content creator. Mục tiêu là trở thành bộ não vận hành toàn diện cho creator TikTok: từ phát hiện trend, phân tích audience, sinh ý tưởng nội dung, sản xuất content, đến phân tích hiệu suất và học hỏi liên tục.

**Một câu tóm tắt:** Trendify giúp creator quản lý nhiều tài khoản TikTok, phát hiện trend sớm, hiểu audience, tạo content bằng AI, và tự động cải thiện chất lượng nội dung theo thời gian.

---

## Product Vision — 4 Giai đoạn

| Giai đoạn | Mô tả | Mục tiêu |
|---|---|---|
| Phase 1 | Personal Productivity Tool | 1 creator, tối đa 10 tài khoản TikTok |
| Phase 2 | Team Collaboration | Agency & team nhỏ (2–10 người), shared workspace |
| Phase 3 | Public SaaS | Multi-tenant, billing, public API, 100–10,000 creators |
| Phase 4 | Creator Intelligence Platform | Aggregated data, niche playbooks, creator economy marketplace |

**Hiện tại:** Phase 1 — tất cả modules đang ở trạng thái `Planned`.

---

## Business Goals

Giúp creator:
1. Quản lý nhiều TikTok accounts từ một dashboard
2. Phát hiện trend trước khi chúng đạt đỉnh
3. Hiểu audience và identify niche sinh lời
4. Tạo ý tưởng nội dung theo yêu cầu bằng AI
5. Tạo script, hook, CTA với AI assistance
6. Phân tích content nào hiệu quả và tại sao
7. Học từ lịch sử để cải thiện content tương lai
8. Tự động hóa các workflow lặp lại

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 9 (ASP.NET Core Minimal API) |
| Frontend | Next.js + TypeScript |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Background Jobs | Hangfire |
| File Storage | MinIO |
| Search | OpenSearch 2 |
| AI Providers | OpenAI, Anthropic (Claude), Google (Gemini) |
| Deployment | Docker Compose on Linux VPS |

---

## Architecture Pattern

**Modular Monolith** — một ứng dụng duy nhất, nhưng chia thành 8 module độc lập, giao tiếp qua domain events.

- Không phải microservices (Phase 1-2)
- Không phải big-ball-of-mud (modules có boundary cứng)
- Mỗi module có thể tách ra thành service độc lập ở Phase 3+ nếu cần

---

## Deployment (Phase 1)

Single Linux VPS, Docker Compose:
```
api (NET 9) + frontend (Next.js) + postgres + redis + minio + opensearch + hangfire
```
Chỉ `api` và `frontend` expose ports ra ngoài. Còn lại trên private Docker network.

---

## Key Constraints

1. **Single VPS** — phải chạy được trên 1 máy chủ Linux với Docker Compose
2. **AI cost control** — mọi AI call phải có budget, không cho phép unbounded calls
3. **Agent readability** — agent AI mới phải hiểu 1 module trong vòng 2 phút
4. **Multi-tenancy ready** — `tenant_id` trên mọi bảng tenant-scoped từ ngày đầu
5. **No premature microservices** — không tách microservices cho đến khi Phase 3 thực sự cần

---

## Trạng thái Hiện tại (2026-06-22)

- Source code backend (.NET 9): **Đã implement** — 7 modules + shared infrastructure
- Frontend (Next.js): **Đã implement** — 26 screens theo spec
- Tất cả features: **Planned** (spec đã viết, code đã scaffold, chưa test/verify)
- Không có CI/CD, không có production deployment

---

## Files Quan trọng Nhất

| File | Mục đích |
|---|---|
| `docs/agent-context.md` | Entry point cho mọi AI agent |
| `docs/feature-index.md` | Danh sách tất cả features và trạng thái |
| `docs/architecture.md` | Kiến trúc đầy đủ với diagrams |
| `docs/database-map.md` | Toàn bộ schema SQL |
| `docs/api-map.md` | Tất cả API endpoints |
| `docs/features/*.md` | Spec chi tiết từng module |
