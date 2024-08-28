using Aranel.Grid.Filtering;

namespace Aranel.Grid.DataSource
{
    public class DataSourceLoadOptions
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 5;
        public string GlobalFilter { get; set; } = "";
        public List<string> GlobalFilterColumns { get; set; } = new List<string>();
        public string SortColumn { get; set; }
        public string SortDirection { get; set; }
        public Dictionary<string, ColumnFilter> ColumnFilters { get; set; } = new Dictionary<string, ColumnFilter>();
    }
}
