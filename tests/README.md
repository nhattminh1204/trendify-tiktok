# Tests

See `docs/standards/testing-standards.md` for full testing guidelines.

## Structure

```
tests/
  unit/                     — Fast, no I/O. Business logic only.
    Accounts/
    Trends/
    Audience/
    Content/
    Analytics/
    Learning/
    AIEngine/
  integration/              — Full vertical slice with real DB + cache (Testcontainers)
    Accounts/
    Trends/
    Audience/
    Content/
    Analytics/
    Learning/
    AIEngine/
  e2e/                      — Critical user journeys only (Playwright or RestSharp)
    Journeys/
```

## Running Tests

```bash
# Unit tests (fast, no Docker required)
dotnet test tests/unit/

# Integration tests (requires Docker for Testcontainers)
dotnet test tests/integration/

# All tests
dotnet test
```
