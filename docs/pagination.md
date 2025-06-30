# Pagination Documentation

## Overview

The Pagination component provides flexible pagination capabilities with customizable controls, dynamic page sizes, and scroll-to-top functionality.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [UI Components](#ui-components)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// As part of AFS
const afs = new AFS({
    pagination: {
        enabled: true,
        itemsPerPage: 10
    }
});

// Access pagination
const pagination = afs.pagination;
```

## Basic Usage

### HTML Structure

```html
<!-- Items Container -->
<div id="items-container">
    <div class="afs-filter-item">Item 1</div>
    <div class="afs-filter-item">Item 2</div>
    <!-- More items... -->
</div>

<!-- Pagination Container -->
<div class="afs-pagination-container"></div>
```

### JavaScript Implementation

```javascript
// Initialize with pagination configuration
const afs = new AFS({
    containerSelector: '#items-container',
    itemSelector: '.afs-filter-item',
    pagination: {
        enabled: true,
        itemsPerPage: 10,
        maxButtons: 7,
        container: '.afs-pagination-container',
        showControls: true,
        scrollToTop: true,
        scrollOffset: 50
    }
});
```

## Configuration

### Pagination Options

```javascript
{
    enabled: boolean;           // Enable pagination
    itemsPerPage: number;       // Items per page
    maxButtons: number;         // Maximum page buttons shown
    showControls: boolean;      // Show pagination controls
    scrollToTop: boolean;       // Scroll to top on page change
    scrollOffset: number;       // Offset for scroll to top
    containerClass: string;     // Pagination container class
    pageButtonClass: string;    // Page button class
    activePageClass: string;    // Active page button class
    template: {
        prev: string;          // Previous button text/HTML
        next: string;          // Next button text/HTML
        ellipsis: string;      // Ellipsis text/HTML
    }
}
```

## UI Components

### Default HTML Structure

```html
<div class="afs-pagination">
    <button class="afs-page-button afs-pagination-prev">‹</button>
    <button class="afs-page-button" data-page="1">1</button>
    <span class="afs-pagination-ellipsis">...</span>
    <button class="afs-page-button" data-page="10">10</button>
    <button class="afs-page-button afs-pagination-next">›</button>
</div>
```

### CSS Classes

```css
.afs-pagination {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.afs-page-button {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
    background-color: white;
    transition: all 0.2s;
}

.afs-page-button:hover {
    background-color: #f3f4f6;
}

.afs-page-button.afs-active {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.afs-page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f3f4f6;
}
```

## API Reference

### Methods

#### `goToPage(page: number): void`

Navigate to specific page.

```javascript
afs.pagination.goToPage(2);
```

#### `nextPage(): void`

Go to next page.

```javascript
afs.pagination.nextPage();
```

#### `previousPage(): void`

Go to previous page.

```javascript
afs.pagination.previousPage();
```

#### `configure(options: PaginationOptions): void`

Update pagination configuration.

```javascript
afs.pagination.configure({
    itemsPerPage: 20,
    showControls: true
});
```

#### `getPageInfo(): PageInfo`

Get current pagination information.

```javascript
const info = afs.pagination.getPageInfo();
```

### Properties

```javascript
interface PageInfo {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
```

## Events

```javascript
// Page changed
afs.on('pageChanged', (data) => {
    console.log('Current page:', data.currentPage);
    console.log('Total pages:', data.totalPages);
});

// Items per page changed
afs.on('itemsPerPageChanged', (data) => {
    console.log('Items per page:', data.itemsPerPage);
});

// Pagination updated
afs.on('paginationUpdated', (data) => {
    console.log('Pagination state:', data);
});
```

## Examples

### Basic Pagination

```javascript
// Simple pagination setup
const afs = new AFS({
    pagination: {
        enabled: true,
        itemsPerPage: 10
    }
});
```

### Custom Pagination Controls

```javascript
// Custom pagination template
const afs = new AFS({
    pagination: {
        enabled: true,
        template: {
            prev: '← Previous',
            next: 'Next →',
            ellipsis: '...'
        }
    }
});
```

### Dynamic Page Size

```javascript
// Change items per page
afs.pagination.configure({
    itemsPerPage: 20
});
```

## Best Practices

1. **Configuration**
   - Set appropriate items per page
   - Enable scroll to top for better UX
   - Use consistent styling

2. **User Experience**
   - Show clear page indicators
   - Provide easy navigation controls
   - Display total items/pages when relevant

3. **Performance**
   - Use efficient DOM updates
   - Cache page calculations
   - Limit number of visible pages

4. **Accessibility**
   - Use semantic HTML for controls
   - Include proper ARIA attributes
   - Ensure keyboard navigation works correctly

5. **Error Handling**
   - Handle invalid page numbers gracefully
   - Provide feedback for navigation limits
   - Validate configuration options
