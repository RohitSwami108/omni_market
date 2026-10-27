using FluentValidation;
namespace OmniMarket.Application.Authentication;
public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>{
    public void RegisterUserValidator() {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("A valid email layout must be specified");
        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("Password field can not be empty")
            .MinimumLength(6).WithMessage("Password security length must be at least 6 charectors long.");
        RuleFor(v => v.RoleId)
            .NotEmpty().WithMessage("A valid structural Role boundary definition is required.");
    }
}