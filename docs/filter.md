# Filter System Documentation

## Overview

The Filter System is a core component of AFS that provides flexible and powerful filtering capabilities for DOM elements. It supports multiple filter types, advanced filter logic modes, per-type logic configuration, filter groups, and multiple categories per item.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Filter Logic Modes](#filter-logic-modes)
- [Per-Type Logic Configuration](#per-type-logic-configuration)
- [Filter Types & UI Components](#filter-types--ui-components)
- [Multiple Categories](#multiple-categories)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize with new filter logic
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    
    // NEW: Advanced filter logic modes
    filterCategoryMode: 'mixed', // 'mixed', 'OR', 'AND'
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },  // Multi-select OR
        brand: 'OR',                            // Toggle mode
        price: 'AND'                            // Multi-select AND
    }
});

// Access filter
const filter = afs.filter;
```

## Basic Usage

### HTML Structure

```html
<!-- Filter Buttons -->
<button class="btn-filter" data-filter="*">All</button>
<button class="btn-filter" data-filter="category:tech">Technology</button>
<button class="btn-filter" data-filter="category:design">Design</button>
<button class="btn-filter" data-filter="brand:apple">Apple</button>

<!-- Category-specific clear buttons -->
<button class="btn-filter" data-filter="category:*">Clear Categories</button>
<button class="btn-filter" data-filter="brand:*">Clear Brands</button>

<!-- Filterable Items -->
<div class="filter-item" data-categories="category:tech brand:apple">MacBook Pro</div>
<div class="filter-item" data-categories="category:design brand:adobe">Adobe Creative Suite</div>
```

### JavaScript Implementation

```javascript
// Initialize with advanced filter logic
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    
    // Mixed mode: OR within categories, AND between categories
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },
        brand: { mode: 'OR', multi: true },
        features: 'OR'  // Simple format for toggle mode
    }
});

// Manual filter control
afs.filter.addFilter('category:tech');
afs.filter.removeFilter('category:design');
afs.filter.clearAllFilters();
```

## Filter Logic Modes

### Mixed Mode (Recommended)

The most intuitive filtering experience - OR logic within filter categories, AND logic between different categories.

```javascript
const afs = new AFS({
    filterCategoryMode: 'mixed'
});

// User selects: Tech OR Design AND Apple OR Samsung
// Result: Items that are (Tech OR Design) AND (Apple OR Samsung)
```

### Legacy OR Mode

All filters use OR logic (shows items that match any filter).

```javascript
const afs = new AFS({
    filterCategoryMode: 'OR'
});

// User selects: Tech, Design, Apple
// Result: Items that are Tech OR Design OR Apple
```

### Legacy AND Mode

All filters use AND logic (shows items that match all filters).

```javascript
const afs = new AFS({
    filterCategoryMode: 'AND'
});

// User selects: Tech, Premium, Apple
// Result: Items that are Tech AND Premium AND Apple
```

## Per-Type Logic Configuration

Configure each filter type independently for maximum flexibility.

### Extended Configuration Format

```javascript
const afs = new AFS({
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },   // Multi-select with OR logic
        brand: { mode: 'OR', multi: false },     // Toggle mode (exclusive)
        price: { mode: 'AND', multi: true },     // Multi-select with AND logic
        features: 'OR'                           // Simple format (toggle mode)
    }
});
```

### Configuration Options

- **mode**: `'OR'` or `'AND'` - Logic mode for multiple selections
- **multi**: `true` or `false` - Allow multiple active selections
- **Simple format**: Just specify `'OR'` or `'AND'` for toggle mode (multi: false)

### Runtime Configuration

```javascript
// Update single filter type
afs.filter.setFilterTypeLogic('brand', { mode: 'OR', multi: true });

// Update multiple filter types
afs.filter.setFilterTypeLogic({
    category: 'AND',
    brand: { mode: 'OR', multi: true },
    features: { mode: 'OR', multi: false }
});
```

## Filter Types & UI Components

### Button Filters

```html
<!-- Toggle mode (exclusive selection) -->
<button class="btn-filter" data-filter="category:tech">Technology</button>
<button class="btn-filter" data-filter="category:design">Design</button>

