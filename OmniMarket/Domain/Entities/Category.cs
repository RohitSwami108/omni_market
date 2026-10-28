namespace OmniMarket.Domain.Entities {
    public class Category {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }
        public bool IsActive { get; private set; }

        public ICollection<Product> Products { get; private set; } = new List<Product>();
        private Category() { }
        public Category(string name,string? decription) {
            Id = Guid.NewGuid();
            Name = name;
            Description = decription;
            IsActive = true;
        }
        public void Update(string name,string? description,bool isActive) {
            Name = name;
            Description = description;
            IsActive = isActive;
        }
    }
}
