# User Flows — Trendify

## Personas Người Dùng

**Phase 1:** Solo creator quản lý 1–10 tài khoản TikTok.  
**Phase 2+:** Team nhỏ (agency), nhiều user trong một workspace.

---

## Flow 1: Onboarding & Setup

```
1. User truy cập Trendify
2. Đăng ký tài khoản → Tạo Workspace (tên, slug)
3. Được redirect đến "Connect TikTok"
4. Click "Connect TikTok" → TikTok OAuth flow
5. Sau OAuth: tài khoản xuất hiện trong dashboard (< 5 giây)
6. Optionally: thêm nhiều tài khoản TikTok, tạo Account Groups
```

**Điều kiện tiên quyết:** User phải connect ít nhất 1 TikTok account để sử dụng hầu hết tính năng.

---

## Flow 2: Trend Discovery & Watchlist

```
1. User mở màn hình "Trend Feed"
2. Xem danh sách trends được phát hiện (auto, mỗi 15 phút)
3. Filter theo: status (rising/peaking/declining), platform, score threshold
4. Click vào trend → xem chi tiết: score, velocity, lifecycle chart
5. Click "Add to Watchlist" → trend được theo dõi riêng
6. Watchlist hiển thị real-time score updates
7. Nhận notification khi trend đạt đỉnh hoặc bắt đầu giảm
```

---

## Flow 3: Audience Analysis

```
1. User chọn một social account
2. Xem Audience Profile: age chart, top countries, interests, best hours heatmap
3. Click "Refresh" → trigger AudienceRefreshJob (rate-limited: 1/giờ)
4. Click "Generate Personas" → AI tạo 2-5 personas từ audience data
5. Mỗi persona: tên, narrative, demographics, pain points, motivations
6. User có thể edit personas thủ công
7. Click "Discover Niches" → xem top 5 niches với monetization potential
```

---

## Flow 4: Content Ideation (Core Flow)

```
1. User chọn một trend từ Feed hoặc Watchlist
2. Click "Generate Ideas" (chọn: trend, persona, niche)
3. AI trả về 5 ideas (title + hook + brief description) trong < 30 giây
4. User chọn một idea → vào detail view
5. Click "Generate Script" → AI viết full script (Hook / Body / CTA) trong < 60 giây
6. User edit script inline nếu cần
7. Click "Generate Hook Variants" → xem 3 variations hook
8. Click "Generate CTA Options" → xem 3 CTA variants
9. Approve idea → status: draft → approved
10. Idea sẵn sàng cho Content Factory
```

**AI Context được inject tự động:**
- Top 3 winning patterns từ Learning Engine
- Audience persona pain points
- Trend context (keyword, score, velocity)

---

## Flow 5: Content Production (Content Factory)

```
1. User vào "Idea Board" → filter tab "Approved"
2. Chọn approved idea
3. Chọn Production Pipeline (ví dụ: "Standard TikTok Pipeline")
4. Click "Start Production"
5. System chạy pipeline steps trong background:
   - Step 1: Voice generation (ElevenLabs)
   - Step 2: Subtitle generation (Whisper)
   - Step 3: Notify complete
6. Progress hiển thị real-time (polling 3 giây)
7. Khi hoàn thành: assets available (audio, SRT file)
8. User download assets, ghép video thủ công hoặc trong tool khác
9. Publish lên TikTok
10. Sau publish: user mark idea status → published
```

---

## Flow 6: Analytics Review

```
1. User mở Analytics Dashboard
2. Xem tổng quan 30 ngày: views, likes, followers
3. Breakdown per account (nếu nhiều tài khoản)
4. Xem top posts: sorted by views / engagement / revenue
5. Click vào post → full metric history chart
6. Xem revenue tracking (TikTok Creator Fund)
7. Xem benchmarking: engagement rate vs. niche average
8. Xem best posting time recommendation
```

---

## Flow 7: Learning & Improvement Loop

```
1. System tự động chạy LearningAnalysisJob (3 AM hàng ngày)
2. Phân tích tất cả posts với ≥ 5 evidence → phát hiện patterns
3. Patterns hiển thị trong "Insights" page:
   - Winning: "Hooks bắt đầu bằng câu hỏi có 2.3x higher retention"
   - Losing: "Videos > 60 giây trong fitness niche có 40% lower completion"
4. System tạo Improvement Recommendations (priority: Low/Medium/High/Critical)
5. User xem recommendations trong dashboard
6. User click "Apply" hoặc "Dismiss for 30 days"
7. Khi generate ideas tiếp theo → AI context tự động có top 3 winning patterns
```

---

## Flow 8: Competitor Monitoring

```
1. User vào "Competitors" section
2. Add TikTok username làm competitor
3. System scan competitor posts (mỗi 6 giờ)
4. Hiển thị top-performing keywords từ competitor
5. Keywords feed vào Trend Detection để surface relevant trends
```

---

## Error Flows Quan trọng

### Token Expired (TikTok OAuth)
```
Hệ thống cố refresh token → Nếu fail 3 lần → status = token_expired
→ User thấy warning banner trên dashboard
→ User cần reconnect TikTok account
```

### AI Budget Exceeded
```
User click generate → system check budget → Exceeded
→ API trả 429 AI_BUDGET_EXCEEDED
→ UI hiển thị message rõ ràng (KHÔNG phải generic 500 error)
→ User có thể upgrade plan hoặc chờ reset vào ngày 1 tháng sau
```

### Pipeline Run Failed
```
Pipeline step thất bại → mark run = failed → log error
→ User nhận notification
→ User xem error detail + click "Retry"
→ KHÔNG auto-retry (tránh infinite loops với AI calls)
```
