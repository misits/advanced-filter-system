# Pagination Documentation

## Overview

The Pagination component provides powerful pagination capabilities with smart controls, smooth animations, scroll-to-top functionality, and mobile optimization. It automatically updates based on filtering and search results, includes ellipsis for long page ranges, and provides both programmatic and UI controls.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Pagination Features](#pagination-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize with pagination
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    
    // Pagination configuration
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        container: '.pagination-container',
        showPrevNext: true,
        scrollToTop: true
    }
});

// Access pagination functionality
const pagination = afs.pagination;
```

## Basic Usage

### HTML Structure

```html
<!-- Items Container -->
<div class="items-container">
    <div class="filter-item" data-title="Item 1">Item 1 Content</div>
    <div class="filter-item" data-title="Item 2">Item 2 Content</div>
    <div class="filter-item" data-title="Item 3">Item 3 Content</div>
    <!-- More items... -->
</div>

<!-- Pagination Container (automatically populated) -->
<div class="pagination-container"></div>

<!-- Optional: Pagination toggle -->
<button class="pagination-toggle">Toggle Pagination</button>
```

### JavaScript Implementation

```javascript
// Complete setup with pagination
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        container: '.pagination-container',
        showPrevNext: true,
        scrollToTop: true,
        maxButtons: 7,
        animationType: 'fade'
    }
});

