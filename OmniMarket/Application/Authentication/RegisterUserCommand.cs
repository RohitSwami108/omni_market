using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Domain.Entities;
using OmniMarket.Infrastructure.Persistence;
using OmniMarket.Infrastructure.Security;
namespace OmniMarket.Application.Authentication;
public record RegisterUserCommand(string Email, string Password, Guid RoleId) : IRequest<Guid>;
public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid> {
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    public RegisterUserCommandHandler(ApplicationDbContext context) {
        _context = context;
    }
    public async Task<Guid> Handle(RegisterUserCommand request,CancellationToken cancellationToken) {
        var normalizeEmail = request.Email.ToLower().Trim();
        var emailExists = await _context.Users.AnyAsync(p => p.Email == normalizeEmail, cancellationToken);
        if (emailExists) {
            throw new ArgumentException("A user with this email already exists.");
        }
        var passwordHasher = new PasswordHasher();
        var hashPassword = passwordHasher.HashPassword(request.Password);
        var user = new User(normalizeEmail, hashPassword, request.RoleId);
        await _context.Users.AddAsync(user,cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}