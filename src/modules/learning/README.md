# Module: Learning Engine

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/learning.md](../../../docs/features/learning.md)

## Responsibilities

- Historical content performance analysis
- Winning and losing pattern detection
- Improvement recommendation generation
- Feedback loop into Content Brain

## Dependencies

- **Publishes events to:** Content Brain
- **Consumes events from:** Analytics (`PerformanceMilestoneReachedEvent`, `LowPerformanceDetectedEvent`), Content (`ContentIdeaPublishedEvent`)
- **Background jobs:** `LearningAnalysisJob`
