# Known Limitations — Trendify

> Tài liệu này ghi lại những giới hạn đã biết, trade-offs đã cân nhắc, và technical debt có chủ đích.
> Agent mới cần đọc file này để tránh đề xuất giải pháp mâu thuẫn với những quyết định đã được đưa ra.

---

## Giới hạn Kiến trúc

### 1. Single VPS Deployment
**Giới hạn:** Toàn bộ hệ thống chạy trên một Linux VPS với Docker Compose.  
**Tác động:** Không có horizontal scaling, không có HA. Downtime khi deploy.  
**Lý do:** Phase 1 không justify cost của K8s hay multi-node setup.  
**Khi nào thay đổi:** Phase 3 khi có 100+ paying tenants.

### 2. In-Process Event Bus (MediatR)
**Giới hạn:** Domain events là synchronous in-process — nếu API process crash, events đang chờ sẽ mất.  
**Tác động:** Cross-module side effects không guaranteed nếu có crash.  
**Lý do:** Đơn giản hơn nhiều so với distributed messaging (RabbitMQ, Kafka). Phù hợp Phase 1-2.  
**Khi nào thay đổi:** Phase 3 khi reliability requirements tăng. ADR: `2026-06-20-inter-module-communication.md`.

### 3. Shared Database (Không phải per-module DB)
**Giới hạn:** Tất cả modules dùng chung một PostgreSQL database (`AppDbContext`).  
**Tác động:** Cross-module JOIN queries có thể xảy ra (phải kiểm soát), schema coupling.  
**Lý do:** Modular monolith không cần per-module DB. Đơn giản hóa operations.  
**Khi nào thay đổi:** Chỉ khi tách microservices ở Phase 3+.

### 4. Row-Level Multi-Tenancy (Không phải Schema-level)
**Giới hạn:** Tất cả tenants trong cùng database, cách ly bằng `tenant_id`.  
**Rủi ro:** Bug quên filter `tenant_id` sẽ leak data cross-tenant.  
**Mitigation:** `TenantRepository<T>` base class auto-apply filter, `[BypassTenantFilter]` phải explicit.  
**Khi nào thay đổi:** Phase 3+ nếu compliance requirements yêu cầu schema isolation.  
ADR: `2026-06-20-multi-tenancy-model.md`.

---

## Giới hạn Business Logic

### 5. TikTok-Only (Phase 1)
**Giới hạn:** Chỉ hỗ trợ TikTok. Mặc dù schema có `platform` field cho `social_accounts`.  
**Tác động:** Instagram, YouTube, etc. chưa có — schema sẵn sàng, business logic chưa.  
**Khi nào thay đổi:** Phase 2+ theo product roadmap.

### 6. Trend Data Là Per-Tenant
**Giới hạn:** Mỗi tenant chỉ thấy trends liên quan đến niche của tài khoản họ, không phải global trends.  
**Tác động:** Creator nhỏ ít tài khoản sẽ thấy ít trend hơn.  
**Lý do:** Avoid noise, relevant > comprehensive cho Phase 1.  
**Khi nào thay đổi:** Phase 4 (Creator Intelligence Platform) — aggregated cross-tenant trend data.

### 7. Learning Engine Cần Tối Thiểu 10 Posts
**Giới hạn:** Learning Analysis không chạy nếu tenant có < 10 posts với metrics.  
**Tác động:** New users không có recommendations cho đến khi có đủ data.  
**Lý do:** Dưới 10 posts, patterns không đủ statistical significance.  
**Workaround:** UI hiển thị "Not enough data yet — publish more content to unlock insights".

### 8. Content Assets Không Auto-Purge
**Giới hạn:** MinIO assets không bị xóa khi archive idea.  
**Tác động:** Storage tăng dần nếu user không manually clean up.  
**Lý do:** Tránh data loss — user có thể cần assets dù idea đã archived.  
**Future:** Phase 2 thêm storage quota và auto-cleanup policy.

---

## Giới hạn AI

