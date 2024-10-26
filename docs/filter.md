# Filter System Documentation

## Overview

The Filter System is a core component of AFS that provides flexible and powerful filtering capabilities for DOM elements. It supports both single and multiple filter criteria, different filter modes (AND/OR), and filter groups.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Filter Modes](#filter-modes)
- [Filter Groups](#filter-groups)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { Filter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    filterButtonSelector: '.btn-filter',
    filterMode: 'OR'
});

// Standalone usage
const filter = new Filter(afs);
```

## Basic Usage

### HTML Structure

```html
<!-- Filter Buttons -->
<button class="btn-filter" data-filter="category1">Category 1</button>
<button class="btn-filter" data-filter="category2">Category 2</button>

<!-- Filterable Items -->
<div class="filter-item" data-categories="category1">Item 1</div>
<div class="filter-item" data-categories="category1,category2">Item 2</div>
```

### JavaScript Implementation

```javascript
// Initialize with options
const afs = createAFS({
    filterButtonSelector: '.btn-filter',
    filterMode: 'OR',
    activeClass: 'active',
    hiddenClass: 'hidden'
});

// Manual filter control
afs.filter.addFilter('category1');
afs.filter.removeFilter('category2');
afs.filter.clearAllFilters();
```

## Filter Modes

### OR Mode (Default)

Items match if they have any of the active filters.

```javascript
afs.filter.setFilterMode('OR');
// or
afs.filter.setLogic(false);
```

### AND Mode

Items must match all active filters.

```javascript
afs.filter.setFilterMode('AND');
// or
afs.filter.setLogic(true);
```

## Filter Groups

Groups allow logical grouping of filters with their own operators.

```javascript
// Add filter group
afs.filter.addFilterGroup('colors', {
    filters: ['red', 'blue'],
    operator: 'OR'
});

afs.filter.addFilterGroup('sizes', {
    filters: ['small', 'medium'],
    operator: 'AND'
});

// Set how groups interact
afs.filter.setGroupMode('AND');

// Remove group
afs.filter.removeFilterGroup('colors');
```

## API Reference

### Methods

#### `addFilter(filter: string): void`

Add a new filter to the active filters.

```javascript
afs.filter.addFilter('category1');
```

#### `removeFilter(filter: string): void`

Remove a filter from the active filters.

```javascript
afs.filter.removeFilter('category1');
```

#### `clearAllFilters(): void`

Clear all active filters and reset to default state.

```javascript
afs.filter.clearAllFilters();
```

#### `setFilterMode(mode: 'AND' | 'OR'): void`

Set the filter logic mode.

```javascript
afs.filter.setFilterMode('AND');
```

#### `addFilterGroup(id: string, options: FilterGroupOptions): void`

Add a new filter group.

```javascript
afs.filter.addFilterGroup('prices', {
    filters: ['0-100', '101-500'],
    operator: 'OR'
});
```

#### `getActiveFilters(): Set<string>`

Get the current active filters.

```javascript
const activeFilters = afs.filter.getActiveFilters();
```

### Properties

- `activeFilters: Set<string>` - Currently active filters
- `filterGroups: Map<string, FilterGroup>` - Active filter groups
- `filterMode: 'AND' | 'OR'` - Current filter mode
- `groupMode: 'AND' | 'OR'` - Current group mode

## Events

```javascript
// Filter toggled
afs.on('filterToggled', (data) => {
    console.log('Filter:', data.filter);
    console.log('Active filters:', data.activeFilters);
});

// Filters applied
afs.on('filter', (data) => {
    console.log('Visible items:', data.visibleItems);
    console.log('Hidden items:', data.hiddenItems);
});

// Filters cleared
afs.on('filtersCleared', () => {
    console.log('All filters cleared');
});
```

## Examples

### Basic Filtering

```javascript
// Initialize
const afs = createAFS({
    filterButtonSelector: '.btn-filter'
});

// Add event listeners
afs.on('filter', (data) => {
    updateUI(data.visibleItems);
});

// Add filters programmatically
afs.filter.addFilter('category1');
afs.filter.addFilter('category2');
```

### Complex Filtering with Groups

```javascript
// Create price ranges
afs.filter.addFilterGroup('price', {
    filters: ['0-100', '101-500', '501-1000'],
    operator: 'OR'
});

// Create category filters
afs.filter.addFilterGroup('categories', {
    filters: ['electronics', 'books'],
    operator: 'AND'
});

// Set group interaction
afs.filter.setGroupMode('AND');
```

### Dynamic Filter Buttons

```javascript
// Add filter button dynamically
const button = document.createElement('button');
button.className = 'btn-filter';
button.dataset.filter = 'newCategory';
afs.filter.addFilterButton(button);

// Remove filter button
afs.filter.removeFilterButton(button);
```

## TypeScript

```typescript
interface FilterOptions {
    mode: 'AND' | 'OR';
    activeClass: string;
    hiddenClass: string;
}

interface FilterGroupOptions {
    filters: string[];
    operator: 'AND' | 'OR';
}

interface FilterEvent {
    filter: string;
    activeFilters: string[];
    visibleItems: number;
    hiddenItems: number;
}
```

## Best Practices

1. **Performance**

   ```javascript
   // Use filter groups for better organization
   afs.filter.addFilterGroup('price', {
       filters: ['0-100', '101-500'],
       operator: 'OR'
   });
   ```

2. **Error Handling**

   ```javascript
   try {
       afs.filter.addFilter('category1');
   } catch (error) {
       console.error('Filter error:', error);
       // Handle error appropriately
   }
   ```

3. **State Management**

   ```javascript
   // Save filter state
   const state = {
       activeFilters: Array.from(afs.filter.getActiveFilters()),
       groups: Array.from(afs.filter.getFilterGroups())
   };
   
   // Restore filter state
   state.activeFilters.forEach(filter => {
       afs.filter.addFilter(filter);
   });
   ```

4. **URL Integration**

   ```javascript
   // Update URL when filters change
   afs.on('filter', () => {
       afs.urlManager.updateURL();
   });
   ```
