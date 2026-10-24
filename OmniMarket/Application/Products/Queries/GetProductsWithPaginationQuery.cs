using MediatR;
using OmniMarket.Application.Common;
using OmniMarket.Application.Products.DTOs;
namespace OmniMarket.Application.Products.Queries;

public record GetProductsWithPaginationQuery(
    string? SearchTerm,
    Guid? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? SortBy,// Sort by "name" or "price"
    string? SortOrder,// Sort order "asc" or "desc"
    int PageNumber = 1,
    int PageSize = 1
    ) : IRequest<PaginationList<ProductDto>>;

public class GetProductsWithPaginationQueryHandler : IRequestHandler<GetProductsWithPaginationQuery, PaginationList<ProductDto>> {
    public async Task<PaginationList<ProductDto>> Handle(GetProductsWithPaginationQuery request, CancellationToken cancellationToken) {
        var mockDatabase = new List<ProductDto> {
            new() { Id = Guid.NewGuid(), Name = "Wireless Mouse", SKU = "TECH-MSE-001", Price = 25.99m, Stock = 50, CategoryId = Guid.NewGuid() },
            new() { Id = Guid.NewGuid(), Name = "Mechanical Keyboard", SKU = "TECH-KBD-002", Price = 89.99m, Stock = 15, CategoryId = Guid.NewGuid() },
            new() { Id = Guid.NewGuid(), Name = "Leather Office Chair", SKU = "FURN-CHR-044", Price = 199.99m, Stock = 8, CategoryId = Guid.NewGuid() }
        }.AsQueryable();
        if (string.IsNullOrWhiteSpace(request.SearchTerm)) {
            mockDatabase = mockDatabase.Where(p =>
                p.Name.Contains(request.SearchTerm ?? "", StringComparison.OrdinalIgnoreCase) ||
                p.SKU.Contains(request.SearchTerm ?? "", StringComparison.OrdinalIgnoreCase));
        }
        if(request.MinPrice.HasValue) {
            mockDatabase = mockDatabase.Where(p => p.Price >= request.MinPrice.Value);
        }
        if (request.MaxPrice.HasValue) {
            mockDatabase = mockDatabase.Where(p => p.Price <= request.MaxPrice.Value);
        }
        if (!string.IsNullOrWhiteSpace(request.SortBy)) {
            bool IsDescending = string.Equals(request.SortOrder, "desc", StringComparison.OrdinalIgnoreCase);
            mockDatabase = request.SortBy.ToLower() switch {
                "price" => IsDescending ? mockDatabase.OrderByDescending(p => p.Price) : mockDatabase.OrderBy(p => p.Price),
                "sku" => IsDescending ? mockDatabase.OrderByDescending(p => p.Price) : mockDatabase.OrderBy(p => p.SKU),
                _ => IsDescending ? mockDatabase.OrderByDescending(p => p.Name) : mockDatabase.OrderBy(p => p.Name)
            };
        }
        int totalRecords = mockDatabase.Count();
        var paginatedItems = mockDatabase.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();
        var result = new PaginationList<ProductDto>(paginatedItems, totalRecords, request.PageSize, request.PageSize);
        return await Task.FromResult(result);
    }
}