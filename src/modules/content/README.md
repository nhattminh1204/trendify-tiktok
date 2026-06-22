# Module: Content Brain + Content Factory

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/content.md](../../../docs/features/content.md)

## Responsibilities

### Content Brain
- AI idea generation
- Hook, script, and CTA writing
- Content strategy building
- Idea board and lifecycle management

### Content Factory
- Production pipeline management
- Voice and subtitle generation
- Media asset storage (MinIO)

## Dependencies

- **Publishes events to:** Analytics, Learning Engine
- **Consumes events from:** Trends (`TrendDetectedEvent`), Learning (`ImprovementRecommendationGeneratedEvent`)
- **Background jobs:** `ContentPipelineJob`
