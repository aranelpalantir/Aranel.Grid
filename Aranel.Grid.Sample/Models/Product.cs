namespace Aranel.Grid.Sample.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Category { get; set; }
        public DateTime ReleaseDate { get; set; }
        public DateTime WarrantyExpiry { get; set; }
        public bool InStock { get; set; }
    }
}
