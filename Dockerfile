# ── Build stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution + csproj files first (layer cache for NuGet restore)
COPY Trendify.sln ./
COPY src/backend/Trendify.Shared/Trendify.Shared.csproj                         src/backend/Trendify.Shared/
COPY src/backend/Trendify.Infrastructure/Trendify.Infrastructure.csproj         src/backend/Trendify.Infrastructure/
COPY src/backend/Trendify.Api/Trendify.Api.csproj                               src/backend/Trendify.Api/
COPY src/backend/Trendify.Modules.Accounts/Trendify.Modules.Accounts.csproj     src/backend/Trendify.Modules.Accounts/
COPY src/backend/Trendify.Modules.Trends/Trendify.Modules.Trends.csproj         src/backend/Trendify.Modules.Trends/
COPY src/backend/Trendify.Modules.Audience/Trendify.Modules.Audience.csproj     src/backend/Trendify.Modules.Audience/
COPY src/backend/Trendify.Modules.Content/Trendify.Modules.Content.csproj       src/backend/Trendify.Modules.Content/
COPY src/backend/Trendify.Modules.Analytics/Trendify.Modules.Analytics.csproj   src/backend/Trendify.Modules.Analytics/
COPY src/backend/Trendify.Modules.Learning/Trendify.Modules.Learning.csproj     src/backend/Trendify.Modules.Learning/
COPY src/backend/Trendify.Modules.AIEngine/Trendify.Modules.AIEngine.csproj     src/backend/Trendify.Modules.AIEngine/
COPY tests/Trendify.Tests.Unit/Trendify.Tests.Unit.csproj                       tests/Trendify.Tests.Unit/
COPY tests/Trendify.Tests.Integration/Trendify.Tests.Integration.csproj         tests/Trendify.Tests.Integration/

RUN dotnet restore src/backend/Trendify.Api/Trendify.Api.csproj

# Copy all source and publish
COPY src/backend/ src/backend/
RUN dotnet publish src/backend/Trendify.Api/Trendify.Api.csproj \
    -c Release -o /app/publish \
    --no-restore

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Trendify.Api.dll"]
