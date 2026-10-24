namespace OmniMarket.Domain.Entities {
    public class Product {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string SKU { get; private set; } = string.Empty;
        public decimal Price { get; private set; }
        public int Stock { get; private set; }
        public Guid CategoryId { get; private set; }
        public string? ImageUrl { get; private set; } // Nullable, as an image is optional
        public Product(string name,string sku,decimal price,int stock,Guid categoryId,string? imageUrl = null) {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Product name can not be empty.", nameof(name));
            if (string.IsNullOrWhiteSpace(sku)) throw new ArgumentException("SKU stock keeping unit can not be empty.", nameof(sku));
            if (price < 0) throw new ArgumentException("Price can not be a negative amount.");
            if (stock < 0) throw new ArgumentException("Initial stock level can not be negative.");
            Id = Guid.NewGuid();
            Name = name;
            SKU = sku;
            Price = price;
            Stock = stock;
            CategoryId = categoryId;
            ImageUrl = imageUrl;
        }
        public void UpdateStock(int quantity) {
            if (Stock + quantity < 0) throw new InvalidOperationException("Operation failed: Insufficient stock inventory available.");
            Stock += quantity;
        }
        public void UpdatePrice(int newPrice) {
            if (newPrice < 0) throw new ArgumentOutOfRangeException(nameof(newPrice), "Price can not be negative amount.");
            Price = newPrice;
        }
    }
}
