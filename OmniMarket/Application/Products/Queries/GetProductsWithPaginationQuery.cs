using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Application.Common;
using OmniMarket.Application.Products.DTOs;
using OmniMarket.Infrastructure.Persistence;
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


public class GetProductsWithPaginationQueryHandler: IRequestHandler<GetProductsWithPaginationQuery,PaginationList<ProductDto>> {
    private readonly ApplicationDbContext _context;
    public GetProductsWithPaginationQueryHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<PaginationList<ProductDto>> Handle(GetProductsWithPaginationQuery request,CancellationToken cancellationToken) {
        var query = _context.Products.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(request.SearchTerm)) {
            var term = $"%{request.SearchTerm.Trim()}%";
            query = query.Where(p =>EF.Functions.Like(p.Name, term) || EF.Functions.Like(p.SKU, term));
        }
        if (request.CategoryId.HasValue) {
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);
        }
        if (request.MinPrice.HasValue) {
            query = query.Where(p => p.Price >= request.MinPrice.Value);
        }
        if (request.MaxPrice.HasValue) {
            query = query.Where(p => p.Price <= request.MaxPrice.Value);
        }
        var totalRecords = await query.CountAsync(cancellationToken);
        var descending = string.Equals(request.SortOrder,"desc",StringComparison.OrdinalIgnoreCase);
        query = (request.SortBy?.ToLowerInvariant(), descending) switch {
            ("price", true) => query.OrderByDescending(p => p.Price),
            ("price", false) => query.OrderBy(p => p.Price),
            ("sku", true) => query.OrderByDescending(p => p.SKU),
            ("sku", false) => query.OrderBy(p => p.SKU),
            ("name", true) => query.OrderByDescending(p => p.Name),
            _ => query.OrderBy(p => p.Name)
        };
        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var products = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Price = p.Price,
                Stock = p.Stock,
                CategoryId = p.CategoryId
            }).ToListAsync(cancellationToken);
        return new PaginationList<ProductDto>(products,totalRecords,pageNumber,pageSize);
    }
}
