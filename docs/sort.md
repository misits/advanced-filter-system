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
- [Best Practices](#best-practices)

## Installation

```javascript
import { Sort } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    sort: {
        enabled: true,
        buttonSelector: '.afs-btn-sort'
    }
});

// Access sort
const sort = afs.sort;
```

## Basic Usage

### HTML Structure

```html
<!-- Sort Buttons -->
<button class="afs-btn-sort" data-sort-key="price" data-sort-direction="asc">
    Price <span class="afs-sort-direction">↑</span>
</button>
<button class="afs-btn-sort" data-sort-key="date" data-sort-direction="desc">
    Date <span class="afs-sort-direction">↓</span>
</button>

<!-- Sortable Items -->
<div class="afs-filter-item" data-price="99.99" data-date="2024-03-15">
    <h3>Product Name</h3>
    <p>$99.99</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with sort configuration
const afs = createAFS({
    sort: {
        enabled: true,
        buttonSelector: '.afs-btn-sort',
        activeClass: 'afs-active',
        defaultSort: {
            key: 'price',
            direction: 'asc'
        }
    }
});
```

## Configuration

### Sort Options

```javascript
{
    enabled: boolean;           // Enable sorting
    buttonSelector: string;     // Sort button selector
    activeClass: string;        // Active button class
    defaultSort?: {            // Default sort configuration
        key: string;
        direction: 'asc' | 'desc';
    };
    sortTypes?: {             // Custom sort type definitions
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
    return a.localeCompare(b);
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
afs.on('sortApplied', (data) => {
    console.log('Sort key:', data.key);
    console.log('Direction:', data.direction);
});

// Multiple sort applied
afs.on('multiSortApplied', (data) => {
    console.log('Sort criteria:', data.criteria);
});

// Custom sort applied
afs.on('customSortApplied', (data) => {
    console.log('Custom sort by:', data.key);
});

// Items shuffled
afs.on('itemsShuffled', () => {
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

## Best Practices

1. **Sort Configuration**
   - Set appropriate default sort
   - Define custom sort types when needed
   - Use consistent sort directions

2. **User Experience**
   - Provide clear sort indicators
   - Show current sort state
   - Allow easy sort direction toggle

3. **Performance**
   - Use efficient sort algorithms
   - Cache sort results when possible
   - Limit number of sort criteria

4. **Accessibility**
   - Use semantic HTML for sort buttons
   - Include proper ARIA attributes
   - Ensure keyboard navigation works correctly

5. **Error Handling**
   - Handle invalid sort keys gracefully
   - Provide fallback for unsupported data types
   - Validate sort criteria before applying