### 9. AI Costs Estimated, Không Exact
**Giới hạn:** `estimated_cost_usd` trong `ai_usage_logs` là ước tính dựa trên published pricing.  
**Tác động:** Monthly reconciliation có thể có sai lệch.  
**Lý do:** Providers không return actual cost per call trong real-time.  
**Mitigation:** Monthly batch job verify actual vs estimated, update pricing table khi providers thay đổi.

### 10. Prompt Versions Không Auto-Rollback
**Giới hạn:** Nếu prompt version mới produce kết quả tệ hơn, rollback phải thủ công (PATCH request).  
**Tác động:** Bad prompt có thể affect users cho đến khi admin phát hiện và rollback.  
**Mitigation:** Prompt evaluation suite (eval set 10-20 golden examples) chạy tự động khi tạo version mới.

### 11. AI Provider Fallback Không Guaranteed Consistent Output
**Giới hạn:** Nếu primary provider fail → fallback sang secondary. Different model = slightly different output style.  
**Tác động:** User có thể thấy inconsistency trong output quality khi provider switches.  
**Lý do:** Availability > consistency. Better than returning an error.

### 12. No Streaming Responses (Phase 1)
**Giới hạn:** AI responses không stream — user phải chờ đến khi toàn bộ completion xong.  
**Tác động:** Script generation (60 giây) không có progress indicator từ AI.  
**Khi nào thay đổi:** Phase 2 có thể add SSE streaming cho script generation.

---

## Giới hạn Data / Analytics

### 13. TikTok API Metrics Có Độ Trễ
**Giới hạn:** TikTok API không cung cấp real-time metrics. Dữ liệu thường trễ 24-48 giờ.  
**Tác động:** Analytics không phải real-time — "last updated" timestamp luôn hiển thị.

### 14. Revenue Data Phụ Thuộc TikTok Creator Fund Scope
**Giới hạn:** Revenue tracking cần `creator.info.stats` OAuth scope — không phải mọi account đủ điều kiện.  
**Tác động:** Accounts chưa join Creator Fund sẽ không có revenue data.

### 15. Post Metrics Append-Only = Tốn Storage
**Giới hạn:** `post_metrics` không bao giờ UPDATE — mỗi lần refresh là 1 row mới.  
**Tác động:** Bảng tăng nhanh. Posts 30 ngày đầu tạo hàng chục rows mỗi post.  
**Mitigation:** `AnalyticsArchiveJob` aggregate posts > 90 ngày thành weekly summaries.

---

## Technical Debt Có Chủ Đích

### TD-01: AI Pricing Table Hardcoded
AI cost calculator dùng hardcoded pricing. Khi providers thay đổi giá → update thủ công.  
**Action needed:** Sau khi AI providers ổn định pricing (3-6 tháng), move sang DB-driven pricing table.

### TD-02: No Distributed Tracing (Phase 1)
OpenTelemetry/Jaeger chỉ planned cho Phase 2+. Hiện tại chỉ có correlation_id trong logs.  
**Action needed:** Phase 2 implement OpenTelemetry tracing.

### TD-03: TikTok API Client Chưa Full Rate Limit Handling
Spec yêu cầu respect TikTok `X-RateLimit-*` headers — implementation cần careful testing với actual API.  
**Action needed:** Implement và test với real TikTok API credentials.

### TD-04: No Idempotency Keys Trên Mutation Endpoints
POST endpoints hiện không hỗ trợ `Idempotency-Key` header.  
**Action needed:** Phase 2 cho billing-related operations.

---

## Những gì KHÔNG Phải Trendify (Out of Scope)

- **Video editing tool:** Content Factory orchestrates external tools, không tự build video editor
- **Real-time streaming platform:** SSE/polling đủ cho Phase 1-2, không phải WebSocket-first
- **Microservices:** Modular monolith cho đến khi Phase 3 thực sự justify decomposition
- **Multi-platform (Instagram, YouTube):** Schema sẵn sàng nhưng không implement trong Phase 1
- **AI model training:** Dùng third-party providers, không train model riêng
- **Content distribution:** Trendify schedule + produce, không phải publish platform
