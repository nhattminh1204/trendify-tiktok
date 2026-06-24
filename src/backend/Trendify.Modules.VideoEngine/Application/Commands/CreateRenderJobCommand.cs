using MediatR;

namespace Trendify.Modules.VideoEngine.Application.Commands;

public sealed record CreateRenderJobCommand(
    Guid? CampaignId,
    Guid? ContentIdeaId,
    string TemplateId,
    string VoiceId,
    string TtsEngine,
    string ScriptText,
    string? CaptionText,
    string[]? Hashtags,
    string[]? AssetUrls
) : IRequest<Guid>;
