using FluentValidation;

namespace Trendify.Modules.VideoEngine.Application.Commands;

public sealed class CreateRenderJobCommandValidator : AbstractValidator<CreateRenderJobCommand>
{
    public CreateRenderJobCommandValidator()
    {
        RuleFor(x => x.ScriptText).NotEmpty().MaximumLength(10000);
        RuleFor(x => x.TemplateId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.VoiceId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TtsEngine).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CaptionText).MaximumLength(2000);
        RuleFor(x => x.Hashtags).Must(h => h == null || h.Length <= 30)
            .WithMessage("Maximum 30 hashtags.");
    }
}
