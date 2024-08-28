using System.Globalization;
using Aranel.Grid.DataSource;
using Aranel.Grid.Sample.Data;
using Aranel.Grid.Sample.Models;
using Microsoft.AspNetCore.Mvc;

namespace Aranel.Grid.Sample.Controllers
{
    public class ProductController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public JsonResult GetProducts([FromBody] DataSourceLoadOptions dataSourceLoadOptions)
        {
            var query = SampleProducts.Data.AsQueryable();
            var result = DataSourceLoader.Load(dataSourceLoadOptions, query, new CultureInfo("tr-TR"));
            return Json(result);

        }
        public IActionResult Create()
        {
            return PartialView("_CreatePartialView", new Product());
        }

        [HttpPost]
        public IActionResult Create(Product model)
        {
            if (ModelState.IsValid)
            {
                var product = new Product();
                product.Id = SampleProducts.Data.MaxBy(r => r.Id).Id + 1;
                product.Name = model.Name;
                product.Price = model.Price;
                product.Category = model.Category;
                SampleProducts.Data.Add(product);
                return Json(new { success = true, id = model.Id });
            }

            return PartialView("_CreatePartialView", model); // Return the partial view with validation errors
        }
        public IActionResult Edit(int id)
        {
            var item = SampleProducts.Data.SingleOrDefault(r => r.Id == id);
            if (item == null)
            {
                return NotFound();
            }

            return PartialView("_EditPartialView", item);
        }

        [HttpPost]
        public IActionResult Edit(Product model)
        {
            if (ModelState.IsValid)
            {
                var product = SampleProducts.Data.SingleOrDefault(r => r.Id == model.Id);
                product.Name = model.Name;
                product.Price = model.Price;
                product.Category = model.Category;
                return Json(new { success = true, id = model.Id });
            }

            return PartialView("_EditPartialView", model); // Return the partial view with validation errors
        }

        [HttpPost]
        public JsonResult Delete(Product model)
        {
            var product = SampleProducts.Data.SingleOrDefault(r => r.Id == model.Id);
            SampleProducts.Data.Remove(product);
            return Json(new { success = true, id = product.Id });
        }
    }

}
