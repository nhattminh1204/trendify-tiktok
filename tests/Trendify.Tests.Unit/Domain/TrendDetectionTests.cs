using FluentAssertions;
using Trendify.Modules.Trends.Domain;
using Xunit;

namespace Trendify.Tests.Unit.Domain;

public sealed class TrendDetectionTests
{
    private static readonly Guid TenantId = Guid.NewGuid();

    [Fact]
    public void Detect_WithHighScores_ShouldStatusPeaked()
    {
        var trend = TrendDetection.Detect(
            TenantId, "viral dance", "fitness", "tiktok",
            velocityScore: 1.0m, volumeScore: 1.0m,
            engagementScore: 1.0m, recencyScore: 1.0m
        );

        trend.Score.Should().Be(100m);
        trend.Status.Should().Be("peaked");
    }

    [Fact]
    public void Detect_WithLowScores_ShouldStatusRising()
    {
        var trend = TrendDetection.Detect(
            TenantId, "niche topic", "tech", "tiktok",
            velocityScore: 0.3m, volumeScore: 0.4m,
            engagementScore: 0.5m, recencyScore: 0.9m
        );

        trend.Status.Should().Be("rising");
    }

    [Fact]
    public void UpdateScore_DropToExpired_ShouldSetExpiredStatus()
    {
        var trend = TrendDetection.Detect(
            TenantId, "old trend", "beauty", "tiktok",
            velocityScore: 0.8m, volumeScore: 0.8m,
            engagementScore: 0.8m, recencyScore: 0.8m
        );

        trend.UpdateScore(0.0m, 0.0m, 0.0m, 0.0m);

        trend.Status.Should().Be("expired");
        trend.Score.Should().Be(0m);
    }

    [Fact]
    public void UpdateScore_ToHighScore_ShouldSetPeakAt()
    {
        var trend = TrendDetection.Detect(
            TenantId, "rising star", "cooking", "tiktok",
            velocityScore: 0.4m, volumeScore: 0.5m,
            engagementScore: 0.4m, recencyScore: 0.8m
        );

        trend.PeakAt.Should().BeNull();

        trend.UpdateScore(1.0m, 1.0m, 1.0m, 1.0m);

        trend.Status.Should().Be("peaked");
        trend.PeakAt.Should().NotBeNull();
    }
}
