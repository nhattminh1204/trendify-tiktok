using FluentValidation;

namespace Trendify.Modules.Accounts.Application.Commands.Login;

public class GoogleLoginValidator : AbstractValidator<GoogleLoginCommand>
{
    public GoogleLoginValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty().WithMessage("Google access token is required");
    }
}
