# ADR: Inter-Module Communication Strategy

- **Date:** 2026-06-20
- **Status:** Accepted

## Context

Trendify has 8 modules that need to communicate (e.g., when a trend is detected, Content Brain should be notified). Without a defined communication strategy, modules will start importing each other's types — creating hidden coupling that violates the Modular First principle and makes future extraction impossible.

## Decision

Modules communicate **exclusively via in-process domain events** using MediatR's `INotification` / `INotificationHandler<T>` pattern.

- Module A publishes an `IDomainEvent` (defined in `src/shared/`)
- Module B registers an `INotificationHandler<ThatEvent>`
- No direct service-to-service calls between modules

## Alternatives Considered

### Direct Service Injection (DI)
- Module A injects Module B's service via interface
- Rejected because: creates compile-time coupling between modules, prevents independent extraction, causes circular dependency risks, violates the "independently removable" core principle

### Message Broker (RabbitMQ / Kafka)
- Decoupled, supports async processing across process boundaries
- Rejected for Phase 1–2 because:
  - Adds significant operational complexity (another service to deploy and monitor)
  - Overkill for in-process communication
  - In-process events are sufficient when all modules are in one process
- **Adopted as the migration path when a module is extracted to microservice in Phase 3**

### HTTP API calls between modules
- Rejected: network overhead, circular dependencies, tight coupling via endpoint contracts

## Consequences

**Made easier:**
- Modules are genuinely independent at the code level
- Removing a module means removing its event handlers — no other module breaks
- Testing: event handlers are tested in isolation
- Adding a new module that reacts to existing events requires no changes to the publishing module

**Made harder:**
- Debugging event flows requires tracing through MediatR handlers (mitigated by correlation IDs in logs)
- No guaranteed delivery — if a handler throws, the event is lost (mitigated by error logging and retry logic in handlers)
- Ordering of event handlers is not guaranteed (handlers should not depend on each other's side effects)

## Event Contract Rules

1. Events are defined in `src/shared/Events/` — not inside individual modules
2. Event names are past tense: `TrendDetectedEvent`, not `TrendDetectEvent`
3. Events carry only the data needed by handlers — not full domain objects
4. Events are immutable records: `public record TrendDetectedEvent(Guid TrendId, Guid TenantId, decimal Score);`
5. Events include `TenantId` always — handlers use it to scope their operations

## Migration to Message Broker

When extracting a module to a microservice:
1. Replace `_mediator.Publish(event)` with `_messageBus.PublishAsync(event)`
2. Replace `INotificationHandler<T>` with a message consumer
3. The event contract (the record definition) does not change
4. No business logic changes required in either module
