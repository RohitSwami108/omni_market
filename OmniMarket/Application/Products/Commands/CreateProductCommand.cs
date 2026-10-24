using MediatR;
using OmniMarket.Domain.Entities;
namespace OmniMarket.Application.Products.Commands; 
public record CreateProductCommand(
    string Name,
    string SKU,
    decimal Price,
    int Stock,
    Guid CategoryId,
    string? ImageUrl) : IRequest<Guid>;
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid> {
    public async Task<Guid> Handle(CreateProductCommand request,CancellationToken cancellationToken) {
        var product = new Product(request.Name, request.SKU, request.Price, request.Stock, request.CategoryId);
        return await Task.FromResult(product.Id);
    }
}
