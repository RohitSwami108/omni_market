namespace OmniMarket.Application.Common {
    public class PaginationList<T> {
        public List<T> Items { get; }
        public int PageNumber { get; }
        public int TotalPages { get; }
        public int TotalCount { get; }
        public int Count { get; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
        public PaginationList(List<T> items,int count,int pageNumber,int pageSize) { 
            Items = items;
            PageNumber = pageNumber;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            TotalCount = count;
            Count = items.Count;
        }
    }
}
