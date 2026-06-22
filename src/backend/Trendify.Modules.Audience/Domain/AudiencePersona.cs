using Trendify.Shared.Domain;

namespace Trendify.Modules.Audience.Domain;

public sealed class AudiencePersona : TenantEntity
{
    public Guid ProfileId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int AgeMin { get; private set; }
    public int AgeMax { get; private set; }
    public string Gender { get; private set; } = "all";
    public string[] Interests { get; private set; } = [];
    public string[] PainPoints { get; private set; } = [];
    public string[] ContentPreferences { get; private set; } = [];

    // Percentage of audience this persona represents
    public decimal Percentage { get; private set; }

    private AudiencePersona() { }

    public static AudiencePersona Create(
        Guid tenantId,
        Guid profileId,
        string name,
        string description,
        int ageMin,
        int ageMax,
        string gender,
        string[] interests,
        string[] painPoints,
        string[] contentPreferences,
        decimal percentage)
    {
        return new AudiencePersona
        {
            TenantId = tenantId,
            ProfileId = profileId,
            Name = name,
            Description = description,
            AgeMin = ageMin,
            AgeMax = ageMax,
            Gender = gender,
            Interests = interests,
            PainPoints = painPoints,
            ContentPreferences = contentPreferences,
            Percentage = percentage
        };
    }

    public void Update(
        string description,
        string[] interests,
        string[] painPoints,
        string[] contentPreferences,
        decimal percentage)
    {
        Description = description;
        Interests = interests;
        PainPoints = painPoints;
        ContentPreferences = contentPreferences;
        Percentage = percentage;
        MarkUpdated();
    }
}
