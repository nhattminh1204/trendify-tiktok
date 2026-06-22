using FluentValidation;

namespace Trendify.Modules.Accounts.Application.Commands.RegisterWorkspace;

public sealed class RegisterWorkspaceValidator : AbstractValidator<RegisterWorkspaceCommand>
{
    public RegisterWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceName)
            .NotEmpty().WithMessage("Workspace name is required.")
            .MaximumLength(255).WithMessage("Workspace name must not exceed 255 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.");

        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Display name is required.")
            .MaximumLength(255);
    }
}