// Listen for pagination events
afs.on('pagination', (data) => {
    console.log(`Page ${data.currentPage} of ${data.totalPages}`);
    console.log(`Showing ${data.visibleItems} items`);
});
```

## Configuration

### Pagination Options

```javascript
const afs = new AFS({
    // Core pagination settings
    pagination: {
        enabled: true,                    // Enable/disable pagination
        itemsPerPage: 12,                 // Items to show per page
        container: '.pagination-container', // Container selector for pagination controls
        
        // UI configuration
        showPrevNext: true,               // Show previous/next buttons
        maxButtons: 7,                    // Maximum page buttons to display
        containerClass: 'afs-pagination', // CSS class for pagination container
        pageButtonClass: 'afs-page-button', // CSS class for page buttons
        activePageClass: 'afs-page-active', // CSS class for active page button
        
        // Behavior settings
        scrollToTop: true,                // Scroll to top on page change
        scrollOffset: 0,                  // Offset for scroll position
        animationType: 'fade'             // Animation type for page transitions
    }
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable pagination |
| `itemsPerPage` | number | 10 | Number of items per page |
| `container` | string | null | CSS selector for pagination container |
| `showPrevNext` | boolean | true | Show previous/next navigation buttons |
| `maxButtons` | number | 7 | Maximum page buttons to display |
| `containerClass` | string | `'afs-pagination'` | CSS class for pagination wrapper |
| `pageButtonClass` | string | `'afs-page-button'` | CSS class for page buttons |
| `activePageClass` | string | `'afs-page-active'` | CSS class for active page |
| `scrollToTop` | boolean | true | Scroll to top on page change |
| `scrollOffset` | number | 0 | Pixel offset for scroll position |
| `animationType` | string | `'fade'` | Animation type for transitions |

## Pagination Features

### Smart Page Range Calculation

The pagination system intelligently calculates which page numbers to display:

- Always shows first and last page
- Shows ellipsis (...) when there are gaps
- Limits total buttons based on `maxButtons` setting
- Centers current page when possible

```html
<!-- Example: Large page range with ellipsis -->
<div class="afs-pagination">
    <button class="afs-page-button afs-pagination-prev">‹</button>
    <button class="afs-page-button" data-page="1">1</button>
    <span class="afs-pagination-ellipsis">...</span>
    <button class="afs-page-button" data-page="5">5</button>
    <button class="afs-page-button afs-page-active" data-page="6">6</button>
    <button class="afs-page-button" data-page="7">7</button>
    <span class="afs-pagination-ellipsis">...</span>
    <button class="afs-page-button" data-page="20">20</button>
    <button class="afs-page-button afs-pagination-next">›</button>
</div>
```

### Automatic State Management

- Updates automatically when items are filtered or searched
- Adjusts current page if it becomes invalid
- Maintains state through URL parameters (with URLManager)
- Syncs with filtering and sorting operations

### Mobile Optimization

- Disables scroll-to-top on mobile devices (screen width ≤ 768px)
- Skips animations on mobile for better performance
- Optimized touch interaction for page buttons

### Animation Integration

Supports smooth transitions when changing pages:

```javascript
// Animation options
pagination: {
    animationType: 'fade'    // fade, slide, scale, etc.
}
```

## API Reference

### Core Methods

#### `goToPage(page: number): void`

Navigate to a specific page with validation and smooth transitions.

```javascript
// Navigate to page 3
afs.pagination.goToPage(3);

// Navigate to first page
afs.pagination.goToPage(1);

// Page numbers are automatically clamped to valid range
afs.pagination.goToPage(999); // Will go to last available page
```

#### `update(): void`

Manually trigger pagination update (usually called automatically).

```javascript
// Force pagination recalculation
afs.pagination.update();
```

#### `setPaginationMode(enabled: boolean): void`

Toggle pagination on/off dynamically.

```javascript
// Enable pagination
afs.pagination.setPaginationMode(true);

// Disable pagination (show all items)
afs.pagination.setPaginationMode(false);
```

### State Access

Access pagination state through the main AFS state system:

```javascript
// Get current pagination state
const paginationState = afs.state.getState().pagination;
console.log('Current page:', paginationState.currentPage);
console.log('Items per page:', paginationState.itemsPerPage);
console.log('Total pages:', paginationState.totalPages);

// Check if on first/last page
const isFirstPage = paginationState.currentPage === 1;
const isLastPage = paginationState.currentPage === paginationState.totalPages;
```

### Type Definitions

```javascript
// Pagination configuration
interface PaginationConfig {
    enabled: boolean;
    itemsPerPage: number;
    container: string;
    showPrevNext: boolean;
    maxButtons: number;
    containerClass: string;
    pageButtonClass: string;
    activePageClass: string;
    scrollToTop: boolean;
    scrollOffset: number;
    animationType: string;
}

// Pagination state
interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
}
```

## Events

```javascript
// Pagination state updated (fired after filtering, searching, etc.)
afs.on('pagination', (data) => {
    console.log('Current page:', data.currentPage);
    console.log('Total pages:', data.totalPages);
    console.log('Items per page:', data.itemsPerPage);
    console.log('Visible items:', data.visibleItems);
});

// Page changed by user interaction
afs.on('pageChanged', (data) => {
    console.log('Changed from page', data.previousPage, 'to page', data.currentPage);
    console.log('Total pages:', data.totalPages);
});

// Pagination mode toggled
afs.on('paginationModeChanged', (data) => {
    console.log('Pagination enabled:', data.enabled);
});

// Listen for state changes
afs.on('pageChanged', (data) => {
    console.log('Page changed:', data.currentPage);
    console.log('Total pages:', data.totalPages);
});
```

## Examples

### Basic Pagination Setup

```javascript
// Simple pagination configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        container: '.pagination-container'
    }
});
```

### Advanced Pagination Configuration

```javascript
// Complete pagination setup with all options
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    pagination: {
        enabled: true,
        itemsPerPage: 15,
        container: '.pagination-container',
        showPrevNext: true,
        maxButtons: 5,
        scrollToTop: true,
        scrollOffset: 100,
        animationType: 'slide',
        containerClass: 'custom-pagination',
        pageButtonClass: 'custom-page-btn',
        activePageClass: 'active-page'
    }
});
```

### Dynamic Pagination Control

```javascript
// Initialize AFS
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    pagination: {
        enabled: true,
        itemsPerPage: 12
    }
});

// Toggle pagination mode
document.querySelector('.pagination-toggle').addEventListener('click', () => {
    const isEnabled = afs.state.getState().pagination;
    afs.pagination.setPaginationMode(!isEnabled);
});

// Navigate programmatically
document.querySelector('.go-to-page-5').addEventListener('click', () => {
    afs.pagination.goToPage(5);
});

// Listen for page changes
afs.on('pageChanged', (data) => {
    document.querySelector('.page-info').textContent = 
        `Page ${data.currentPage} of ${data.totalPages}`;
});
```

### Integration with Filtering and Search

```javascript
// Pagination automatically updates when filtering/searching
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    searchInputSelector: '.search-input',
    
    // Pagination works seamlessly with other features
    pagination: {
        enabled: true,
        itemsPerPage: 10,
        container: '.pagination-container',
        scrollToTop: true
    },
    
    // Filter logic
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true }
    }
});

// When user filters or searches, pagination automatically updates
// No additional code needed!
```

### Custom Pagination UI

```javascript
// Initialize with custom classes
const afs = new AFS({
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        containerClass: 'my-pagination',
        pageButtonClass: 'page-btn',
        activePageClass: 'current-page'
    }
});

// Custom CSS to match your design
/*
.my-pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
}

.page-btn {
    padding: 10px 15px;
    border: 2px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
}

.page-btn:hover {
    background: #f5f5f5;
}

.page-btn.current-page {
    background: #007bff;
    color: white;
    border-color: #007bff;
}
*/
```

## Best Practices

### 1. Configuration

- **Choose appropriate page sizes**: 10-20 items per page for lists, 8-12 for cards
- **Enable scroll to top**: Improves UX when navigating between pages
- **Optimize for mobile**: Consider smaller page sizes on mobile devices
- **Set reasonable max buttons**: 5-9 buttons work well for most designs

```javascript
// Good: Responsive page size
const afs = new AFS({
    pagination: {
        enabled: true,
        itemsPerPage: window.innerWidth <= 768 ? 8 : 12,
        maxButtons: 7,
        scrollToTop: true
    }
});
```

### 2. User Experience

- **Show page context**: Display current page and total pages
- **Provide navigation shortcuts**: Include first/last page buttons
- **Give feedback**: Show loading states during page changes
- **Handle edge cases**: Gracefully handle empty results

```javascript
// Good: Show pagination info
afs.on('pagination', (data) => {
    const info = document.querySelector('.pagination-info');
    info.textContent = `Page ${data.currentPage} of ${data.totalPages} (${data.visibleItems} items)`;
});
```

### 3. Performance

- **Efficient DOM updates**: Pagination automatically optimizes DOM manipulation
- **Lazy loading**: Only render visible items (built-in)
- **Animation optimization**: Animations are skipped on mobile for better performance
- **State management**: Pagination state is efficiently managed through AFS state system

### 4. Accessibility

- **Semantic HTML**: Use button elements for pagination controls
- **ARIA attributes**: Include appropriate labels and states
- **Keyboard navigation**: Ensure all controls are keyboard accessible
- **Screen reader support**: Provide clear pagination context

```html
<!-- Accessible pagination structure -->
<div class="pagination-container" role="navigation" aria-label="Pagination">
    <button class="page-btn" data-page="1" aria-label="Go to page 1">1</button>
    <button class="page-btn current-page" data-page="2" aria-label="Current page, page 2" aria-current="page">2</button>
    <button class="page-btn" data-page="3" aria-label="Go to page 3">3</button>
</div>
```

### 5. Integration Best Practices

- **Combine with filtering**: Pagination automatically updates when filters change
- **URL state persistence**: Use URLManager to maintain pagination state in URLs
- **Event handling**: Listen to pagination events for analytics and UI updates
- **Error handling**: Pagination gracefully handles edge cases and invalid states

```javascript
// Good: Complete integration
const afs = new AFS({
    // Core functionality
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    searchInputSelector: '.search-input',
    
    // Pagination
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        container: '.pagination-container',
        scrollToTop: true
    },
    
    // URL state management
    preserveState: true,
    urlStateKey: 'filters'
});

// Monitor pagination for analytics
afs.on('pageChanged', (data) => {
    // Track page navigation
    analytics.track('pagination_used', {
        previousPage: data.previousPage,
        currentPage: data.currentPage,
        totalPages: data.totalPages
    });
});
```

### 6. Styling Guidelines

- **Consistent spacing**: Maintain uniform spacing between buttons
- **Clear active states**: Make current page clearly identifiable
- **Hover effects**: Provide visual feedback for interactive elements
- **Responsive design**: Adapt button sizes and spacing for different screen sizes

```css
/* Example pagination styles */
.afs-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin: 20px 0;
}

.afs-page-button {
    min-width: 40px;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.afs-page-button:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
}

.afs-page-button.afs-page-active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.afs-page-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f9fafb;
}

@media (max-width: 768px) {
    .afs-pagination {
        gap: 4px;
    }
    
    .afs-page-button {
        min-width: 36px;
        height: 36px;
        padding: 0 8px;
        font-size: 14px;
    }
}
```
