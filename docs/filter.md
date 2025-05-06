# Filter System Documentation

## Overview

The Filter System is a core component of AFS that provides flexible and powerful filtering capabilities for DOM elements. It supports multiple filter types, different filter modes (AND/OR), filter groups, and multiple categories per item.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Filter Modes](#filter-modes)
- [Filter Groups](#filter-groups)
- [Multiple Categories](#multiple-categories)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { Filter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    filter: {
        enabled: true,
        buttonSelector: '.afs-btn-filter',
        mode: 'OR',
        activeClass: 'afs-active',
        hiddenClass: 'afs-hidden'
    }
});

// Access filter
const filter = afs.filter;
```

## Basic Usage

### HTML Structure

```html
<!-- Filter Buttons -->
<button class="afs-btn-filter" data-filter="category:category1">Category 1</button>
<button class="afs-btn-filter" data-filter="category:category2">Category 2</button>

<!-- Filterable Items -->
<div class="afs-filter-item" data-categories="category:category1">Item 1</div>
<div class="afs-filter-item" data-categories="category:category1 category:category2">Item 2</div>
```

### JavaScript Implementation

```javascript
// Initialize with options
const afs = createAFS({
    filter: {
        enabled: true,
        buttonSelector: '.afs-btn-filter',
        mode: 'OR',
        activeClass: 'afs-active',
        hiddenClass: 'afs-hidden'
    }
});

// Manual filter control
afs.filter.addFilter('category:category1');
afs.filter.removeFilter('category:category2');
afs.filter.clearAllFilters();
```

## Filter Modes

### OR Mode (Default)

Items match if they have any of the active filters.

```javascript
afs.filter.setMode('OR');
```

### AND Mode

Items must match all active filters.

```javascript
afs.filter.setMode('AND');
```

## Filter Groups

Groups allow logical grouping of filters with their own operators.

```javascript
// Create filter group
afs.filter.createGroup('group1', {
    filters: ['category:category1', 'category:category2'],
    operator: 'OR'
});

// Set group mode
afs.filter.setGroupMode('AND'); // or 'OR'

// Remove group
afs.filter.removeGroup('group1');
```

## Multiple Categories

The filter system supports multiple categories per item using space-separated values in the `data-categories` attribute.

### HTML Examples

```html
<!-- Single category -->
<div class="afs-filter-item" data-categories="category:category1">
    Item content
</div>

<!-- Multiple categories -->
<div class="afs-filter-item" data-categories="category:category1 category:category2 category:category3">
    Item content
</div>

<!-- Multiple filter types -->
<div class="afs-filter-item" data-categories="category:category1 month:january season:2024">
    Item content
</div>
```

### JavaScript Examples

```javascript
// Add multiple filters
afs.filter.addFilter('category:category1');
afs.filter.addFilter('category:category2');

// Filter by multiple types
afs.filter.addFilter('category:category1');
afs.filter.addFilter('month:january');
afs.filter.addFilter('season:2024');
```

## API Reference

### Methods

#### `addFilter(filter: string): void`

Add a new filter to the active filters.

```javascript
afs.filter.addFilter('category:category1');
```

#### `removeFilter(filter: string): void`

Remove a filter from the active filters.

```javascript
afs.filter.removeFilter('category:category1');
```

#### `clearAllFilters(): void`

Clear all active filters and reset to default state.

```javascript
afs.filter.clearAllFilters();
```

#### `setMode(mode: 'AND' | 'OR'): void`

Set the filter logic mode.

```javascript
afs.filter.setMode('AND');
```

#### `createGroup(id: string, options: FilterGroupOptions): void`

Create a new filter group.

```javascript
afs.filter.createGroup('prices', {
    filters: ['category:low', 'category:medium', 'category:high'],
    operator: 'OR'
});
```

#### `getActiveFilters(): Set<string>`

Get the current active filters.

```javascript
const activeFilters = afs.filter.getActiveFilters();
```

### Properties

```javascript
interface FilterState {
    activeFilters: Set<string>;
    filterGroups: Map<string, FilterGroup>;
    mode: 'AND' | 'OR';
    groupMode: 'AND' | 'OR';
}
```

## Events

```javascript
// Filter applied
afs.on('filterApplied', (data) => {
    console.log('Filter:', data.filter);
    console.log('Active filters:', data.activeFilters);
    console.log('Visible items:', data.visibleItems);
    console.log('Hidden items:', data.hiddenItems);
});

// Filter group created
afs.on('filterGroupCreated', (data) => {
    console.log('Group created:', data.groupId);
    console.log('Filters:', data.filters);
});

// Filter group removed
afs.on('filterGroupRemoved', (data) => {
    console.log('Group removed:', data.groupId);
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
    filter: {
        enabled: true,
        buttonSelector: '.afs-btn-filter',
        mode: 'OR',
        activeClass: 'afs-active',
        hiddenClass: 'afs-hidden'
    }
});

// Add event listeners
afs.on('filterApplied', (data) => {
    updateUI(data.visibleItems);
});

// Add filters programmatically
afs.filter.addFilter('category:category1');
afs.filter.addFilter('category:category2');
```

### Complex Filtering with Groups

```javascript
// Create category groups
afs.filter.createGroup('categories', {
    filters: ['category:electronics', 'category:books'],
    operator: 'OR'
});

// Create price groups
afs.filter.createGroup('prices', {
    filters: ['category:low', 'category:medium', 'category:high'],
    operator: 'OR'
});

// Set group interaction
afs.filter.setGroupMode('AND');
```

### Dynamic Filter Buttons

```javascript
// Add filter button dynamically
const button = document.createElement('button');
button.className = 'afs-btn-filter';
button.dataset.filter = 'category:newCategory';
afs.filter.addFilterButton(button);

// Remove filter button
afs.filter.removeFilterButton(button);
```

## Best Practices

1. **Category Naming**
   - Use consistent category prefixes (e.g., `category:`, `month:`, `season:`)
   - Keep category names simple and descriptive
   - Use lowercase for category names

2. **Multiple Categories**
   - Use space-separated values in `data-categories`
   - Group related categories together
   - Consider using filter groups for complex category relationships

3. **Performance**
   - Limit the number of active filters
   - Use filter groups for complex filtering logic
   - Consider using AND mode for more precise filtering

4. **Accessibility**
   - Use semantic HTML for filter buttons
   - Include proper ARIA attributes
   - Ensure keyboard navigation works correctly

5. **State Management**
   - Use URL state for shareable filters
   - Implement filter presets for common combinations
   - Provide clear feedback for active filters
