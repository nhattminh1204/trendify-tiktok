# Shared — Contracts Only

This directory contains ONLY interfaces, base types, and contracts.
NO implementations. NO framework dependencies (except pure .NET).

Any module can reference src/shared. No module can reference src/infrastructure.

## Contents

```
shared/
  Abstractions/
    ICurrentUser.cs         — Identity: UserId, TenantId, Role
    IDomainEvent.cs         — Base marker interface for all events
    ICacheService.cs        — Get/Set/Delete cache operations
    IStorageService.cs      — Upload/Download/Delete files
    IJobScheduler.cs        — Enqueue background jobs
    IAIProvider.cs          — Complete(AIRequest) → AIResponse
  Responses/
    ApiResponse.cs          — Standard API envelope
    ErrorResponse.cs        — Standard error shape
    PagedResult.cs          — Pagination wrapper
  Errors/
    ErrorCodes.cs           — All platform error code constants
    DomainException.cs      — Base domain exception
  Events/
    DomainEventBase.cs      — Base record for domain events
```
