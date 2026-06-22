# Feature: Product Discovery Module

## Purpose

Discovers, scores, and tracks affiliate products from TikTok Shop.
Surfaces products with high commission potential before they become saturated so creators can promote them while competition is still low.

---

## Data Source Constraints

**Critical:** Product data must come from official APIs only. Web crawling violates TikTok ToS and risks account bans.

| Data Source | API | Notes |
|---|---|---|
| TikTok Shop products | TikTok Shop Open Platform API | Requires seller/partner account |
| Affiliate commissions | TikTok Affiliate API | Requires TikTok Creator Marketplace access |
| Product performance | TikTok Shop Analytics API | Only for products in user's affiliate list |
| Fallback (Phase 1) | User manual import | CSV upload or paste affiliate link |

Phase 1 ships with manual import. TikTok Shop API integration is Phase 2 (requires partner onboarding, timeline: 4–8 weeks for approval).

---

## Entities

### Product

An affiliate product available for promotion.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | Workspace-scoped |
| external_id | VARCHAR(200) | TikTok Shop product ID |
| source | VARCHAR(50) | 'tiktok_shop', 'manual' |
| name | VARCHAR(500) | Product name |
| category | VARCHAR(200) | TikTok product category |
| brand | VARCHAR(200) | Nullable |
| price | DECIMAL(12,2) | Selling price |
| currency | VARCHAR(10) | Default 'VND' |
| commission_rate | DECIMAL(5,2) | Percentage, e.g. 20.00 |
| commission_amount | DECIMAL(12,2) | Calculated: price * commission_rate / 100 |
| score | DECIMAL(5,2) | 0–100. Composite product score |
| status | VARCHAR(50) | 'active', 'out_of_stock', 'delisted', 'archived' |
| affiliate_link | TEXT | User's unique affiliate tracking URL |
| thumbnail_url | TEXT | Product image stored in MinIO |
| description | TEXT | Nullable |
| product_type | VARCHAR(50) | Derived from category via mapping table. Drives viral template filtering. See `features/viral-template-engine.md`. Values: fashion_female, fashion_male, watch, handbag, cosmetics, jewelry, footwear |
| synced_at | TIMESTAMPTZ | Last sync from TikTok API |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

### ProductMetrics

Time-series sales and performance snapshot per product.

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| product_id | UUID | FK → products |
| tenant_id | UUID | |
| period_date | DATE | Snapshot date |
| views | BIGINT | Product page views |
| clicks | BIGINT | Affiliate link clicks |
| orders | INTEGER | Orders attributed to affiliate |
| revenue | DECIMAL(12,2) | Gross revenue from orders |
| commission_earned | DECIMAL(12,2) | Affiliate commission received |
| ctr | DECIMAL(5,4) | clicks / views |
| cvr | DECIMAL(5,4) | orders / clicks |
| created_at | TIMESTAMPTZ | |

### ProductWatchlist

Products the user is actively tracking (not yet in a campaign).

| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| tenant_id | UUID | |
| product_id | UUID | FK → products |
| notes | TEXT | User notes |
| added_at | TIMESTAMPTZ | |

---

## Product Score Algorithm (v1)

Score is a composite 0–100 value ranking products by promotion opportunity.

```
score = (commission_score   * 0.35)
      + (velocity_score     * 0.30)
      + (demand_score       * 0.20)
      + (competition_score  * 0.15)
```

- `commission_score`: normalized commission rate (20%+ = 100, <5% = 0)
- `velocity_score`: order growth rate over last 7 days (new arrivals get a boost)
- `demand_score`: product page views normalized across category
- `competition_score`: inverse of number of affiliates promoting it (fewer = higher score)

Score 80–100: High opportunity. Score 50–79: Good. Score < 50: Low priority.

Score is recalculated on every sync. Historical scores are not stored (use `product_metrics` for history).

---

## Business Rules

1. A product belongs to a workspace (`tenant_id`) — not shared globally
2. Products can be added manually (paste affiliate link) or via API sync
3. `commission_amount` is always derived — never stored independently from `price` and `commission_rate`
4. A product with `status = 'out_of_stock'` or `'delisted'` cannot be used in a new campaign
5. Archived products remain visible in historical analytics but do not appear in discovery feed
6. Thumbnail images are downloaded and stored in MinIO — never linked directly from TikTok CDN (to avoid broken links)
7. `affiliate_link` is per-user — the same product has different links for different workspace users
8. Product sync is workspace-scoped — one workspace cannot see another's synced products
9. Maximum 500 products per workspace on Free tier; unlimited on Pro/Agency tier

---

## Domain Events Published

| Event | When | Consumed By |
|---|---|---|
| `ProductAddedEvent` | User adds a product (manual or sync) | — |
| `ProductSyncedEvent` | ProductSyncJob updates metrics | Analytics (update commission totals) |
| `ProductDelistedEvent` | Product status changes to `delisted` | Campaign Engine (pause active campaigns using this product) |
| `HighOpportunityProductDetectedEvent` | Score crosses 80 threshold | — (notify user) |

