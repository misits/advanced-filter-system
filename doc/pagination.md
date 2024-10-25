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
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { Pagination } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
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
    <div class="filter-item">Item 1</div>
    <div class="filter-item">Item 2</div>
    <!-- More items... -->
</div>

<!-- Pagination Container -->
<div class="pagination-container"></div>
```

### JavaScript Implementation

```javascript
// Initialize with pagination configuration
const afs = createAFS({
    containerSelector: '#items-container',
    itemSelector: '.filter-item',
    pagination: {
        enabled: true,
        itemsPerPage: 10,
        maxButtons: 7,
        container: '.pagination-container',
        showPrevNext: true,
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
    showPrevNext: boolean;      // Show previous/next buttons
    showFirstLast: boolean;     // Show first/last page buttons
    scrollToTop: boolean;       // Scroll to top on page change
    scrollOffset: number;       // Offset for scroll to top
    containerClass: string;     // Pagination container class
    pageButtonClass: string;    // Page button class
    activePageClass: string;    // Active page button class
    template: {
        prev: string;          // Previous button text/HTML
        next: string;          // Next button text/HTML
        first: string;         // First page button text/HTML
        last: string;          // Last page button text/HTML
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
}

.afs-page-button.active {
    background-color: #3b82f6;
    color: white;
}

.afs-page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

## API Reference

### Methods

#### `goToPage(page: number): void`

Navigate to specific page.

```javascript
afs.pagination.goToPage(2);
```

#### `setItemsPerPage(count: number): void`

Set number of items per page.

```javascript
afs.pagination.setItemsPerPage(20);
```

#### `getPageInfo(): PageInfo`

Get current pagination information.

```javascript
const info = afs.pagination.getPageInfo();
```

#### `update(): void`

Update pagination state and UI.

```javascript
afs.pagination.update();
```

#### `refresh(): void`

Refresh pagination with current state.

```javascript
afs.pagination.refresh();
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
afs.on('pagination', (data) => {
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
const afs = createAFS({
    pagination: {
        enabled: true,
        itemsPerPage: 10
    }
});
```

### Custom Pagination Controls

```javascript
// Custom pagination template
const afs = createAFS({
    pagination: {
        template: {
            prev: '← Previous',
            next: 'Next →',
            first: '|←',
            last: '→|',
            ellipsis: '...'
        }
    }
});
```

### Dynamic Page Size

```javascript
// Add page size selector
const pageSizeSelector = document.createElement('select');
[10, 20, 50, 100].forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = `${size} per page`;
    pageSizeSelector.appendChild(option);
});

pageSizeSelector.addEventListener('change', (e) => {
    afs.pagination.setItemsPerPage(Number(e.target.value));
});
```

### Infinite Scroll

```javascript
// Implement infinite scroll
window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        const info = afs.pagination.getPageInfo();
        if (info.hasNextPage) {
            afs.pagination.goToPage(info.currentPage + 1);
        }
    }
});
```

## TypeScript

```typescript
interface PaginationOptions {
    enabled: boolean;
    itemsPerPage: number;
    maxButtons?: number;
    showPrevNext?: boolean;
    showFirstLast?: boolean;
    scrollToTop?: boolean;
    scrollOffset?: number;
    containerClass?: string;
    pageButtonClass?: string;
    activePageClass?: string;
    template?: PaginationTemplate;
}

interface PaginationTemplate {
    prev?: string;
    next?: string;
    first?: string;
    last?: string;
    ellipsis?: string;
}

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

interface PaginationEvent {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
}
```

## Best Practices

1. **Performance Optimization**

   ```javascript
   // Cache page calculations
   const pageCache = new Map();
   
   function getPageItems(page) {
       const cacheKey = `page_${page}`;
       if (!pageCache.has(cacheKey)) {
           pageCache.set(cacheKey, calculatePageItems(page));
       }
       return pageCache.get(cacheKey);
   }
   ```

2. **Memory Management**

   ```javascript
   // Clear cache on filter/sort
   afs.on('filter', () => pageCache.clear());
   afs.on('sort', () => pageCache.clear());
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.pagination.goToPage(page);
   } catch (error) {
       console.error('Pagination error:', error);
       afs.pagination.goToPage(1); // Fallback to first page
   }
   ```

4. **Accessibility**

   ```javascript
   // Add ARIA attributes
   const paginationContainer = document.querySelector('.afs-pagination');
   paginationContainer.setAttribute('role', 'navigation');
   paginationContainer.setAttribute('aria-label', 'Pagination');
   
   // Announce page changes
   afs.on('pagination', (data) => {
       announcePageChange(data.currentPage, data.totalPages);
   });
   ```

5. **URL Integration**

   ```javascript
   // Update URL with page number
   afs.on('pagination', (data) => {
       const url = new URL(window.location);
       url.searchParams.set('page', data.currentPage.toString());
       window.history.pushState({}, '', url);
   });
   ```

6. **Responsive Design**

   ```javascript
   // Adjust buttons based on screen size
   function updatePaginationLayout() {
       const width = window.innerWidth;
       afs.pagination.updateConfig({
           maxButtons: width < 768 ? 3 : 7
       });
   }
   
   window.addEventListener('resize', updatePaginationLayout);
   ```
