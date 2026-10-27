using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Infrastructure.Persistence;
public record DeleteProductCommand(Guid Id) : IRequest<bool>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand,bool> {
    private readonly ApplicationDbContext _context;
    public DeleteProductCommandHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<bool> Handle(DeleteProductCommand request,CancellationToken cancellationToken) {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (product == null) return false;
        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
