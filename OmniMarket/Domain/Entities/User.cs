using OmniMarket.Domain.ValueObjects;

namespace OmniMarket.Domain.Entities {
    public class User {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public Guid RoleId { get; private set; }
        public bool IsActive { get; private set; } = true;
        public List<RefreshToken> RefreshTokens { get; private set; } = new();
        public User(string email , string passwordHash,Guid roleId) {
            if (string.IsNullOrWhiteSpace(email)) {
                throw new ArgumentException("Email can not be empty.", nameof(email));
            }
            if (string.IsNullOrWhiteSpace(passwordHash)){
                throw new ArgumentException("Password hash can not be empty.", nameof(passwordHash));
            }
            Id = Guid.NewGuid();
            Email = email;
            PasswordHash = passwordHash;
            RoleId = roleId;
        }
        public void Deactivate() {
            IsActive = false;
        }
        public void Activate() {
            IsActive = true;
        }
    }
}
