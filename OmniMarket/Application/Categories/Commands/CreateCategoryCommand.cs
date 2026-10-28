using MediatR;
using OmniMarket.Domain.Entities;
using OmniMarket.Infrastructure.Persistence;

namespace OmniMarket.Application.Categories.Commands;
public record CreateCategoryCommand(string Name,string? Description) : IRequest<Guid>;
public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand,Guid> {
    private readonly ApplicationDbContext _context;
    public CreateCategoryCommandHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<Guid> Handle(CreateCategoryCommand request,CancellationToken cancellationToken) {
        var category = new Category(request.Name, request.Description);
        await _context.Categories.AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return category.Id;
    }
}
