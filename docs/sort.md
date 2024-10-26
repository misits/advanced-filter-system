# Sort System Documentation

## Overview

The Sort System provides flexible sorting capabilities with support for multiple data types, multi-criteria sorting, custom comparators, and dynamic sort controls.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Sort Features](#sort-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { Sort } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    sortButtonSelector: '.btn-sort'
});

// Access sort
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

<!-- Sortable Items -->
<div class="filter-item" data-price="99.99" data-date="2024-03-15">
    <h3>Product Name</h3>
    <p>$99.99</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with sort configuration
const afs = createAFS({
    sortButtonSelector: '.btn-sort',
    activeSortClass: 'active',
    defaultSort: {
        key: 'price',
        direction: 'asc'
    }
});
```

## Configuration

### Sort Options

```javascript
{
    sortButtonSelector: string;     // Sort button selector
    activeSortClass: string;       // Active button class
    defaultSort?: {                // Default sort configuration
        key: string;
        direction: 'asc' | 'desc';
    };
    sortTypes?: {                 // Custom sort type definitions
        [key: string]: 'string' | 'number' | 'date' | Function;
    };
}
```

## Sort Features

### Auto Type Detection

```javascript
// Automatic type detection for sorting
<div data-price="99.99">        // Detected as number
<div data-date="2024-03-15">    // Detected as date
<div data-title="Product Name"> // Detected as string
```

### Multiple Sort Criteria

```javascript
// Sort by multiple fields
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' }
]);
```

### Custom Comparators

```javascript
// Custom sort logic
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
});
```

## API Reference

### Methods

#### `sort(key: string, direction: 'asc' | 'desc'): void`

Sort items by single criterion.

```javascript
afs.sort.sort('price', 'asc');
```

#### `sortMultiple(criteria: SortCriterion[]): void`

Sort by multiple criteria.

```javascript
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' }
]);
```

#### `sortWithComparator(key: string, comparator: Function): void`

Sort using custom comparison function.

```javascript
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b);
});
```

#### `shuffle(): void`

Randomly shuffle items.

```javascript
afs.sort.shuffle();
```

#### `reset(): void`

Reset to default sort state.

```javascript
afs.sort.reset();
```

#### `getCurrentSort(): SortState`

Get current sort state.

```javascript
const currentSort = afs.sort.getCurrentSort();
```

### Properties

```javascript
interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

interface SortButton {
    key: string;
    direction: 'asc' | 'desc';
}
```

## Events

```javascript
// Sort applied
afs.on('sort', (data) => {
    console.log('Sort key:', data.key);
    console.log('Direction:', data.direction);
});

// Multiple sort applied
afs.on('multiSort', (data) => {
    console.log('Sort criteria:', data.criteria);
});

// Custom sort applied
afs.on('customSort', (data) => {
    console.log('Custom sort by:', data.key);
});

// Items shuffled
afs.on('shuffle', () => {
    console.log('Items shuffled');
});

// Sort reset
afs.on('sortReset', () => {
    console.log('Sort reset to default');
});
```

## Examples

### Basic Sorting

```javascript
// Single criterion sort
afs.sort.sort('price', 'asc');

// Toggle sort direction
afs.sort.sort('price', 
    afs.sort.getCurrentSort().direction === 'asc' ? 'desc' : 'asc'
);
```

### Complex Sorting

```javascript
// Multi-criteria sort
afs.sort.sortMultiple([
    { key: 'inStock', direction: 'desc' },
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'asc' }
]);
```

### Custom Sort Implementation

```javascript
// Natural sort for version numbers
afs.sort.sortWithComparator('version', (a, b) => {
    return a.split('.').map(Number).reduce((acc, val, i) => {
        return acc || val - b.split('.')[i];
    }, 0);
});
```

### Dynamic Sort Buttons

```javascript
// Add sort button dynamically
const button = document.createElement('button');
button.className = 'btn-sort';
button.dataset.sortKey = 'rating';
button.dataset.sortDirection = 'desc';
afs.sort.addSortButton(button);

// Remove sort button
afs.sort.removeSortButton(button);
```

## TypeScript

```typescript
interface SortOptions {
    sortButtonSelector: string;
    activeSortClass: string;
    defaultSort?: SortState;
    sortTypes?: Record<string, string | Function>;
}

interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}

interface SortCriterion {
    key: string;
    direction: 'asc' | 'desc';
}

interface SortEvent {
    key: string;
    direction: 'asc' | 'desc';
    previousSort?: SortState;
}
```

## Best Practices

1. **Performance Optimization**

   ```javascript
   // Cache computed values for sorting
   const cache = new Map();
   
   afs.sort.sortWithComparator('complex', (a, b) => {
       if (!cache.has(a)) {
           cache.set(a, computeComplexValue(a));
       }
       if (!cache.has(b)) {
           cache.set(b, computeComplexValue(b));
       }
       return cache.get(a) - cache.get(b);
   });
   ```

2. **Memory Management**

   ```javascript
   // Clear caches when removing items
   afs.on('itemRemoved', () => {
       cache.clear();
   });
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.sort.sortMultiple(criteria);
   } catch (error) {
       console.error('Sort error:', error);
       afs.sort.reset(); // Fallback to default sort
   }
   ```

4. **Accessibility**

   ```javascript
   // Add ARIA attributes to sort buttons
   const button = document.querySelector('.btn-sort');
   button.setAttribute('aria-sort', 'ascending');
   button.setAttribute('aria-label', 'Sort by price ascending');
   ```

5. **URL Integration**

   ```javascript
   // Update URL with sort state
   afs.on('sort', (data) => {
       const url = new URL(window.location);
       url.searchParams.set('sort', `${data.key},${data.direction}`);
       window.history.pushState({}, '', url);
   });
   ```

6. **Sort State Persistence**

   ```javascript
   // Save sort state
   function saveSortState() {
       const currentSort = afs.sort.getCurrentSort();
       localStorage.setItem('afs_sort', JSON.stringify(currentSort));
   }
   
   // Restore sort state
   function restoreSortState() {
       const saved = localStorage.getItem('afs_sort');
       if (saved) {
           const { key, direction } = JSON.parse(saved);
           afs.sort.sort(key, direction);
       }
   }
   ```