<!-- Multi-select mode (multiple active) -->
<button class="btn-filter" data-filter="brand:apple">Apple</button>
<button class="btn-filter" data-filter="brand:samsung">Samsung</button>
<button class="btn-filter" data-filter="brand:google">Google</button>
```

### Checkbox Filters

```html
<label>
    <input type="checkbox" class="btn-filter" data-filter="category:tech"> 
    Technology
</label>
<label>
    <input type="checkbox" class="btn-filter" data-filter="category:design"> 
    Design
</label>
```

### Radio Button Filters

```html
<label>
    <input type="radio" name="category" class="btn-filter" data-filter="*" checked> 
    All Categories
</label>
<label>
    <input type="radio" name="category" class="btn-filter" data-filter="category:tech"> 
    Technology
</label>
<label>
    <input type="radio" name="category" class="btn-filter" data-filter="category:design"> 
    Design
</label>
```

### Select Dropdown Filters

```html
<select class="afs-filter-dropdown">
    <option value="*">All Categories</option>
    <option value="category:tech">Technology</option>
    <option value="category:design">Design</option>
    <option value="category:business">Business</option>
</select>
```

## Multiple Categories

The filter system supports multiple categories per item using space-separated values in the `data-categories` attribute.

### HTML Examples

```html
<!-- Single category -->
<div class="filter-item" data-categories="category:tech">
    Item content
</div>

<!-- Multiple categories -->
<div class="filter-item" data-categories="category:tech category:premium">
    Item content
</div>

<!-- Multiple filter types -->
<div class="filter-item" data-categories="category:tech brand:apple features:premium">
    MacBook Pro
</div>

<!-- Complex combinations -->
<div class="filter-item" data-categories="category:design brand:adobe features:creative features:professional">
    Adobe Creative Suite
</div>
```

### Category-Specific Clearing

```html
<!-- Clear all filters -->
<button class="btn-filter" data-filter="*">Show All</button>

<!-- Clear specific filter types -->
<button class="btn-filter" data-filter="category:*">Clear Categories</button>
<button class="btn-filter" data-filter="brand:*">Clear Brands</button>
<button class="btn-filter" data-filter="features:*">Clear Features</button>
```

## API Reference

### Core Methods

#### `setFilterTypeLogic(typeOrConfig, logic)`

Configure filter logic for specific types.

```javascript
// Set single type (extended format)
afs.filter.setFilterTypeLogic('brand', { mode: 'OR', multi: true });

// Set single type (simple format)  
afs.filter.setFilterTypeLogic('brand', 'AND');

// Set multiple types
afs.filter.setFilterTypeLogic({
    category: { mode: 'OR', multi: true },
    brand: 'OR',
    price: 'AND'
});
```

#### `addFilter(filter: string): void`

Add a new filter to the active filters.

```javascript
afs.filter.addFilter('category:tech');
afs.filter.addFilter('brand:apple');
```

#### `removeFilter(filter: string): void`

Remove a filter from the active filters.

```javascript
afs.filter.removeFilter('category:tech');
```

#### `clearAllFilters(): void`

Clear all active filters and reset to default state.

```javascript
afs.filter.clearAllFilters();
```

#### `getActiveFilters(): Set<string>`

Get the current active filters.

```javascript
const activeFilters = afs.filter.getActiveFilters();
console.log(Array.from(activeFilters));
```

### Legacy Methods (Backward Compatibility)

#### `setMode(mode: 'AND' | 'OR'): void`

Set the global filter logic mode (legacy).

```javascript
afs.filter.setMode('AND');
```

### Properties

```javascript
interface FilterState {
    activeFilters: Set<string>;
    currentFilters: Set<string>;
    filterGroups: Map<string, FilterGroup>;
    exclusiveFilterTypes: Set<string>;
}
```

## Events

```javascript
// Filter applied
afs.on('filtersApplied', (data) => {
    console.log('Active filters:', data.activeFilters);
    console.log('Visible items:', data.visible);
    console.log('Total items:', data.total);
});

// Filter type logic changed
afs.on('filterChanged', (data) => {
    console.log('Type:', data.type);
    console.log('Logic:', data.logic);
});

// Filters cleared
afs.on('filtersCleared', () => {
    console.log('All filters cleared');
});

