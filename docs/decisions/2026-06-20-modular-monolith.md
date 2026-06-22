# ADR: Modular Monolith Architecture

- **Date:** 2026-06-20
- **Status:** Accepted

## Context

Trendify needs to support 1 user in Phase 1 and scale to 10,000 users in Phase 3 without major redesign. Two competing options were considered: microservices and modular monolith.

## Decision

Use a **Modular Monolith** deployed as a single application. Modules are strictly bounded but share a process, database, and deployment unit.

## Alternatives Considered

### Microservices
- Rejected for Phase 1–2 because:
  - Operational overhead is too high for a solo or small team (8 services × Docker + networking + distributed tracing + service mesh)
  - Network latency between services adds complexity with no benefit at low scale
  - Distributed transactions are complex and error-prone
  - Cost: 8 separate services on a VPS = either over-provisioning or under-resourcing

### Big-ball-of-mud Monolith
- Rejected because it does not preserve the ability to extract services later
- No module boundaries means every file can depend on any other — leads to spaghetti at Phase 3

## Consequences

**Made easier:**
- Single deployment unit — one Docker container, one CI pipeline
- In-process domain events — no message broker needed in Phase 1
- Simple transactions — all modules share one PostgreSQL connection
- Low operational cost — fits on a $20/month VPS

**Made harder:**
- If one module has a memory leak, it affects all modules
- Scaling individual modules independently requires extraction to a service (Phase 3 concern)
- All modules must be on the same .NET version

## Migration Path to Microservices (Phase 3+)

Because modules are strictly bounded (no cross-module imports, events-only communication), extracting a module to a microservice follows this process:
1. Replace in-process `IDomainEvent` dispatch with a message broker (RabbitMQ or Kafka)
2. Move the module's database tables to a separate PostgreSQL instance
3. Extract the module to its own deployable .NET project
4. No business logic changes required
