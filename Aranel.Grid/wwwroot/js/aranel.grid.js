/**
 * @class AranelGridBuilder
 * A builder for creating Aranel.Grid instances.
 */
class AranelGridBuilder {
    #selector;
    #dataUrl;
    #createUrl;
    #editUrl;
    #deleteUrl;
    #columns;
    #sortColumn;
    #sortDirection;
    #gridHeader;
    #exportEnabled;
    #exportFileName;
    #createModalTitle;
    #editModalTitle;
    #deleteModalTitle;
    #pageSizes;

    constructor() {
        this.#selector = null;
        this.#dataUrl = null;
        this.#createUrl = null;
        this.#editUrl = null;
        this.#deleteUrl = null;
        this.#columns = null;
        this.#sortColumn = null;
        this.#sortDirection = "asc";
        this.#gridHeader = null;
        this.#exportEnabled = null;
        this.#exportFileName = "grid-data";
        this.#createModalTitle = "Create Item";
        this.#editModalTitle = "Edit Item";
        this.#deleteModalTitle = "Confirm Delete";
        this.#pageSizes = [10, 20, 50, 100];
    }

    // Method to set the selector
    setSelector(selector) {
        this.#selector = selector;
        return this;
    }

    // Method to set the data URL
    setDataUrl(dataUrl) {
        this.#dataUrl = dataUrl;
        return this;
    }

    // Method to set the edit URL
    setCreateUrl(createUrl) {
        this.#createUrl = createUrl;
        return this;
    }

    // Method to set the edit URL
    setEditUrl(editUrl) {
        this.#editUrl = editUrl;
        return this;
    }

    // Method to set the delete URL
    setDeleteUrl(deleteUrl) {
        this.#deleteUrl = deleteUrl;
        return this;
    }

    // Method to set the columns
    setColumns(columns) {
        this.#columns = columns;
        return this;
    }

    // Method to set the sort column
    setSortColumn(sortColumn) {
        this.#sortColumn = sortColumn;
        return this;
    }

    // Method to set the sort direction
    setSortDirection(sortDirection) {
        this.#sortDirection = sortDirection;
        return this;
    }

    // Method to set the grid header
    setGridHeader(gridHeader) {
        this.#gridHeader = gridHeader;
        return this;
    }

    // Method to set export enabled
    setExportEnabled(exportEnabled) {
        this.#exportEnabled = exportEnabled;
        return this;
    }

    // Method to set the export file name
    setExportFileName(exportFileName) {
        this.#exportFileName = exportFileName;
        return this;
    }

    // Method to set the create modal title
    setCreateModalTitle(createModalTitle) {
        this.#createModalTitle = createModalTitle;
        return this;
    }

    // Method to set the edit modal title
    setEditModalTitle(editModalTitle) {
        this.#editModalTitle = editModalTitle;
        return this;
    }

    // Method to set the delete modal title
    setDeleteModalTitle(deleteModalTitle) {
        this.#deleteModalTitle = deleteModalTitle;
        return this;
    }

    // Method to set custom page sizes
    setPageSizes(pageSizes) {
        if (Array.isArray(pageSizes) && pageSizes.length > 0) {
            this.#pageSizes = pageSizes;
        }
        return this;
    }

    // Method to build and return the Aranel.Grid instance
    build() {
        return new AranelGrid(
            this.#selector,
            this.#dataUrl,
            this.#createUrl,
            this.#editUrl,
            this.#deleteUrl,
            this.#columns,
            this.#sortColumn,
            this.#sortDirection,
            this.#gridHeader,
            this.#exportEnabled,
            this.#exportFileName,
            this.#createModalTitle,
            this.#editModalTitle,
            this.#deleteModalTitle,
            this.#pageSizes
        );
    }
}

class AranelGrid {
    #$gridWrapper;
    #$gridWrapperId;
    #$gridSelector;
    #dataUrl;
    #createUrl;
    #editUrl;
    #deleteUrl;
    #columns;
    #currentSortColumn;
    #currentSortDirection;
    #gridHeader;
    #exportEnabled;
    #exportFileName;
    #createModalTitle;
    #editModalTitle;
    #deleteModalTitle;
    #debounceTimeout;
    #currentPage;
    #pageSize;
    #totalPages;
    #itemsPerPage;
    #totalItems;
    #columnFilters;
    #matchModes;
    #defaultMatchModes;
    #globalFilterColumns;
    #globalFilter;
    #rowsData;
    #columnsData;
    #selectedRowId;

