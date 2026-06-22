# Module: Accounts

**Owner:** —
**Status:** Planned
**Feature Doc:** [docs/features/accounts.md](../../../docs/features/accounts.md)

## Responsibilities

- User registration and authentication
- Workspace (tenant) management
- TikTok OAuth integration
- Social account lifecycle management
- Account grouping

## Internal Structure

```
accounts/
  Domain/
    Workspace.cs
    User.cs
    SocialAccount.cs
    AccountGroup.cs
    AccountErrors.cs
  Application/
    Commands/
    Queries/
    Events/
  Infrastructure/
    AccountsRepository.cs
    AccountsDbConfiguration.cs
    TikTokOAuthService.cs
  API/
    AccountsEndpoints.cs
    Requests/
    Responses/
```

## Dependencies

- **Publishes events to:** AI Engine, Audience Intelligence, Analytics
- **Consumes events from:** None
- **Shared contracts used:** `ICurrentUser`, `ApiResponse<T>`, `IDomainEvent`
