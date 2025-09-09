# Sort System Documentation

## Overview

The Sort System provides powerful and flexible sorting capabilities with automatic type detection, multi-criteria sorting, custom comparators, shuffle functionality, and robust error handling. The system intelligently detects data types (string, number, date) and provides optimal sorting performance.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Sort Features](#sort-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize with sort configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    sortButtonSelector: '.btn-sort',
    activeSortClass: 'active-sort'
});

// Access sort functionality
const sort = afs.sort;
```

## Basic Usage

### HTML Structure

```html
<!-- Sort Buttons -->
<button class="btn-sort" data-sort-key="price" data-sort-direction="asc">
    Price <span class="sort-direction">↑</span>
</button>
<button class="btn-sort" data-sort-key="date" data-sort-direction="desc">
    Date <span class="sort-direction">↓</span>
</button>
<button class="btn-sort" data-sort-key="title" data-sort-direction="asc">
    Name <span class="sort-direction"></span>
</button>

<!-- Sortable Items -->
<div class="filter-item" 
     data-price="2499" 
     data-date="2024-03-15" 
     data-title="MacBook Pro">
    <h3>MacBook Pro</h3>
    <p>$2,499 - March 15, 2024</p>
</div>

<div class="filter-item" 
     data-price="1299" 
     data-date="2024-02-10" 
     data-title="iPad Pro">
    <h3>iPad Pro</h3>
    <p>$1,299 - February 10, 2024</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with sort configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    sortButtonSelector: '.btn-sort',
    activeSortClass: 'active-sort'
});

// Programmatic sorting
afs.sort.sort('price', 'desc');
afs.sort.shuffle();
afs.sort.reset();
```

## Configuration

### Sort Options

```javascript
const afs = new AFS({
    // Required selectors
    sortButtonSelector: '.btn-sort',    // Sort button selector
    activeSortClass: 'active-sort',     // Active button class
    
    // Optional configuration
    containerSelector: '.items-container', // Container for reordering
    itemSelector: '.filter-item'           // Items to sort
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sortButtonSelector` | string | null | CSS selector for sort buttons |
| `activeSortClass` | string | `'active'` | CSS class for active sort button |
| `containerSelector` | string | null | Container element for DOM reordering |
| `itemSelector` | string | null | Items to be sorted |

## Sort Features

### Automatic Type Detection

The sort system automatically detects data types for optimal sorting:

```html
<!-- Number detection -->
<div data-price="99.99">         <!-- Detected as number -->
<div data-rating="4.5">          <!-- Detected as number -->

<!-- Date detection -->
<div data-date="2024-03-15">     <!-- Detected as date -->
<div data-created="2024-02-10">  <!-- Detected as date -->

<!-- String detection (default) -->
<div data-title="Product Name">  <!-- Detected as string -->
<div data-category="Electronics"> <!-- Detected as string -->
```

### Multi-Criteria Sorting

Sort by multiple fields with different directions:

```javascript
// Sort by category (ascending), then price (descending)
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' }
]);

// Sort with priority order
afs.sort.sortMultiple([
    { key: 'inStock', direction: 'desc' },  // Show in-stock first
    { key: 'rating', direction: 'desc' },   // Then by rating
    { key: 'price', direction: 'asc' }      // Finally by price
]);
```

### Custom Comparators

Implement custom sorting logic:

```javascript
// Natural sorting for version numbers
afs.sort.sortWithComparator('version', (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
});

// Case-sensitive string sorting
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b);
});
```

### Shuffle Functionality

Randomly shuffle items using Fisher-Yates algorithm:

```javascript
// Randomly shuffle all items
afs.sort.shuffle();
```

### Performance Optimizations

- **Smart reordering**: Only reorders DOM when necessary
- **Type caching**: Caches detected types for multi-criteria sorts
- **Document fragments**: Uses fragments for efficient DOM manipulation
- **Error resilience**: Graceful handling of missing data attributes

## API Reference

### Core Methods

#### `sort(key: string, direction: 'asc' | 'desc'): boolean`

Sort items by a single data attribute with automatic type detection.

```javascript
// Sort by price ascending
const success = afs.sort.sort('price', 'asc');

// Sort by date descending
afs.sort.sort('date', 'desc');