// Filter added
afs.on('filterToggled', (data) => {
    console.log('Filter added:', data.filter);
});

// Filter removed  
afs.on('filterRemoved', (data) => {
    console.log('Filter removed:', data.filter);
});
```

## Examples

### Basic Mixed Mode Filtering

```javascript
const afs = new AFS({
    containerSelector: '.items',
    itemSelector: '.item',
    filterButtonSelector: '.btn-filter',
    
    // Mixed mode with multi-select
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },
        brand: { mode: 'OR', multi: true },
        features: 'OR'
    }
});

// Listen for filter changes
afs.on('filtersApplied', (data) => {
    updateCounter(data.visible, data.total);
});
```

### Advanced Per-Type Logic

```javascript
const afs = new AFS({
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        // Multi-select categories (show items with any selected category)
        category: { mode: 'OR', multi: true },
        
        // Toggle brands (only one brand at a time)
        brand: { mode: 'OR', multi: false },
        
        // Multi-select features with AND logic (must have all selected features)
        features: { mode: 'AND', multi: true },
        
        // Simple format for price (toggle mode)
        price: 'OR'
    }
});

// Change logic at runtime
afs.filter.setFilterTypeLogic('brand', { mode: 'OR', multi: true });
```

### Dynamic Filter Management

```javascript
// Add filters programmatically
afs.filter.addFilter('category:tech');
afs.filter.addFilter('brand:apple');

// Check active filters
const active = afs.filter.getActiveFilters();
console.log('Active filters:', Array.from(active));

// Clear specific category
document.querySelector('[data-filter="category:*"]').click();

// Clear all filters
afs.filter.clearAllFilters();
```

### Complex Category Combinations

```html
<!-- Items with multiple categories and filter types -->
<div class="filter-item" 
     data-categories="category:tech category:premium brand:apple features:professional features:portable">
    MacBook Pro 16"
</div>

<div class="filter-item"
     data-categories="category:design brand:adobe features:creative features:professional">
    Adobe Creative Cloud
</div>

<div class="filter-item"
     data-categories="category:tech category:gaming brand:nvidia features:powerful features:rgb">
    Gaming Graphics Card
</div>
```

## Best Practices

### 1. Filter Logic Configuration

- **Use Mixed Mode**: Provides the most intuitive user experience
- **Configure Per-Type Logic**: Tailor behavior for different filter types
- **Use Multi-Select for Categories**: Allow users to see multiple categories simultaneously
- **Use Toggle for Exclusive Options**: Single selection for mutually exclusive filters

### 2. Category Naming Conventions

```html
<!-- Good: Consistent prefixes -->
<div data-categories="category:tech brand:apple features:premium price:high"></div>

<!-- Bad: Inconsistent naming -->
<div data-categories="tech apple-brand premium expensive"></div>
```

### 3. Filter Button Organization

```html
<!-- Group related filters visually -->
<div class="filter-group">
    <h4>Categories</h4>
    <button class="btn-filter" data-filter="category:tech">Technology</button>
    <button class="btn-filter" data-filter="category:design">Design</button>
</div>

<div class="filter-group">
    <h4>Brands</h4>
    <button class="btn-filter" data-filter="brand:apple">Apple</button>
    <button class="btn-filter" data-filter="brand:google">Google</button>
</div>
```

### 4. Performance Optimization

- **Limit Active Filters**: Too many active filters can impact performance
- **Use Category-Specific Clearing**: Provide easy ways to clear filter types
- **Debounce Filter Changes**: Especially important for programmatic filtering
- **Monitor Filter Events**: Use events to update UI and track usage

### 5. Accessibility

- **Semantic HTML**: Use appropriate form elements for different filter types
- **ARIA Labels**: Provide clear labels for screen readers
- **Keyboard Navigation**: Ensure all filters are keyboard accessible
- **Visual Feedback**: Clearly show active/inactive states

### 6. State Management

```javascript
// Save filter state
const state = afs.getState();
localStorage.setItem('filterState', JSON.stringify(state));

// Restore filter state
const savedState = JSON.parse(localStorage.getItem('filterState'));
afs.setState(savedState);

// URL state persistence
const afs = new AFS({
    preserveState: true,
    urlStateKey: 'filters'
});
```