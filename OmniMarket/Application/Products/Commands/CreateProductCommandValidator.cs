using FluentValidation;

namespace OmniMarket.Application.Products.Commands;
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand> {
    public void CreateProductValidator(){
        RuleFor(x => x.Name).NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");
        RuleFor(x => x.SKU).NotEmpty().WithMessage("SKU is required.")
            .Matches(@"^[A-Z0-9]{8,12}$").WithMessage("SKU must be 8-12 alphanumeric characters.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greated than 0.");
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative.");
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("A valid Category ID must be provided.");
    }
}
