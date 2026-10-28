using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Infrastructure.Persistence;
namespace OmniMarket.Application.Categories.Queries;

public record CategoryDto(Guid Id, string Name, string? Description, bool IsActive);
public record GetCategoriesQuery : IRequest<List<CategoryDto>>;
public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>> {
    private readonly ApplicationDbContext _context;
    public GetCategoriesQueryHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request,CancellationToken cancellationToken) {
        return await _context.Categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsActive))
            .ToListAsync(cancellationToken);
    }
}