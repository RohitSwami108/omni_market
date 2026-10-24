namespace OmniMarket.Domain.ValueObjects {
    public class RefreshToken {
        public string Token { get; }
        public DateTime ExpireAt { get; }
        public string CreatedById { get; }
        public DateTime? RevokedAt { get; private set; }
        public bool IsExpired => DateTime.UtcNow >= ExpireAt;
        public bool IsActive => RevokedAt == null && !IsExpired;
        public RefreshToken(string token, DateTime expireAt, string createdById) {
            if (string.IsNullOrWhiteSpace(token)) throw new ArgumentException("Token value string can not be empty.", nameof(token));
            Token = token;
            ExpireAt = expireAt;
            CreatedById = createdById;
        }
        public void Revoke() {
            if (RevokedAt != null) throw new InvalidOperationException("This token has already been taken.");
            RevokedAt = DateTime.UtcNow;
        }
    }
}
