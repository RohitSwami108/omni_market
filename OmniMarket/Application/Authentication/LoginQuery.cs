using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMarket.Infrastructure.Persistence;
using OmniMarket.Infrastructure.Security;
namespace OmniMarket.Application.Authentication;
public record LoginQuery(string Email, string Password) : IRequest<string>;
public class LoginQueryHandler : IRequestHandler<LoginQuery, string> {
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    public LoginQueryHandler(ApplicationDbContext context) {
        _context = context;
        _passwordHasher = new PasswordHasher();
        _jwtTokenGenerator = new JwtTokenGenerator();
    }
    public async Task<string> Handle(LoginQuery request, CancellationToken cancellationToken) {
        var normalizeEmail = request.Email.ToLower().Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizeEmail, cancellationToken);
        if(user == null || !user.IsActive) {
            throw new UnauthorizedAccessException("Invalid login credentials provided.");
        }
        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedAccessException("Invalid login credentials provided.");
        }
        return _jwtTokenGenerator.GenerateToken(user.Id, user.Email, user.RoleId);
    }
}
