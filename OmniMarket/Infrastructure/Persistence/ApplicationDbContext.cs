using Microsoft.EntityFrameworkCore;
using OmniMarket.Domain.Entities;
namespace OmniMarket.Infrastructure.Persistence;
public class ApplicationDbContext : DbContext {
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options){ }
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>(entity => {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.OwnsMany(u => u.RefreshTokens, token => {
                token.WithOwner().HasForeignKey("UserId");
                token.Property(t => t.Token).IsRequired().HasMaxLength(500);
            });
        });
        modelBuilder.Entity<Category>(entity => {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(c => c.Name).IsUnique();
        });
        // Configure Product Entity Mappings
        modelBuilder.Entity<Product>(entity => {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(150);
            entity.Property(p => p.SKU).IsRequired().HasMaxLength(50);
            entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
        });
    }
}
