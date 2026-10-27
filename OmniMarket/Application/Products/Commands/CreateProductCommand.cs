using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Domain.Entities;
using OmniMarket.Infrastructure.Persistence;
namespace OmniMarket.Application.Products.Commands; 
public record CreateProductCommand(
    string Name,
    string SKU,
    decimal Price,
    int Stock,
    Guid CategoryId,
    string? ImageUrl) : IRequest<Guid>;
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid> {
    private readonly ApplicationDbContext _context;
    public CreateProductCommandHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<Guid> Handle(CreateProductCommand request,CancellationToken cancellationToken) {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken);
        if (!categoryExists) throw new ArgumentException($"Category with ID {request.CategoryId} does not exists ");
        var product = new Product(request.Name, request.SKU, request.Price, request.Stock, request.CategoryId);
        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync(cancellationToken);
        return product.Id;
    }
}