---

## Background Jobs

### ProductSyncJob
- Schedule: Every 6 hours
- Process:
  1. For each workspace with TikTok Shop API connected, fetch latest product metrics
  2. Upsert `product_metrics` record for today's date
  3. Recalculate `score` for each product
  4. Update `status` if product is out of stock or delisted
  5. Publish `ProductDelistedEvent` for any newly delisted products
  6. Publish `HighOpportunityProductDetectedEvent` if score crosses 80 for the first time

### ThumbnailCacheJob
- Schedule: On demand (triggered by `ProductAddedEvent`)
- Process: Download product thumbnail from TikTok CDN → store in MinIO → update `thumbnail_url`

---

## API Endpoints

### Product Discovery

```
GET  /api/v1/products
     ?sort=score|commission|velocity
     ?category={category}
     ?min_score={0-100}
     ?status=active
     ?page={n}&page_size={20}
     → PagedResult<ProductSummaryDto>

GET  /api/v1/products/{id}
     → ApiResponse<ProductDetailDto>
```

### Product Management

```
POST /api/v1/products/import
     Body: { affiliate_link: string, notes?: string }
     → ApiResponse<ProductDto>

PUT  /api/v1/products/{id}
     Body: { notes?: string, commission_rate?: decimal }
     → ApiResponse<ProductDto>

DELETE /api/v1/products/{id}
       → ApiResponse (soft delete → archived)
```

### Watchlist

```
GET    /api/v1/products/watchlist
       → PagedResult<ProductSummaryDto>

POST   /api/v1/products/watchlist
       Body: { product_id: uuid, notes?: string }
       → ApiResponse<WatchlistItemDto>

DELETE /api/v1/products/watchlist/{product_id}
       → ApiResponse
```

### Metrics

```
GET /api/v1/products/{id}/metrics
    ?period=7d|30d|90d
    → ApiResponse<ProductMetricsDto>
```

---

## DTOs

### ProductSummaryDto
```
{
  id, name, category, thumbnail_url,
  price, commission_rate, commission_amount,
  score, status, affiliate_link
}
```

### ProductDetailDto
```
ProductSummaryDto +
{
  brand, description, source,
  synced_at, metrics (last 30d aggregate)
}
```

### ProductMetricsDto
```
{
  product_id,
  period,
  totals: { views, clicks, orders, revenue, commission_earned },
  rates: { ctr, cvr },
  daily: [{ date, views, clicks, orders, commission_earned }]
}
```

---

## Acceptance Criteria

### AC-1: Manual Product Import
- [ ] User can paste a TikTok affiliate link and the system extracts product name, price, and commission rate
- [ ] System downloads and stores product thumbnail before showing the product card
- [ ] Imported product appears in the product list within 5 seconds
- [ ] System validates the link format and returns a clear error if invalid

### AC-2: Product Discovery Feed
- [ ] Feed shows products sorted by score (default), commission rate, or sales velocity
- [ ] Each product card shows: thumbnail, name, commission rate, commission amount, score
- [ ] User can filter by category and minimum score
- [ ] Products with `status != active` are hidden from the default feed (visible via filter)

### AC-3: Product Scoring
- [ ] Score is visible on every product card as a number 0–100 with a color indicator (red/yellow/green)
- [ ] Score recalculates after every sync — last recalculated time is shown
- [ ] Score breakdown is viewable on the product detail page (per-component)

### AC-4: Watchlist
- [ ] User can add a product to the watchlist from the discovery feed in one click
- [ ] Watchlist is accessible from the left sidebar
- [ ] User can add personal notes to a watchlist item

### AC-5: Performance Metrics
- [ ] Product detail page shows views, clicks, orders, commission earned for 7d/30d/90d
- [ ] CTR and CVR are displayed with trend indicator (up/down vs prior period)
- [ ] Metrics page shows a daily chart for the selected period

### AC-6: Delisted Product Handling
- [ ] When a product is delisted, all active campaigns using it receive a `ProductDelistedEvent`
- [ ] Delisted products show a "Delisted" badge — they do not disappear
- [ ] User sees a banner notification when a product they are promoting is delisted

---

## Implementation Notes

- Phase 1: Manual import only. The `source = 'manual'` path is the only one implemented.
- Phase 2: TikTok Shop Open Platform API. Requires TikTok partner account approval (apply at `open.tiktokapis.com`). Do NOT attempt to scrape TikTok product pages.
- Affiliate link parsing for Phase 1: extract `item_id` from URL pattern `shop.tiktok.com/product/{item_id}` or `shope.ee/{shortcode}` (resolve redirect first).
- Product images: always proxy through MinIO. Never embed TikTok CDN URLs directly in the database.
- Commission data in Phase 1 is user-entered — no validation against TikTok. Mark Phase 1 metrics as `source = 'manual'` in `product_metrics`.
