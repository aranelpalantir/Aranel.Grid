
# Aranel.Grid

`Aranel.Grid` is a .NET library that provides a server-side grid filtering and sorting solution with seamless client-side integration. It is designed to be highly customizable and easy to integrate into ASP.NET Core projects.

## Features

- **Server-Side Filtering**: Apply complex filters on the server side to ensure efficient data retrieval.
- **Sorting**: Easily sort data on the server side.
- **Client-Side Integration**: Works seamlessly with your existing client-side grid components.
- **Lightweight**: Focused on performance and minimal footprint.
- **Customizable**: Extend or modify the default behavior with ease.

## Installation

You can install the `Aranel.Grid` package via NuGet Package Manager:

```shell
Install-Package Aranel.Grid
```

Or via the .NET CLI:

```shell
dotnet add package Aranel.Grid
```

## Getting Started

### 1. Setting up the Server-Side
In your ASP.NET Core project, you can use the `Aranel.Grid` library to handle server-side data operations such as filtering and sorting.

Example usage:

```csharp
        [HttpPost]
        public JsonResult GetProducts([FromBody] DataSourceLoadOptions dataSourceLoadOptions)
        {
            var query = _context.Products.AsQueryable();
            var result = DataSourceLoader.Load(dataSourceLoadOptions, query, new CultureInfo("tr-TR"));
            return Json(result);

        }
    }
```

### 2. Client-Side Integration

To integrate with your client-side grid component, include the provided `aranel.grid.css` and `aranel.grid.js` files, as well as the required dependencies in your layout or relevant views.

Example `Layout` integration:

```html
<link rel="stylesheet" href="~/css/aranel.grid.css" />
<script src="~/js/aranel.grid.js"></script>

<!-- Include dependencies -->
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
```
Make sure to include these dependencies in your project.

### 3. Using `AranelGridBuilder`

`AranelGridBuilder` is used to build an instance of the `AranelGrid` class with all the necessary configurations for your grid.

#### Example Usage:

```javascript
$(document).ready(function () {
    var grid = new AranelGridBuilder()
        .setSelector("#gridWrapper")
        .setDataUrl('/Product/GetProducts')
        .setCreateUrl("/Product/Create")
        .setEditUrl("/Product/Edit")
        .setDeleteUrl("/Product/Delete")
        .setColumns(columns)
        .setSortColumn("price")
        .setSortDirection("desc")
        .setGridHeader("Product Grid")
        .setExportEnabled(true)
        .setExportFileName("product-data")
        .build();

    grid.onRowSelected(function (event, $row, selectedRowData) {
        console.log('Selected row element:', $row);
        console.log('Selected row data:', selectedRowData);
    });

    grid.onRowRemoving((event, $rowSelector, rowData) => {
        console.log('Row is being removed:', $rowSelector);
        console.log('Row data:', rowData);
    });

    grid.onRowRemoved((event, rowId, rowData) => {
        console.log(`Row with ID ${rowId} has been removed.`);
        console.log('Removed row data:', rowData);      
    });
});
```

### 4. Public Methods in `AranelGrid`

Below are the public methods provided by the `AranelGrid` class for interacting with the grid's data and events:

#### Event Registration Methods

- `onRowRemoving(callback)`: Register a callback for the `rowRemoving` event.
- `onRowRemoved(callback)`: Register a callback for the `rowRemoved` event.
- `onRowSelected(callback)`: Register a callback for the `rowSelected` event.
- `onRowAdded(callback)`: Register a callback for the `rowAdded` event.
- `onGridLoading(callback)`: Register a callback for the `gridLoading` event.
- `onGridLoaded(callback)`: Register a callback for the `gridLoaded` event.
- `onGridLoadingError(callback)`: Register a callback for the `gridLoadingError` event.
- `onGridExporting(callback)`: Register a callback for the `gridExporting` event.
- `onGridExported(callback)`: Register a callback for the `gridExported` event.
- `onGridExportingError(callback)`: Register a callback for the `gridExportingError` event.
- `onCreateError(callback)`: Register a callback for the `createError` event.
- `onEditError(callback)`: Register a callback for the `editError` event.
- `onDeleteError(callback)`: Register a callback for the `deleteError` event.

