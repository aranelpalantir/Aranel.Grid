using LinqKit;
using System.Globalization;
using System.Linq.Expressions;

namespace Aranel.Grid.Filtering
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> ApplyGlobalFilter<T>(this IQueryable<T> query, ColumnFilter globalGridCoreColumnFilter, List<string>? properties, CultureInfo? cultureInfo = null)
        {
            if (properties == null || !properties.Any())
            {
                return query;
            }

            var predicate = PredicateBuilder.New<T>(x => true);

            ExpressionStarter<T>? globalPredicate = null;
            foreach (var propertyName in properties)
            {
                var globalLocalPredicate = ApplyFilter<T>(propertyName, globalGridCoreColumnFilter, cultureInfo);
                if (globalLocalPredicate != null)
                {
                    if (globalPredicate != null)
                    {
                        globalPredicate = globalPredicate.Or(globalLocalPredicate);
                    }
                    else
                    {
                        globalPredicate = globalLocalPredicate;
                    }
                }
            }

            if (globalPredicate != null)
                predicate = predicate.And(globalPredicate);

            return query.Where(predicate);
        }
        public static IQueryable<T> ApplyFilters<T>(this IQueryable<T> query, Dictionary<string, ColumnFilter>? filterDict, CultureInfo? cultureInfo = null)
        {
            if (filterDict == null || !filterDict.Any())
            {
                return query;
            }

            var predicate = PredicateBuilder.New<T>(x => true);

            foreach (var filter in filterDict)
            {
                var propertyName = filter.Key;

                ExpressionStarter<T>? filterPredicate = null;

                if (filter.Value?.Filter != null)
                {
                    var currentPredicate = ApplyFilter<T>(propertyName, filter.Value, cultureInfo);
                    if (currentPredicate != null)
                    {
                        if (filterPredicate != null)
                        {
                            filterPredicate = filter.Value.Operator == "or"
                                ? filterPredicate.Or(currentPredicate)
                                : filterPredicate.And(currentPredicate);
                        }
                        else
                        {
                            filterPredicate = currentPredicate;
                        }
                    }
                }

                if (filterPredicate != null)
                    predicate = predicate.And(filterPredicate);
            }

            return query.Where(predicate);
        }
        private static Expression<Func<T, bool>>? ApplyFilter<T>(string propertyName, ColumnFilter criteria, CultureInfo? cultureInfo = null)
        {
            if (criteria.Filter == null)
                return null;

            var parameter = Expression.Parameter(typeof(T), "x");

            var propertyNames = propertyName.Split('.');
            Expression property = parameter;

            foreach (var name in propertyNames)
            {
                property = Expression.Property(property, name);
            }

            Expression comparison = null;

            if (property.Type == typeof(string))
            {
                if (!string.IsNullOrWhiteSpace((string?)criteria.Filter))
                {
                    var constant = Expression.Constant(criteria.Filter);

                    var propertyLower = Expression.Call(property, typeof(string).GetMethod("ToLower", Type.EmptyTypes));
                    var constantLower = Expression.Call(constant, typeof(string).GetMethod("ToLower", Type.EmptyTypes));

                    switch (criteria.MatchMode)
                    {
                        case "contains":
                            var methodContains = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                            if (methodContains != null)
                                comparison = Expression.Call(propertyLower, methodContains, constantLower);
                            break;
                        case "startsWith":
                            var methodStartsWith = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
                            if (methodStartsWith != null)
                                comparison = Expression.Call(propertyLower, methodStartsWith, constantLower);
                            break;
                        case "endsWith":
                            var methodEndsWith = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
                            if (methodEndsWith != null)
                                comparison = Expression.Call(propertyLower, methodEndsWith, constantLower);
                            break;
                        case "equals":
                            comparison = Expression.Equal(propertyLower, constantLower);
                            break;
                    }
                }
            }
            else if (property.Type == typeof(bool))
            {
                var success = bool.TryParse((string?)criteria.Filter, out var boolValue);

                if (success)
                {
                    var boolConstant = Expression.Constant(boolValue);
                    switch (criteria.MatchMode)
                    {
                        case "equals":
                            comparison = Expression.Equal(property, boolConstant);
                            break;
                    }
                }
            }
            else if (property.Type == typeof(DateTime))
            {
                var success = DateTime.TryParse((string?)criteria.Filter, cultureInfo, DateTimeStyles.None, out var dateTimeValue);

                if (success)
                {
                    var dateProperty = Expression.Property(property, "Date");

                    var dateConstant =
                        Expression.Constant(dateTimeValue.Kind == DateTimeKind.Utc ? dateTimeValue.AddHours(3) : dateTimeValue,
                            typeof(DateTime));

                    switch (criteria.MatchMode)
                    {
                        case "equals":
                            comparison = Expression.Equal(Expression.Property(dateProperty, "Date"), dateConstant);
                            break;
                        case "notEquals":
                            comparison = Expression.NotEqual(Expression.Property(dateProperty, "Date"), dateConstant);
                            break;
                        case "gt":
                            comparison = Expression.GreaterThan(property, dateConstant);
                            break;
                        case "gte":
                            comparison = Expression.GreaterThanOrEqual(property, dateConstant);
                            break;
                        case "lt":
                            comparison = Expression.LessThan(property, dateConstant);
                            break;
                        case "lte":
                            comparison = Expression.LessThanOrEqual(property, dateConstant);
                            break;
                    }
                }

            }
            else if (property.Type == typeof(int))
            {
                var success = int.TryParse((string?)criteria.Filter, out var intValue);

                if (success)
                {
                    var numericConstant = Expression.Constant(intValue);

                    switch (criteria.MatchMode)
                    {
                        case "equals":
                            comparison = Expression.Equal(property, numericConstant);
                            break;
                        case "notEquals":
                            comparison = Expression.NotEqual(property, numericConstant);
                            break;
                        case "gt":
                            comparison = Expression.GreaterThan(property, numericConstant);
                            break;
                        case "gte":
                            comparison = Expression.GreaterThanOrEqual(property, numericConstant);
                            break;
                        case "lt":
                            comparison = Expression.LessThan(property, numericConstant);
                            break;
                        case "lte":
                            comparison = Expression.LessThanOrEqual(property, numericConstant);
                            break;
                    }
                }
            }
            else if (property.Type == typeof(decimal))
            {
                var success = decimal.TryParse((string?)criteria.Filter, out var decimalValue);

                if (success)
                {
                    var numericConstant = Expression.Constant(decimalValue);

                    switch (criteria.MatchMode)
                    {
                        case "equals":
                            comparison = Expression.Equal(property, numericConstant);
                            break;
                        case "notEquals":
                            comparison = Expression.NotEqual(property, numericConstant);
                            break;
                        case "gt":
                            comparison = Expression.GreaterThan(property, numericConstant);
                            break;
                        case "gte":
                            comparison = Expression.GreaterThanOrEqual(property, numericConstant);
                            break;
                        case "lt":
                            comparison = Expression.LessThan(property, numericConstant);
                            break;
                        case "lte":
                            comparison = Expression.LessThanOrEqual(property, numericConstant);
                            break;
                    }
                }
            }
            else if (property.Type == typeof(double))
            {
                var success = double.TryParse((string?)criteria.Filter, out var doubleValue);
                if (success)
                {
                    var numericConstant = Expression.Constant(doubleValue);

                    switch (criteria.MatchMode)
                    {
                        case "equals":
                            comparison = Expression.Equal(property, numericConstant);
                            break;
                        case "notEquals":
                            comparison = Expression.NotEqual(property, numericConstant);
                            break;
                        case "gt":
                            comparison = Expression.GreaterThan(property, numericConstant);
                            break;
                        case "gte":
                            comparison = Expression.GreaterThanOrEqual(property, numericConstant);
                            break;
                        case "lt":
                            comparison = Expression.LessThan(property, numericConstant);
                            break;
                        case "lte":
                            comparison = Expression.LessThanOrEqual(property, numericConstant);
                            break;
                    }

                }
            }

            if (comparison != null)
            {
                var lambda = Expression.Lambda<Func<T, bool>>(comparison, parameter);
                return lambda;
            }

            return null;
        }
    }
}