    constructor(gridWrapper,
        dataUrl,
        createUrl,
        editUrl,
        deleteUrl,
        columns,
        currentSortColumn,
        currentSortDirection,
        gridHeader,
        exportEnabled,
        exportFileName,
        createModalTitle,
        editModalTitle,
        deleteModalTitle,
        pageSizes) {
        this.#$gridWrapper = $(gridWrapper);
        this.#dataUrl = dataUrl;
        this.#createUrl = createUrl;
        this.#editUrl = editUrl;
        this.#deleteUrl = deleteUrl;
        this.#columns = columns;
        this.#currentSortColumn = currentSortColumn;
        this.#currentSortDirection = currentSortDirection;
        this.#gridHeader = gridHeader;
        this.#exportFileName = exportFileName;
        this.#exportEnabled = exportEnabled;
        this.#createModalTitle = createModalTitle;
        this.#editModalTitle = editModalTitle;
        this.#deleteModalTitle = deleteModalTitle;
        this.pageSizes = pageSizes;
        this.#debounceTimeout = null;
        this.#currentPage = 1;
        this.#totalPages = 1;
        this.#itemsPerPage = 0;
        this.#totalItems = 0;
        this.#columnFilters = {};
        this.#rowsData = {};
        this.#columnsData = {};
        this.#selectedRowId = null;
        this.#matchModes = {
            'contains': { title: 'Contains' },
            'startsWith': { title: 'Starts With' },
            'endsWith': { title: 'Ends With' },
            'equals': { title: 'Equals' },
            'notEquals': { title: 'Not Equals' },
            'gt': { title: 'Greater Than' },
            'gte': { title: 'Greater Than or Equal' },
            'lt': { title: 'Less Than' },
            'lte': { title: 'Less Than or Equal' },
        };
        this.#defaultMatchModes = {
            string: ['contains', 'startsWith', 'endsWith', 'equals'],
            number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte'],
            date: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte'],
            boolean: [],
            custom: [] // No defaults for custom types
        };
        this.#globalFilterColumns = [];
        this.#globalFilter = null;
        this.#pageSize = pageSizes[0];
        this.#initializeGrid();
    }

    // Initialize grid
    #initializeGrid() {
        // Generate a unique grid ID based on the grid wrapper's ID
        this.#$gridWrapperId = this.#$gridWrapper.attr('id');
        this.#$gridWrapper.addClass("grid-wrapper");

        this.#addActionColumnIfNeeded();
        this.#setDefaultColumnProperties();
        this.#generateGrid();
        this.#initMatchModes();
        this.#attachOtherEventListeners();
        this.#loadGrid();
    }

    // Set default properties for columns
    #setDefaultColumnProperties() {
        for (const [key, column] of Object.entries(this.#columns)) {
            const dataType = column.dataType || 'string'; // Set default dataType to 'string' if not provided

            // Use key as the title if title is not provided
            if (!column.title) column.title = key;

            if (column.isFilterable !== false) {
                // Set default matchMode based on dataType if not provided
                if (!column.matchMode) {
                    column.matchMode = this.#defaultMatchModes[dataType][0] || 'equals';
                }
                // Set default matchModes based on dataType if not provided or empty
                if (!column.matchModes || column.matchModes.length === 0) {
                    column.matchModes = this.#defaultMatchModes[dataType] || [];
                }
            }

            if (column.isGlobalSearchable !== false && !column.render) {
                if (!this.#globalFilterColumns.includes(key)) {
                    this.#globalFilterColumns.push(key);
                }
            }
        }
    }

    // Generate the grid layout
    #generateGrid() {
        this.#generateHeader();
        this.#generateHeaderPanel();
        this.#generateGridContainer();
        this.#generateTableHeader();
        this.#generateFooterPanel();
        this.#generateCreateModal();
        this.#generateEditModal();
        this.#generateDeleteModal();
        this.#bindActionEvents();
    }

    // Generate the grid header
    #generateHeader() {
        if (this.#gridHeader) {
            const $header = $(`
                <div id="grid-header-${this.#$gridWrapperId}">
                    <h3 id="grid-title-${this.#$gridWrapperId}">${this.#gridHeader}</h3>
                </div>`);
            this.#$gridWrapper.append($header);
        }
    }

    // Generate the header panel
    #generateHeaderPanel() {
        const $headerPanel = $(`<div id="grid-header-panel-${this.#$gridWrapperId}" class="d-flex justify-content-end mb-3" style="gap: 3px;"></div>`);

        // Page Size dropdown
        const $pageSizeDropdown = this.#generatePageSizeDropdown();

        // Export button
        let $exportButton;
        if (this.#exportEnabled) {
            $exportButton = $(`<button id="grid-export-button-${this.#$gridWrapperId}" class="btn btn-primary btn-sm">Export</button>`);
        }       

        // Filter input
        const $globalFilter = $(`<input type="text" id="grid-global-filter-${this.#$gridWrapperId}" class="form-control form-control-sm mr-2" placeholder="Search..." autocomplete="off" />`);

        // Search button
        const $searchButton = $(`<button class="btn btn-primary btn-sm" id="grid-refresh-button-${this.#$gridWrapperId}">Refresh</button>`);

        // Create button
        let $createButton;
        if (this.#createUrl) {
            $createButton = $(`<button id="grid-create-button-${this.#$gridWrapperId}" class="btn btn-success btn-sm">+</button>`);
        }

        // Fill the header panel container
        $headerPanel.append($pageSizeDropdown, $exportButton, $globalFilter, $searchButton, $createButton);

        // Append the header panel to the DOM
        this.#$gridWrapper.append($headerPanel);

        // Bind events
        this.#$gridWrapper.on('click', '.dropdown-page-size .dropdown-item', (e) => {
            const newSize = parseInt($(e.target).data('value'), 10);
            this.#$gridWrapper.find(`#grid-selected-page-size-${this.#$gridWrapperId}`).text(newSize);
            this.#pageSize = newSize;
            this.#loadGrid();
        });

        this.#$gridWrapper.on('input', `#grid-global-filter-${this.#$gridWrapperId}`, (e) => {
            this.#applyGlobalFilter();
        });

        this.#$gridWrapper.on('keydown', `#grid-global-filter-${this.#$gridWrapperId}`, (e) => {
            if (e.key === 'Enter') {
                this.#globalSearch();
            }
        });

        this.#$gridWrapper.on('click', `#grid-refresh-button-${this.#$gridWrapperId}`, (e) => {
            this.refresh();
        });

        if (this.#exportEnabled) {
            this.#$gridWrapper.on('click', `#grid-export-button-${this.#$gridWrapperId}`, async () => {
                this.#exportExcel();
            });
        }

    }

    // Generate the page size dropdown
    #generatePageSizeDropdown() {
        const $pageSizeDropdown = $(`
            <div class="dropdown dropdown-page-size">
                <button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Page Size: <span id="grid-selected-page-size-${this.selector}">${this.#pageSize}</span>
                </button>
                <ul class="dropdown-menu"></ul>
            </div>
        `);

        const $dropdownMenu = $pageSizeDropdown.find('.dropdown-menu');

        // Dynamically create options based on pageSizes array
        this.pageSizes.forEach(size => {
            const $item = $(`<a class="dropdown-item small" href="#" data-value="${size}">${size}</a>`);
            $dropdownMenu.append($item);
        });

        return $pageSizeDropdown;
    }

    // Generate the footer panel
    #generateFooterPanel() {
        const $footerPanel = $('<div class="grid-footer-panel"></div>');

        const $recordCountContainer = $(`
            <div class="grid-record-count-container">
                <span id="record-count-${this.#$gridWrapperId}"></span>
            </div>
        `);

        const $paginationContainer = $(`
            <div id="pagination-container-${this.#$gridWrapperId}" class="d-flex justify-content-end grid-pagination-container">
                <div id="pagination" class="btn-group grid-pagination">
                    <span id="page-numbers-${this.#$gridWrapperId}"></span>
                </div>
            </div>
        `);

        // Fill the footer panel container
        $footerPanel.append($recordCountContainer, $paginationContainer);

        // Append the footer panel to the DOM
        this.#$gridWrapper.append($footerPanel);
    }

    // Generate the grid container and table
    #generateGridContainer() {
        // Create the grid container with a unique ID
        const $gridContainer = $('<div>', { id: `grid-container-${this.#$gridWrapperId}`, class: 'grid-container' });

        // Create the table element
        const $table = $('<table>', { class: 'table table-striped' });

        // Create the table head and body
        const $thead = $('<thead></thead>');
        const $tbody = $('<tbody>', {
            id: `grid-body-${this.#$gridWrapperId}`,
            class: 'grid-body'
        });

        $table.append($thead);
        $table.append($tbody);

        // Create the loading overlay div  
        const $loadingDiv = $('<div>', {
            id: `grid-loading-${this.#$gridWrapperId}`,
            class: 'grid-loading-overlay grid-loading-hidden'
        }).html(`
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
`);
        $gridContainer.css('position', 'relative'); // Ensure the grid container is relatively positioned

        // Append table and loading div to grid container
        $gridContainer.append($table);
        $gridContainer.append($loadingDiv);

        // Append grid container to the DOM
        this.#$gridWrapper.append($gridContainer);

        // Set the grid selector to reference this specific grid container
        this.#$gridSelector = this.#$gridWrapper.find(`#grid-container-${this.#$gridWrapperId}`);
    }

    // Generate the table header
    #generateTableHeader() {
        const $thead = this.#$gridSelector.find('thead');
        const $headerRow = $('<tr></tr>');

        for (const [key, column] of Object.entries(this.#columns)) {
            const $th = $('<th></th>');
            const titleAlign = column.titleAlign || 'left';
            $th.css('text-align', titleAlign);

            if (!column.render) {
                const headerHtml = `<span class="column-header${column.isSortable !== false ? ' sortable' : ''}" data-column="${key}">${column.title}</span>`;
                $th.html(headerHtml);
                if (column.isFilterable !== false) {
                    let filterInputHtml = '';

                    switch (column.dataType) {
                        case 'date':
                            filterInputHtml = `<input type="date" class="form-control form-control-sm column-filter-input" data-column="${key}">`;
                            break;
                        case 'number':
                            filterInputHtml = `<input type="number" class="form-control form-control-sm column-filter-input" data-column="${key}">`;
                            break;
                        case 'boolean':
                            filterInputHtml = `
                <select class="form-control form-control-sm column-filter-input" data-column="${key}">
                    <option value="">All</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>`;
                            break;
                        default:
                            filterInputHtml = `<input type="text" class="form-control form-control-sm column-filter-input" placeholder="Filter" data-column="${key}">`;
                            break;
                    }

                    // Check if matchModes is defined
                    const columnMatchModes = this.#columns[key]?.matchModes || [];

                    let matchModeDropdownHtml = '';
                    if (columnMatchModes.length > 0) {
                        matchModeDropdownHtml = `
            <div class="dropdown">
                <button class="btn btn-light btn-sm dropdown-toggle" type="button" id="match-mode-button-${key}" data-match-mode-column="${key}" data-bs-toggle="dropdown" aria-expanded="false">
                    ${column.matchMode.charAt(0).toUpperCase() + column.matchMode.slice(1)}
                </button>
                <ul class="dropdown-menu" aria-labelledby="match-mode-button-${key}">
                    ${this.#generateMatchModeOptions(column.matchMode, key)}
                </ul>
            </div>`;
                    }

                    $th.append(`
        <div class="column-filter-container">
            ${filterInputHtml}
            ${matchModeDropdownHtml} <!-- Only include match mode dropdown if matchModes are available -->
        </div>
    `);
                }
            } else {
                $th.html(column.title);
            }

            $headerRow.append($th);
        }

        $thead.append($headerRow);

        $thead.on('click', '.sortable', (e) => {
            const column = $(e.target).data('column');
            this.#sortTable(column);
        });

        $thead.on('input', '.column-filter-input', (e) => {
            const column = $(e.target).data('column');
            const value = $(e.target).val();
            this.#applyColumnFilter(column, value);
        });

        $thead.on('click', '.match-mode-menu-item', (e) => {
            const $item = $(e.currentTarget);
            this.#updateMatchMode($item);
        });
    }

    // Generate match mode options
    #generateMatchModeOptions(currentMode, column) {
        const columnMatchModes = this.#columns[column]?.matchModes || [];
        const $menuItems = columnMatchModes.map(mode => {
            const isActive = mode === currentMode ? ' active' : '';
            const title = this.#matchModes[mode]?.title || mode.charAt(0).toUpperCase() + mode.slice(1);

            return $(`
            <li>
                <a class="dropdown-item match-mode-menu-item${isActive}" href="#" data-match-mode="${mode}">
                    ${title}
                </a>
            </li>
        `);
        });

        const $menu = $('<ul class="dropdown-menu"></ul>');
        $menuItems.forEach($item => $menu.append($item));

        return $menu.html();
    }

    // Generate create modal
    #generateCreateModal() {
        if (this.#createUrl) {
            const modalId = `create-modal-${this.#$gridWrapperId}`;
            const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Label">${this.#createModalTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="create-form-${this.#$gridWrapperId}">
                            <div class="modal-body" id="create-modal-body-${this.#$gridWrapperId}">
                                <!-- Partial view content will be loaded here -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" id="create-modal-save-button-${this.#$gridWrapperId}">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

            // Append the modal to the body
            $('body').append(modalHtml);
        }
    }

    // Generate edit modal
    #generateEditModal() {
        if (this.#editUrl) {
            const modalId = `edit-modal-${this.#$gridWrapperId}`; // Unique ID for the modal
            const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Label">${this.#editModalTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="edit-form-${this.#$gridWrapperId}">
                            <div class="modal-body" id="edit-modal-body-${this.#$gridWrapperId}">
                                <!-- Partial view content will be loaded here -->
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" id="edit-modal-save-button-${this.#$gridWrapperId}">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

            // Append the modal to the body
            $('body').append(modalHtml);
        }
    }

    // Generate delete modal
    #generateDeleteModal() {
        if (this.#deleteUrl) {
            const modalId = `delete-modal-${this.#$gridWrapperId}`; // Unique ID for the modal
            const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${modalId}Label">${this.#deleteModalTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Are you sure you want to delete this item?
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirm-delete-button-${this.#$gridWrapperId}">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

            // Append the modal to the body
            $('body').append(modalHtml);
        }
    }

    // Bind events for actions like create, edit, delete
    #bindActionEvents() {
        if (this.#createUrl) {
            this.#$gridWrapper.on('click', `#grid-create-button-${this.#$gridWrapperId}`, (e) => {
                const modalId = `#create-modal-${this.#$gridWrapperId}`;
                const modalBodyId = `#create-modal-body-${this.#$gridWrapperId}`;

                $.ajax({
                    url: this.#createUrl,
                    method: 'GET',
                    success: (html) => {
                        // Load the partial view content into the modal body
                        $(modalBodyId).html(html);

                        // Show the modal
                        $(modalId).modal('show');
                    },
                    error: (xhr, status, error) => {
                        console.error('Error fetching the partial view:', error);
                        const errorInfo = {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseText: xhr.responseText,
                            error: error
                        };
                        this.#$gridSelector.trigger('createError', [errorInfo]);
                    }
                });
            });

            $(`#create-modal-save-button-${this.#$gridWrapperId}`).on('click', () => {
                const formId = `#create-form-${this.#$gridWrapperId}`;
                const formData = $(formId).serialize();
                const modalBodyId = `#create-modal-body-${this.#$gridWrapperId}`;
                $.ajax({
                    url: this.#createUrl, // Same URL for saving the data
                    method: 'POST',
                    data: formData,
                    success: (response) => {
                        // Check if the response contains a success indication
                        if (response.success) {
                            $(`#create-modal-${this.#$gridWrapperId}`).modal('hide');
                            this.refresh(); // Refresh the grid
                        } else {
                            // If the response contains HTML, assume it's a partial view with validation errors
                            $(modalBodyId).html(response);
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error('Error creating data:', error);
                        const errorInfo = {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseText: xhr.responseText,
                            error: error
                        };
                        this.#$gridSelector.trigger('createError', [errorInfo]);
                    }
                });
            });
        }
        if (this.#editUrl) {
            this.#$gridSelector.on('click', '.grid-edit', (e) => {
                const editUrl = $(e.currentTarget).data('edit-url');
                const modalId = `#edit-modal-${this.#$gridWrapperId}`;
                const modalBodyId = `#edit-modal-body-${this.#$gridWrapperId}`;

                $.ajax({
                    url: editUrl,
                    method: 'GET',
                    success: (html) => {
                        // Load the partial view content into the modal body
                        $(modalBodyId).html(html);

                        // Show the modal
                        $(modalId).modal('show');
                    },
                    error: (xhr, status, error) => {
                        console.error('Error fetching the partial view:', error);
                        const errorInfo = {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseText: xhr.responseText,
                            error: error
                        };
                        this.#$gridSelector.trigger('editError', [errorInfo]);
                    }
                });
            });

            $(`#edit-modal-save-button-${this.#$gridWrapperId}`).on('click', () => {
                const formId = `#edit-form-${this.#$gridWrapperId}`;
                const formData = $(formId).serialize();
                const modalBodyId = `#edit-modal-body-${this.#$gridWrapperId}`;
                $.ajax({
                    url: this.#editUrl, // Same URL for saving the data
                    method: 'POST',
                    data: formData,
                    success: (response) => {
                        // Check if the response contains a success indication
                        if (response.success) {
                            $(`#edit-modal-${this.#$gridWrapperId}`).modal('hide');
                            this.refresh(); // Refresh the grid
                        } else {
                            // If the response contains HTML, assume it's a partial view with validation errors
                            $(modalBodyId).html(response);
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error('Error saving data:', error);
                        const errorInfo = {
                            status: xhr.status,
                            statusText: xhr.statusText,
                            responseText: xhr.responseText,
                            error: error
                        };
                        this.#$gridSelector.trigger('editError', [errorInfo]);
                    }
                });
            });
        }
        if (this.#deleteUrl) {
            this.#$gridSelector.on('click', '.grid-delete', (e) => {
                const deleteUrl = $(e.currentTarget).data('delete-url');
                const modalId = `#delete-modal-${this.#$gridWrapperId}`;
                const confirmButtonId = `#confirm-delete-button-${this.#$gridWrapperId}`;

                $(modalId).modal('show');

                $(confirmButtonId).off('click').on('click', () => {
                    if (deleteUrl) {
                        $.ajax({
                            url: deleteUrl,
                            method: 'POST',
                            success: (response) => {
                                $(modalId).modal('hide'); // Hide the modal
                                this.removeRowById(response.id); // Remove the row from the grid
                            },
                            error: (xhr, status, error) => {
                                console.error('Error deleting data:', error);
                                const errorInfo = {
                                    status: xhr.status,
                                    statusText: xhr.statusText,
                                    responseText: xhr.responseText,
                                    error: error
                                };
                                this.#$gridSelector.trigger('deleteError', [errorInfo]);
                            }
                        });
                    }
                });
            });
        }
    }

    // Add an action column if needed
    #addActionColumnIfNeeded() {
        if (this.#editUrl || this.#deleteUrl) {
            const actionColumn = {
                title: 'Actions',
                render: (item) => {
                    let actions = '';

                    if (this.#editUrl) {
                        actions += `<i class="fas fa-edit grid-edit" data-edit-url="${this.#editUrl}/${item.id}"></i>`;
                    }

                    if (this.#deleteUrl) {
                        actions += `<i class="fas fa-trash-alt grid-delete" data-delete-url="${this.#deleteUrl}/${item.id}"></i>`;
                    }

                    return actions;
                },
                contentAlign: 'center'
            };

            const actionColumnKey = 'action';
            let existingActionColumn = this.#columns[actionColumnKey];

            if (existingActionColumn) {
                // Overwrite the existing render function
                existingActionColumn.render = actionColumn.render;
            } else {
                // Add the action column if it doesn't exist
                this.#columns[actionColumnKey] = actionColumn;
            }
        }
    }

    // Select a row in the grid
    #selectRow(row) {
        const $selectedRows = this.#$gridSelector.find('tr.selected');

        if ($selectedRows.length > 0) {
            $selectedRows.removeClass('selected');
        }

        $(row).addClass('selected');
        this.#selectedRowId = $(row).data('row-id');

        // Get the selected row data
        const selectedRowData = this.getRowDataById(this.#selectedRowId);

        // Trigger the rowSelected event, passing the row element and the row data
        this.#$gridSelector.trigger('rowSelected', [$(row), selectedRowData]);
    }

    // Load the grid with data
    async #loadGrid(pageNumber = 1) {
        const startTime = performance.now(); // Loading start time
        this.#$gridSelector.trigger('gridLoading', [pageNumber]); // Trigger event for loading start

        const $loadingElement = this.#$gridSelector.find('.grid-loading-overlay');
        $loadingElement.removeClass('grid-loading-hidden'); // Show the loading overlay      

        try {
            let data = await this.#getData(pageNumber);

            const $gridBody = this.#$gridSelector.find(`#grid-body-${this.#$gridWrapperId}`);
            $gridBody.empty();
            this.#rowsData = {}; // Clear the existing rows data
            this.#columnsData = {}; // Clear the existing columns data
            this.#totalPages = 0;
            this.#itemsPerPage = 0;
            this.#totalItems = 0;
            if (data.items.length === 0) {
                $gridBody.html('<tr><td colspan="' + Object.keys(this.#columns).length + '">No data available</td></tr>');
            } else {
                data.items.forEach(item => {
                    const $row = $('<tr></tr>').attr('data-row-id', item.id);
                    const rowData = {}; // Temporary object to store the data for this row

                    Object.keys(this.#columns).forEach(key => {
                        const column = this.#columns[key];
                        let cellContent = String(item[key]) || '';
                        if (column.dataType === "boolean") {
                            cellContent = `<div class="form-check" style="min-height: 0;">
                            <input type="checkbox" class="form-check-input" ${item[key] ? 'checked' : ''} disabled />
                            <label class="form-check-label"></label>
                        </div>`;
                        } else if (column.format) {
                            cellContent = column.format(item[key]);
                        } else if (column.render) {
                            cellContent = column.render(item);
                        }

                        const $td = $('<td></td>').css('text-align', column.contentAlign || 'left').html(cellContent);
                        $row.append($td);

                        // Only store the data if there is no render method
                        if (!column.render) {
                            rowData[key] = item[key];

                            // Populate columnsData
                            if (!this.#columnsData[key]) {
                                this.#columnsData[key] = [];
                            }
                            this.#columnsData[key].push(item[key]);
                        }
                    });

                    // Store the row data using the row ID
                    this.#rowsData[item.id] = rowData;
                    $row.on('click', () => this.#selectRow($row[0])); // Bind click event to select the row
                    $gridBody.append($row);
                    this.#$gridSelector.trigger('rowAdded', [rowData]); // Trigger event for row added
                });

                this.#totalPages = data.totalPages;
                this.#itemsPerPage = data.items.length;
                this.#totalItems = data.totalItems;
            }

            this.#currentPage = pageNumber;

            const endTime = performance.now(); // Loading end time
            const loadTime = Math.round(endTime - startTime); // Loading duration (milliseconds)

            this.#updateRecordCount(this.#totalItems, this.#itemsPerPage, loadTime);
            this.#updatePagination();
            this.#updateSortIcons();

            this.#$gridSelector.trigger('gridLoaded', [data]); // Trigger event for loading complete
        } catch (error) {
            console.error('Error loading grid:', error);
            const $gridBody = this.#$gridSelector.find(`#grid-body-${this.#$gridWrapperId}`);
            $gridBody.html('<tr><td colspan="' + Object.keys(this.#columns).length + '">An error occurred while loading data.</td></tr>');

            this.#$gridSelector.trigger('gridLoadingError', [error]); // Trigger event for loading error
        } finally {
            $loadingElement.addClass('grid-loading-hidden'); // Hide the loading overlay           
        }
    }

    // Fetch grid data from server
    async #getData(pageNumber = 1) {
        try {
            const requestBody = {
                pageNumber: pageNumber,
                pageSize: this.#pageSize,
                globalFilter: this.#globalFilter,
                globalFilterColumns: this.#globalFilterColumns,
                sortColumn: this.#currentSortColumn,
                sortDirection: this.#currentSortDirection,
                columnFilters: this.#columnFilters
            };
            const response = await fetch(this.#dataUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Apply a column filter with debouncing 
    #applyColumnFilter(column, value) {
        clearTimeout(this.#debounceTimeout);
        this.#debounceTimeout = setTimeout(() => {
            if (!value) {
                delete this.#columnFilters[column];
            }
            else if (this.#columns[column].dataType === 'boolean' && value !== 'true' && value !== 'false') {
                delete this.#columnFilters[column];
            } else {
                if (!this.#columnFilters[column]) {
                    this.#columnFilters[column] = {
                        filter: '',
                        matchMode: ''
                    };
                }
                this.#columnFilters[column].filter = value;
                this.#columnFilters[column].matchMode = this.#columns[column].matchMode;
            }
            this.#loadGrid();
        }, 300);
    }

    // Update pagination controls
    #updatePagination() {
        const $pageNumbersSpan = this.#$gridWrapper.find(`#page-numbers-${this.#$gridWrapperId}`);
        $pageNumbersSpan.empty();

        const startPage = Math.max(1, this.#currentPage - 2);
        const endPage = Math.min(this.#totalPages, this.#currentPage + 2);

        const links = [];

        if (this.#currentPage > 1) {
            links.push('<a href="#" class="pagination-first">First</a> ');
            links.push('<a href="#" class="pagination-prev">Previous</a> ');
        }

        if (startPage > 1) {
            links.push(`<a href="#" class="pagination-page" data-page="1">1</a> ... `);
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === this.#currentPage) {
                links.push(`<strong>${i}</strong> `);
            } else {
                links.push(`<a href="#" class="pagination-page" data-page="${i}">${i}</a> `);
            }
        }

        if (endPage < this.#totalPages) {
            links.push(`... <a href="#" class="pagination-page" data-page="${this.#totalPages}">${this.#totalPages}</a>`);
        }

        if (this.#currentPage < this.#totalPages) {
            links.push(` <a href="#" class="pagination-next">Next</a>`);
            links.push(` <a href="#" class="pagination-last">Last</a>`);
        }

        $pageNumbersSpan.html(links.join(''));

        $pageNumbersSpan.find('.pagination-first').on('click', (e) => {
            e.preventDefault();
            this.#loadGrid(1);
        });

        $pageNumbersSpan.find('.pagination-prev').on('click', (e) => {
            e.preventDefault();
            this.#loadGrid(this.#currentPage - 1);
        });

        $pageNumbersSpan.find('.pagination-next').on('click', (e) => {
            e.preventDefault();
            this.#loadGrid(this.#currentPage + 1);
        });

        $pageNumbersSpan.find('.pagination-page').on('click', (e) => {
            e.preventDefault();
            const page = $(e.target).data('page');
            this.#loadGrid(page);
        });
    }

    // Go to the next page
    #nextPage() {
        if (this.#currentPage < this.#totalPages) {
            this.#loadGrid(this.#currentPage + 1);
        }
    }

    // Go to the previous page
    #prevPage() {
        if (this.#currentPage > 1) {
            this.#loadGrid(this.#currentPage - 1);
        }
    }

    // Update the record count display
    #updateRecordCount(totalItems, itemsPerPage, loadTime) {
        const $recordCountElement = this.#$gridWrapper.find(`#record-count-${this.#$gridWrapperId}`);

        const start = (this.#currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(this.#currentPage * itemsPerPage, totalItems);

        if (this.#totalItems > 0)
            $recordCountElement.text(`Showing ${start}-${end} of ${totalItems} records (Loaded in ${loadTime} ms)`);
        else
            $recordCountElement.empty();
    }

    // Apply global filter with debouncing
    #applyGlobalFilter() {
        clearTimeout(this.#debounceTimeout);
        this.#debounceTimeout = setTimeout(() => {
            this.#globalSearch();
        }, 300);
    }

    // Perform a global search
    #globalSearch() {
        this.#globalFilter = this.#$gridWrapper.find(`#grid-global-filter-${this.#$gridWrapperId}`).val();
        this.#loadGrid();
    }

    // Sort the table by a given column
    #sortTable(column) {
        if (this.#currentSortColumn === column) {
            this.#currentSortDirection = (this.#currentSortDirection === 'asc') ? 'desc' : 'asc';
        } else {
            this.#currentSortColumn = column;
            this.#currentSortDirection = 'asc';
        }
        this.#loadGrid();
    }

    // Update sort icons based on the current sort direction
    #updateSortIcons() {
        const $headers = this.#$gridSelector.find('thead .sortable');

        $headers.removeClass('active ascending descending');

        $headers.each((index, header) => {
            const $header = $(header);
            const column = $header.data('column');

            if (column === this.#currentSortColumn) {
                $header.addClass('active');
                if (this.#currentSortDirection === 'asc') {
                    $header.addClass('ascending');
                } else if (this.#currentSortDirection === 'desc') {
                    $header.addClass('descending');
                }
            }
        });
    }

    // Update the match mode for a column
    #updateMatchMode(element) {
        const $element = $(element);
        const $button = $element.closest('.column-filter-container').find('.dropdown-toggle');
        const $input = $element.closest('.column-filter-container').find('input');
        const column = $button.data('matchModeColumn');

        // Update the button text with the selected match mode
        $button.text($element.text());

        // Update the match mode for the column in the internal data structure
        this.#columns[column].matchMode = $element.data('matchMode');

        // Update the active state for the selected match mode in the dropdown
        const $menu = $element.closest('.dropdown-menu');
        if ($menu.length) {
            $menu.find('.match-mode-menu-item').each(function () {
                if ($(this).is($element)) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            });
        }

        // Apply the filter with the updated match mode
        this.#applyColumnFilter(column, $input.val());
    }

    // Initialize match modes for columns
    #initMatchModes() {
        for (const [key, column] of Object.entries(this.#columns)) {
            const $menu = this.#$gridSelector.find(`#match-mode-menu-${this.#$gridWrapperId}-${key}`);
            const $button = this.#$gridSelector.find(`button[data-match-mode-column="${key}"]`);

            if ($menu.length) {
                $menu.find('.match-mode-menu-item').each((index, item) => {
                    const $item = $(item);
                    if ($item.data('match-mode') === column.matchMode) {
                        $item.addClass('active');
                        $button.text($item.text());
                    } else {
                        $item.removeClass('active');
                    }
                });
            }
        }
    }

    // Attach other event listeners
    #attachOtherEventListeners() {
        this.#$gridSelector.on('scroll', () => {
            const scrollTop = this.#$gridSelector.scrollTop();
            const $loadingElement = this.#$gridSelector.find('.grid-loading-overlay');
            $loadingElement.css('top', `${scrollTop + (this.#$gridSelector.height() / 2)}px`);
        });
    }

    // Export grid data to Excel
    async #exportExcel() {
        try {
            this.#$gridSelector.trigger('gridExporting'); // Trigger event for exporting start
            const data = await this.#getData(-1);

            if (!data.items.length) {
                alert('No data to export.');
                return;
            }

            const headers = [];
            const columnKeys = [];

            const $headers = this.#$gridSelector.find('thead th');
            $headers.each((index, th) => {
                const $th = $(th);
                const columnKey = $th.find('span.column-header').data('column');
                if (columnKey) {
                    columnKeys.push(columnKey);
                    headers.push($th.find('span.column-header').text() || columnKey);
                }
            });

            const excelData = [];
            excelData.push(headers);

            data.items.forEach(item => {
                const rowData = columnKeys.map(key => item[key] || '');
                excelData.push(rowData);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Grid Data");

            XLSX.writeFile(workbook, `${this.#exportFileName}.xlsx`);
            this.#$gridSelector.trigger('gridExported', [excelData]); // Trigger event for exporting complete
        } catch (error) {
            console.error('Error exporting grid:', error);
            this.#$gridSelector.trigger('gridExportingError', [error]); // Trigger event for exporting error
        }
    }

    // Remove a row by ID with optional animation
    removeRowById(rowId, animationOptions = {
        enabled: true,
        type: 'scale', // 'scale' or 'fade'
        duration: 500,
        transformScale: 0
    }) {
        const $rowSelector = this.getRowById(rowId);

        if ($rowSelector.length > 0) {
            // Retrieve the row data
            const rowData = this.getRowDataById(rowId);

            // Trigger the rowRemoving event with row element and row data
            this.#$gridSelector.trigger('rowRemoving', [$rowSelector, rowData]);

            const { enabled, type, duration, transformScale } = animationOptions;

            if (enabled) {
                if (type === 'scale') {
                    // Apply the scale animation
                    $rowSelector.css({
                        transform: 'scale(1)',
                        transition: `transform ${duration}ms`
                    });

                    setTimeout(() => {
                        $rowSelector.css('transform', `scale(${transformScale})`);
                        setTimeout(() => {
                            $rowSelector.remove(); // Remove the row from the DOM

                            // Trigger the rowRemoved event with rowId and row data
                            this.#$gridSelector.trigger('rowRemoved', [rowId, rowData]);
                            this.refresh();
                        }, duration); // Wait for the animation to complete
                    }, 10);

                } else if (type === 'fade') {
                    // Apply the fadeOut animation
                    $rowSelector.fadeOut(duration, function () {
                        $(this).remove(); // Remove the row from the DOM

                        // Trigger the rowRemoved event with rowId and row data
                        this.#$gridSelector.trigger('rowRemoved', [rowId, rowData]);
                    }.bind(this)); // Bind 'this' to ensure the correct context
                }
            } else {
                // No animation, just remove the row immediately
                $rowSelector.remove();
                // Trigger the rowRemoved event with rowId and row data
                this.#$gridSelector.trigger('rowRemoved', [rowId, rowData]);
            }
        }
    }

    // Public method to register a callback for the 'createError' event
    onCreateError(callback) {
        this.#$gridSelector.on('createError', callback);
    }

    // Public method to register a callback for the 'editError' event
    onEditError(callback) {
        this.#$gridSelector.on('editError', callback);
    }

    // Public method to register a callback for the 'deleteError' event
    onDeleteError(callback) {
        this.#$gridSelector.on('deleteError', callback);
    }

    // Public method to register a callback for the 'rowRemoving' event
    onRowRemoving(callback) {
        this.#$gridSelector.on('rowRemoving', callback);
    }

    // Public method to register a callback for the 'rowRemoved' event
    onRowRemoved(callback) {
        this.#$gridSelector.on('rowRemoved', callback);
    }

    // Public method to register a callback for the 'rowSelected' event
    onRowSelected(callback) {
        this.#$gridSelector.on('rowSelected', callback);
    }

    // Public method to register a callback for the 'rowAdded' event
    onRowAdded(callback) {
        this.#$gridSelector.on('rowAdded', callback);
    }

    // Public method to register a callback for the 'gridLoading' event
    onGridLoading(callback) {
        this.#$gridSelector.on('gridLoading', callback);
    }

    // Public method to register a callback for the 'gridLoaded' event
    onGridLoaded(callback) {
        this.#$gridSelector.on('gridLoaded', callback);
    }

    // Public method to register a callback for the 'gridLoadingError' event
    onGridLoadingError(callback) {
        this.#$gridSelector.on('gridLoadingError', callback);
    }

    // Public method to register a callback for the 'gridExporting' event
    onGridExporting(callback) {
        this.#$gridSelector.on('gridExporting', callback);
    }

    // Public method to register a callback for the 'gridExported' event
    onGridExported(callback) {
        this.#$gridSelector.on('gridExported', callback);
    }

    // Public method to register a callback for the 'gridExportingError' event
    onGridExportingError(callback) {
        this.#$gridSelector.on('gridExportingError', callback);
    }

    // Refresh the grid
    refresh() {
        this.#loadGrid(this.#currentPage);
    }

    // Public method to get column data by columnKey
    getColumnDataByKey(columnKey) {
        return this.#columnsData[columnKey] || null; // Return the data for the column if it exists, or null if not
    }

    // Public method to get column data by columnIndex
    getColumnDataByIndex(columnIndex) {
        const columnKey = this.getColumnKeyByIndex(columnIndex);
        return this.getColumnDataByKey(columnKey);
    }

    // Helper method to get columnKey by index
    getColumnKeyByIndex(columnIndex) {
        return Object.keys(this.#columns)[columnIndex] || null; // Ensure that the column index is valid
    }

    // Public method to get all columns data
    getColumns() {
        return this.#columnsData;
    }

    // Public method to get all rows data
    getRows() {
        return this.#rowsData;
    }

    // Public method to get data for a specific cell by rowId and columnKey
    getCellDataByRowId(rowId, columnKey) {
        const rowData = this.getRowDataById(rowId);
        if (rowData && rowData.hasOwnProperty(columnKey)) {
            return rowData[columnKey];
        }
        return null; // Return null if the cell data doesn't exist
    }

    // Public method to get data for a specific cell by rowIndex and columnKey
    getCellDataByRowIndexColKey(rowIndex, columnKey) {
        const rowId = this.getRowIdByIndex(rowIndex);
        return this.getCellDataByRowId(rowId, columnKey); // Use getCellDataByRowId for consistency
    }

    // Public method to get data for a specific cell by rowIndex and columnIndex
    getCellDataByRowIndexColIndex(rowIndex, columnIndex) {
        const rowId = this.getRowIdByIndex(rowIndex);
        const columnKey = this.getColumnKeyByIndex(columnIndex);
        return this.getCellDataByRowId(rowId, columnKey); // Use getCellDataByRowId for consistency
    }

    // Public method to get data for a specific cell by rowId and columnIndex
    getCellDataByRowIdColIndex(rowId, columnIndex) {
        const columnKey = this.getColumnKeyByIndex(columnIndex);
        if (columnKey) {
            return this.getCellDataByRowId(rowId, columnKey); // Use getCellDataByRowId for consistency
        }
        return null; // Return null if the columnKey is invalid or doesn't exist
    }

    // Public method to access row by ID
    getRowById(rowId) {
        return this.#$gridSelector.find(`tr[data-row-id="${rowId}"]`);
    }

    // Public method to access row by index
    getRowByIndex(rowIndex) {
        return this.#$gridSelector.find('tr').eq(rowIndex);
    }

    // Public method to get row data by ID, excluding columns with a render method
    getRowDataById(rowId) {
        return this.#rowsData[rowId] || null; // Return the data for the row if it exists, or null if not
    }

    // Public method to get row data by index, excluding columns with a render method
    getRowDataByIndex(rowIndex) {
        const rowId = this.getRowIdByIndex(rowIndex);
        return this.getRowDataById(rowId);
    }

    // Helper method to get rowId by index
    getRowIdByIndex(rowIndex) {
        const $row = this.getRowByIndex(rowIndex);
        return $row.data('row-id');
    }

    // Public method to get the selected row element
    getSelectedRow() {
        if (this.#selectedRowId) {
            return this.getRowById(this.#selectedRowId);
        }
        return null;
    }

    // Public method to get the data of the selected row
    getSelectedRowData() {
        if (this.#selectedRowId) {
            return this.getRowDataById(this.#selectedRowId); // Use getRowDataById for consistency
        }
        return null;
    }
}