// Sort by title alphabetically
afs.sort.sort('title', 'asc');
```

#### `sortMultiple(criteria: SortCriterion[]): boolean`

Sort by multiple criteria with priority order.

```javascript
// Multi-criteria sorting
const success = afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' },
    { key: 'title', direction: 'asc' }
]);

if (!success) {
    console.error('Multi-sort failed');
}
```

#### `sortWithComparator(key: string, comparator: Function): boolean`

Sort using a custom comparison function.

```javascript
// Natural alphanumeric sorting
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b, undefined, { 
        numeric: true, 
        sensitivity: 'base' 
    });
});

// Custom numeric comparison
afs.sort.sortWithComparator('price', (a, b) => {
    return parseFloat(a) - parseFloat(b);
});
```

#### `shuffle(): boolean`

Randomly shuffle items using Fisher-Yates algorithm.

```javascript
const success = afs.sort.shuffle();
```

#### `reset(): boolean`

Reset sort buttons and clear sort state.

```javascript
// Reset all sort buttons to default state
afs.sort.reset();
```

#### `getCurrentSort(): Object|null`

Get current sort state.

```javascript
const currentSort = afs.sort.getCurrentSort();
if (currentSort) {
    console.log(`Sorted by ${currentSort.key} ${currentSort.direction}`);
}
```

### Button Management

#### `addSortButton(button: HTMLElement, key: string, direction?: string): void`

Dynamically add a sort button.

```javascript
const button = document.createElement('button');
button.innerHTML = 'Rating <span class="sort-direction"></span>';
afs.sort.addSortButton(button, 'rating', 'desc');
```

#### `removeSortButton(button: HTMLElement): void`

Remove a sort button.

```javascript
afs.sort.removeSortButton(button);
```

### Type Definitions

```javascript
// Sort criterion for multi-sort
interface SortCriterion {
    key: string;                    // Data attribute name
    direction?: 'asc' | 'desc';    // Sort direction (default: 'asc')
}

// Current sort state
interface SortState {
    key: string;                    // Currently sorted key
    direction: 'asc' | 'desc';     // Current sort direction
}

// Detected sort types
type SortType = 'string' | 'number' | 'date';
```

## Events

```javascript
// Single sort applied
afs.on('sort', (data) => {
    console.log('Sort key:', data.key);
    console.log('Direction:', data.direction);
    console.log('Detected type:', data.sortType);
    console.log('Items sorted:', data.itemCount);
});

// Multi-criteria sort applied
afs.on('multiSort', (data) => {
    console.log('Sort criteria:', data.criteria);
    console.log('Items sorted:', data.itemCount);
    console.log('Detected types:', data.sortTypes);
});

// Custom comparator sort applied
afs.on('customSort', (data) => {
    console.log('Custom sort by:', data.key);
    console.log('Comparator:', data.comparatorName);
    console.log('Items sorted:', data.itemCount);
});

// Items shuffled
afs.on('shuffle', (data) => {
    console.log('Items shuffled:', data.itemCount);
});

// Sort reset
afs.on('sortReset', (data) => {
    console.log('Sort reset - buttons affected:', data.buttonCount);
});
```

## Examples

### Basic Sorting

```javascript
// Sort by different data types
afs.sort.sort('price', 'asc');     // Number sorting
afs.sort.sort('date', 'desc');     // Date sorting  
afs.sort.sort('title', 'asc');     // String sorting

// Toggle sort direction
const currentSort = afs.sort.getCurrentSort();
if (currentSort && currentSort.key === 'price') {
    const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    afs.sort.sort('price', newDirection);
}
```

### Multi-Criteria Sorting

```javascript
// E-commerce product sorting
afs.sort.sortMultiple([
    { key: 'inStock', direction: 'desc' },     // Show in-stock first
    { key: 'featured', direction: 'desc' },    // Then featured items
    { key: 'rating', direction: 'desc' },      // Then by rating
    { key: 'price', direction: 'asc' }         // Finally by price
]);

// Category-based sorting
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'subcategory', direction: 'asc' },
    { key: 'title', direction: 'asc' }
]);
```

### Custom Sorting Examples

```javascript
// Natural alphanumeric sorting
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base'
    });
});

