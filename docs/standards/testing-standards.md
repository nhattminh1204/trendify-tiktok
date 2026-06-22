# Testing Standards — Trendify

## Test Pyramid

```
          /\
         /  \   E2E Tests (few, slow, high confidence)
        /----\
       /      \  Integration Tests (medium, test full slices)
      /--------\
     /          \ Unit Tests (many, fast, test business logic)
    /____________\
```

---

## Test Types

### Unit Tests
- Location: `tests/unit/{Module}/`
- What to test: Domain logic, business rules, validators, calculations
- What NOT to unit test: Database, cache, HTTP, file I/O
- Framework: xUnit + FluentAssertions
- Mocking: NSubstitute (not Moq)
- Coverage requirement: Happy path + ≥2 edge cases per business rule
- Speed: Every unit test must run in < 100ms

### Integration Tests
- Location: `tests/integration/{Module}/`
- What to test: Full vertical slice — API endpoint → handler → database → response
- Database: Real PostgreSQL (Testcontainers), not in-memory EF Core
- Cache: Real Redis (Testcontainers)
- AI calls: Mocked at the `IAIProvider` interface level
- External APIs (TikTok): Mocked with recorded responses (WireMock)
- Framework: xUnit + WebApplicationFactory + Testcontainers

### E2E Tests
- Location: `tests/e2e/`
- What to test: Critical user journeys only
- Tool: Playwright (frontend) or RestSharp (API journeys)
- When to run: Pre-deployment gate only, not on every PR

---

## Test Naming Convention

```
{MethodOrFeature}_{Scenario}_{ExpectedResult}

Examples:
GenerateIdea_WhenTrendProvided_ReturnsRelevantIdea
GenerateIdea_WhenBudgetExceeded_ThrowsAIBudgetException
Login_WithInvalidCredentials_Returns401
```

---

## Arrange-Act-Assert Pattern

All tests follow AAA strictly:

```csharp
[Fact]
public async Task GenerateIdea_WhenTrendProvided_ReturnsRelevantIdea()
{
    // Arrange
    var trend = TrendBuilder.Active().WithKeyword("morning routine").Build();
    var sut = new IdeaGenerationService(_mockAIProvider, _mockRepository);

    // Act
    var result = await sut.GenerateAsync(new GenerateIdeaCommand(trend.Id));

    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Title.Should().NotBeEmpty();
    result.Value.TrendId.Should().Be(trend.Id);
}
```

---

## Test Data Management

- Use builder pattern for test entities: `TrendBuilder`, `ContentIdeaBuilder`, `UserBuilder`
- No hardcoded IDs in tests — always use `Guid.NewGuid()` or builders
- Integration test database is reset between test classes (not between tests within a class)
- Shared test fixtures for expensive setup (Testcontainers spin-up)

---

## What NOT to Test

- Framework behavior (ASP.NET routing, EF Core tracking) — trust the framework
- Simple DTOs and mapping with no logic
- Configuration reading
- Log statements

---

## AI Feature Testing

- Never call real AI providers in tests — costs money and is non-deterministic
- Mock `IAIProvider` at the interface level
- For prompt testing: maintain a separate `tests/prompts/` folder with golden input/output pairs
- Prompt regression tests run weekly in CI, not on every PR

---

## CI Requirements

Every PR must pass:
1. `dotnet test tests/unit/` — all unit tests green
2. `dotnet test tests/integration/` — all integration tests green
3. Build with no warnings (`-warnaserror`)
4. Linting (EditorConfig rules)

E2E tests run on the staging environment as a post-deploy gate.

---

## Test Coverage Policy

- No hard coverage percentage requirement (coverage % encourages meaningless tests)
- Every business rule must have at least one test
- Every API endpoint must have at least one integration test
- PRs that add business logic without tests will be rejected in code review
