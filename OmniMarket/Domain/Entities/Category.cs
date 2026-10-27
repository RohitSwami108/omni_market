namespace OmniMarket.Domain.Entities {
    public class Category {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public Category(string name ) {
            if (string.IsNullOrEmpty(name)) {
                throw new ArgumentException("Category name can not be empty.",nameof(name));
            }
            Id = Guid.NewGuid();
            Name = name;
        }
    }
}
