using Aranel.Grid.Sample.Models;

namespace Aranel.Grid.Sample.Data
{
    public static class SampleProducts
    {
        public static List<Product>? Data=new List<Product>();

        static SampleProducts()
        {
            Random random = new Random();
            string[] categories = { "Electronics", "Accessories", "Furniture", "Appliances", "Toys", "Books", "Clothing" };
            string[] productNames = { "Laptop", "Mouse", "Keyboard", "Monitor", "Printer", "Desk Chair", "Desk", "USB Hub", "Webcam", "Headphones",
                "Microphone", "Smartphone", "Tablet", "Smartwatch", "External Hard Drive", "Camera", "Router", "Mouse Pad",
                "Graphics Card", "Power Supply" };

            for (int i = 1; i <= 1500; i++)
            {
                var category = categories[random.Next(categories.Length)];
                var name = $"{productNames[random.Next(productNames.Length)]} {i}";
                var price = random.Next(10, 2000);
                var releaseDate = DateTime.Now.AddDays(-random.Next(0, 365 * 5));
                var warrantyExpiry = releaseDate.AddYears(2).AddMonths(random.Next(1, 12)).AddHours(random.Next(0, 24)).AddMinutes(random.Next(0, 60));
                var inStock = random.NextDouble() >= 0.3;

                Data.Add(new Product
                {
                    Id = i,
                    Name = name,
                    Price = price,
                    Category = category,
                    ReleaseDate = releaseDate,
                    WarrantyExpiry = warrantyExpiry,
                    InStock = inStock
                });
            }
        }
      
    }
}
