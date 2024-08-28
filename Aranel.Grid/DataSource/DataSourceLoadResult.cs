namespace Aranel.Grid.DataSource
{
    public class DataSourceLoadResult<T>
    {
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public List<T> Items { get; set; }
    }
}
