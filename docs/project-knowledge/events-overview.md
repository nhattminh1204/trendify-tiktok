# Events Overview — Trendify

## Kiến trúc Event

**In-process domain events via MediatR** — không phải message broker, không phải distributed events.

Khi nào thì dùng events:
- Module A cần trigger hành vi trong Module B
- Tách biệt business logic giữa modules
- Không bao giờ import trực tiếp service của module khác

```csharp
// Module A publish:
await _dispatcher.Publish(new TrendDetectedEvent(trendId, keyword, score));

// Module B consume:
public class ContentBrainTrendHandler : INotificationHandler<TrendDetectedEvent>
{
    public Task Handle(TrendDetectedEvent notification, CancellationToken ct)
    { ... }
}
```

---

## Toàn bộ Event Catalog

### Accounts Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `AccountCreatedEvent` | Workspace mới được tạo | AI Engine, Audience |
| `SocialAccountConnectedEvent` | TikTok account được link | Analytics, Audience |
| `SocialAccountDisconnectedEvent` | Account bị unlink | Analytics |
| `TokenExpiredEvent` | OAuth token không refresh được | [User notification] |

**AccountCreatedEvent payload:**
```
tenantId, workspaceId, ownerId, createdAt
```

**SocialAccountConnectedEvent payload:**
```
tenantId, socialAccountId, platform, username
```

---

### Trend Intelligence Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `TrendDetectedEvent` | Trend mới score > 70 | Content Brain |
| `TrendPeakedEvent` | Score đạt maximum | [User notification] |
| `TrendDecliningEvent` | Score giảm > 20% từ đỉnh | [User notification] |

**TrendDetectedEvent payload:**
```
tenantId, trendId, keyword, platform, score, velocity
```

---

### Content Brain Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `ContentIdeaCreatedEvent` | Idea được thêm (AI hoặc manual) | — |
| `ContentIdeaApprovedEvent` | Status → approved | Content Factory |
| `ContentIdeaPublishedEvent` | Status → published | Analytics, Learning |

**ContentIdeaPublishedEvent payload:**
```
tenantId, ideaId, hook, scriptLength, niche, trendId (nullable), personaId (nullable), publishedAt
```

---

### Content Factory Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `PipelineRunCompletedEvent` | Run → completed | [User notification] |
| `ContentAssetCreatedEvent` | Asset mới được lưu vào MinIO | — |

---

### Analytics Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `PerformanceMilestoneReachedEvent` | Post đạt 10k/100k/1M views | Learning Engine |
| `LowPerformanceDetectedEvent` | < 100 views sau 24 giờ | Learning Engine |

**PerformanceMilestoneReachedEvent payload:**
```
tenantId, postId, socialAccountId, milestone (10k/100k/1M), currentViews
```

---

### Audience Intelligence Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `AudienceProfileUpdatedEvent` | Profile được re-analyze | Content Brain |
| `PersonaGeneratedEvent` | Persona mới được tạo | Content Brain |

---

### Learning Engine Module → Publishes

| Event | Trigger | Consumers |
|---|---|---|
| `ImprovementRecommendationGeneratedEvent` | Recommendations mới được tạo | Content Brain |

**ImprovementRecommendationGeneratedEvent payload:**
```
tenantId, recommendationIds[], topPatternIds[]
```

---

## Event Flow Diagram (Cross-module)

```
Accounts ──── AccountCreatedEvent ────────────► AI Engine (init prompts)
         └─── AccountCreatedEvent ────────────► Audience (init profile)
         └─── SocialAccountConnectedEvent ────► Analytics (begin tracking)
         └─── SocialAccountConnectedEvent ────► Audience (begin analysis)

Trends ─────── TrendDetectedEvent ────────────► Content Brain (suggest angles)

ContentBrain ── ContentIdeaPublishedEvent ────► Analytics (begin tracking)
             └── ContentIdeaPublishedEvent ───► Learning (record metadata)

Analytics ───── PerformanceMilestoneEvent ───► Learning (trigger analysis)
           └─── LowPerformanceDetectedEvent ─► Learning (negative signal)

Learning ─────── ImprovementRecommendationGeneratedEvent ─► Content Brain
```

---

## Quy tắc Quan trọng

1. **Events chỉ đi một chiều** — không có circular dependencies
2. **Không có event loop** — Module A → B → A là forbidden
3. **Event handlers không được throw** — wrap trong try-catch, log errors
4. **Event payload phải immutable** — không mutate sau khi publish
5. **Tên event: past tense** — `TrendDetectedEvent`, `ContentIdeaPublishedEvent`
6. **Event base class:** `IDomainEvent` trong `src/shared/Events/`
7. **Event handler location:** `src/modules/{module}/Application/Events/{Event}Handler.cs`

---

## Notification Events (Future Phase 2)

Một số events hiện chỉ trigger user notification (không có cross-module handler):
- `TrendPeakedEvent` → push notification đến user
- `TrendDecliningEvent` → push notification
- `TokenExpiredEvent` → banner warning trên dashboard
- `PipelineRunCompletedEvent` → in-app notification

Phase 2 sẽ implement `NotificationModule` để handle tất cả notification delivery.