// Version number sorting
afs.sort.sortWithComparator('version', (a, b) => {
    const normalize = (v) => v.split('.').map(n => parseInt(n, 10));
    const partsA = normalize(a);
    const partsB = normalize(b);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const diff = (partsA[i] || 0) - (partsB[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
});

// File size sorting (handles units)
afs.sort.sortWithComparator('fileSize', (a, b) => {
    const parseSize = (size) => {
        const units = { 'B': 1, 'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024 };
        const match = size.match(/(\d+(?:\.\d+)?)\s*(\w+)/);
        return match ? parseFloat(match[1]) * (units[match[2]] || 1) : 0;
    };
    return parseSize(a) - parseSize(b);
});
```

### Interactive Sorting

```javascript
// Initialize AFS with sort capabilities
const afs = new AFS({
    containerSelector: '.products-grid',
    itemSelector: '.product-card',
    sortButtonSelector: '.sort-btn',
    activeSortClass: 'sort-active'
});

// Listen for sort events
afs.on('sort', (data) => {
    document.querySelector('.sort-info').textContent = 
        `Sorted ${data.itemCount} items by ${data.key} (${data.direction}) - Type: ${data.sortType}`;
});

// Add shuffle button
document.querySelector('.shuffle-btn').addEventListener('click', () => {
    afs.sort.shuffle();
});

// Add reset button
document.querySelector('.reset-btn').addEventListener('click', () => {
    afs.sort.reset();
});
```

## Best Practices

### 1. Data Structure

- **Use consistent data attributes**: Store sortable values in `data-*` attributes
- **Proper data formatting**: Use ISO dates (`2024-03-15`), plain numbers (`123.45`)
- **Handle missing data**: Provide fallback values or empty string defaults

```html
<!-- Good: Consistent data structure -->
<div class="product-card" 
     data-price="1299.99" 
     data-date="2024-03-15" 
     data-title="MacBook Pro" 
     data-rating="4.8"
     data-inStock="true">
</div>

<!-- Bad: Inconsistent or complex data -->
<div data-price="$1,299.99" data-date="March 15, 2024"></div>
```

### 2. Sort Button Design

- **Clear visual indicators**: Show sort direction with arrows or icons
- **Active state styling**: Highlight currently active sort
- **Consistent placement**: Group related sort options together

```html
<!-- Good: Clear sort button structure -->
<button class="btn-sort" data-sort-key="price" data-sort-direction="asc">
    Price
    <span class="sort-direction" aria-label="ascending">↑</span>
</button>
```

### 3. Performance Optimization

- **Limit multi-criteria sorting**: Use 3 or fewer criteria for best performance
- **Cache sort types**: Types are automatically cached for multi-sort operations
- **Monitor sort events**: Use events to update UI and track usage
- **Batch operations**: Sort combines with filtering and pagination efficiently

### 4. User Experience

- **Provide feedback**: Show sort status and number of items
- **Default sorting**: Start with logical default sort (e.g., most relevant)
- **Toggle behavior**: Allow easy direction switching on button click
- **Reset functionality**: Provide way to clear sorts and return to default

```javascript
// Good: User feedback
afs.on('sort', (data) => {
    const status = document.querySelector('.sort-status');
    status.textContent = `Sorted ${data.itemCount} items by ${data.key} (${data.direction})`;
});
```

### 5. Accessibility

- **Semantic HTML**: Use button elements for sort controls
- **ARIA attributes**: Include appropriate labels and states
- **Keyboard support**: Ensure all sort controls are keyboard accessible
- **Screen reader support**: Provide clear sort status announcements

```html
<!-- Accessible sort button -->
<button class="btn-sort" 
        data-sort-key="price" 
        aria-pressed="false" 
        aria-describedby="price-sort-desc">
    Price
    <span class="sort-direction" aria-hidden="true">↑</span>
</button>
<div id="price-sort-desc" class="sr-only">
    Sort products by price
</div>
```

### 6. Error Handling

- **Validate sort keys**: Check data attributes exist before sorting
- **Handle type detection failures**: Fallback to string sorting
- **Graceful degradation**: Continue operation even if individual items fail
- **Debug logging**: Enable debug mode to troubleshoot sort issues

```javascript
// Good: Check sort success
const sortSuccess = afs.sort.sort('price', 'asc');
if (!sortSuccess) {
    console.warn('Sort operation failed');
    // Provide user feedback or fallback
}
```
