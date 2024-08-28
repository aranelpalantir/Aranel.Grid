using System.Globalization;
using System.Linq.Expressions;
using Aranel.Grid.Filtering;

namespace Aranel.Grid.DataSource
{
    public class DataSourceLoader
    {
        public static DataSourceLoadResult<T> Load<T>(DataSourceLoadOptions dataataSourceLoadOptions, IQueryable<T> query, CultureInfo? cultureInfo = null) where T : class
        {
            // Apply column filters if any
            if (dataataSourceLoadOptions.ColumnFilters.Count > 0)
            {
                query = query.ApplyFilters(dataataSourceLoadOptions.ColumnFilters, cultureInfo);
            }

            // Apply global filter if provided
            if (!string.IsNullOrWhiteSpace(dataataSourceLoadOptions.GlobalFilter) && dataataSourceLoadOptions.GlobalFilterColumns.Count > 0)
            {
                query = query.ApplyGlobalFilter(new ColumnFilter
                {
                    Filter = dataataSourceLoadOptions.GlobalFilter,
                    MatchMode = "contains",
                    Operator = "or"
                }, dataataSourceLoadOptions.GlobalFilterColumns, cultureInfo);
            }

            // Apply sorting if SortColumn is provided
            if (!string.IsNullOrEmpty(dataataSourceLoadOptions.SortColumn))
            {
                query = ApplySorting(query, dataataSourceLoadOptions);
            }

            // Generate pagination result
            return CreatePaginationResult(query, dataataSourceLoadOptions);
        }

        private static IQueryable<T> ApplySorting<T>(IQueryable<T> query, DataSourceLoadOptions coreDataSourceLoadOptions) where T : class
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var propertyNames = coreDataSourceLoadOptions.SortColumn.Split('.');
            Expression property = parameter;

            foreach (var name in propertyNames)
            {
                property = Expression.Property(property, name);
            }

            var lambda = Expression.Lambda<Func<T, object>>(Expression.Convert(property, typeof(object)), parameter);
            return coreDataSourceLoadOptions.SortDirection.ToLower() == "asc" ? query.OrderBy(lambda) : query.OrderByDescending(lambda);
        }

        private static DataSourceLoadResult<T> CreatePaginationResult<T>(IQueryable<T> query, DataSourceLoadOptions coreDataSourceLoadOptions) where T : class
        {
            var totalItems = query.Count();
            if (coreDataSourceLoadOptions.PageNumber == -1)
            {
                return new DataSourceLoadResult<T>()
                {
                    TotalItems = totalItems,
                    TotalPages = 1,
                    Items = query.ToList()
                };
            }
            else
            {
                var totalPages = (int)Math.Ceiling((double)totalItems / coreDataSourceLoadOptions.PageSize);

                var pagedList = query
                    .Skip((coreDataSourceLoadOptions.PageNumber - 1) * coreDataSourceLoadOptions.PageSize)
                    .Take(coreDataSourceLoadOptions.PageSize)
                    .ToList();

                return new DataSourceLoadResult<T>()
                {
                    TotalItems = totalItems,
                    TotalPages = totalPages,
                    Items = pagedList
                };
            }
        }
    }

}