#### Data Access Methods

- `getColumnDataByKey(columnKey)`: Get data for a specific column by its key.
- `getColumnDataByIndex(columnIndex)`: Get data for a specific column by its index.
- `getCellDataByRowId(rowId, columnKey)`: Get data for a specific cell by row ID and column key.
- `getCellDataByRowIndexColKey(rowIndex, columnKey)`: Get data for a specific cell by row index and column key.
- `getCellDataByRowIndexColIndex(rowIndex, columnIndex)`: Get data for a specific cell by row index and column index.
- `getCellDataByRowIdColIndex(rowId, columnIndex)`: Get data for a specific cell by row ID and column index.
- `getRowById(rowId)`: Access a row by its ID.
- `getRowByIndex(rowIndex)`: Access a row by its index.
- `getRowDataById(rowId)`: Get data for a row by its ID.
- `getRowDataByIndex(rowIndex)`: Get data for a row by its index.
- `getSelectedRow()`: Get the currently selected row element.
- `getSelectedRowData()`: Get the data of the currently selected row.

#### Grid Management Methods

- `refresh()`: Refresh the grid data.

### 5. Columns Configuration Examples

Here are some examples of how to configure columns for the grid using `AranelGrid`.

#### Example 1: Comprehensive Column Configuration

```javascript
let columns = {
    'name': { title: "Name", isSortable: false },
    'price': {
        title: "Price", isFilterable: true, dataType: "number", titleAlign: "center", contentAlign: "right", format: (value) => value.toFixed(2)
    },
    'category': { title: "Category" },
    'releaseDate': {
        title: "Release Date", dataType: "date", format: (value) => formatDate(value)
    },
    'warrantyExpiry': {
        title: "Warranty Expiry", dataType: "date", format: (value) => formatDateTime(value)
    },
    'inStock': {
        title: "In Stock", dataType: "boolean", contentAlign: "center"
    },
    'action': {
        title: "",
        render: function (item) {
            return `
                <i class="fas fa-edit grid-edit" data-edit-url="/Products/Edit/${item.id}"></i>
                <i class="fas fa-trash-alt grid-delete" data-delete-url="/Products/Delete/${item.id}"></i>
            `;
        }
    },
    'id2': {
        title: "id",
        render: function (item) {
            return `${item.id}`;
        }
    }
};
```

#### Example 2: Basic Column Configuration

```javascript
let columns = {
    'name': { title: "Name", isSortable: false },
    'price': {
        title: "Price", isFilterable: true, dataType: "number", titleAlign: "center", contentAlign: "right", format: (value) => value.toFixed(2)
    },
    'category': { title: "Category" },
    'id': {
        title: "id",
        render: function (item) {
            return `${item.id}`;
        }
    }
};
```

### 6. Dependencies

This package depends on the following libraries:
- **LinqKit** (version 1.3.0): Enables dynamic querying capabilities.
- **Newtonsoft.Json** (version 13.0.3): Provides JSON serialization and deserialization.
- **Bootstrap** (version 4.5 or higher): For responsive design and layout.
- **jQuery** (version 3.5.1 or higher): Required for DOM manipulation and event handling.
- **Font Awesome** (version 6.0.0-beta3 or higher): For using icon fonts in the grid.
- **SheetJS (js-xlsx)** (version 0.17.0 or higher): For exporting grid data to Excel files.

These dependencies should be included in your project to ensure full functionality of the Aranel.Grid library.

## Contributing

Contributions are welcome! If you find a bug or want to contribute to this package, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For more information, please contact [Aranel Palantir](mailto:aranelpalantir@hotmail.com).
