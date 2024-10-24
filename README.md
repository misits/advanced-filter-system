# Advanced Filter System

A powerful and flexible JavaScript library for filtering DOM elements with comprehensive search, sorting, and filtering capabilities.

## Features

### Core Filtering

- 🔍 Multiple filter types (category, price, status, etc.)
- 🔀 Flexible filter modes (AND/OR logic)
- 👥 Filter groups with independent logic
- 📊 Multi-criteria sorting
- 🔎 Text search with debouncing
- 📱 Responsive design support
- ✨ Smooth animations and transitions
- 🔢 Results counter
- 🔗 URL state management

### Advanced Features

- 📑 Pagination support
- 📊 Range-based filtering
- 💾 Filter presets (save/load)
- 📈 Analytics integration
- ⌨️ Keyboard navigation
- 🔄 Custom sort comparators
- 🎯 Event system
- 📱 Responsive breakpoints
- 🔍 Multiple search keys
- 🎨 Customizable animations

## Installation

### Via npm

```bash
npm install advanced-filter-system
```

### Via yarn

```bash
yarn add advanced-filter-system
```

### Direct Download

Download `src/AFS.js` from this repository and include it in your project.

## Usage Guide

### Basic Setup

```html
<div class="filter-container">
    <!-- Filter buttons -->
    <div class="filters">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:web">Web</button>
        <button class="btn-filter" data-filter="category:design">Design</button>
    </div>

    <!-- Optional components -->
    <input type="text" class="filter-search" placeholder="Search...">
    <div class="filter-counter"></div>

    <!-- Filterable items -->
    <div class="items">
        <div class="filter-item" 
             data-categories="category:web" 
             data-title="Project 1"
             data-price="599"
             data-year="2023">
            <!-- Content -->
        </div>
    </div>
</div>
```

### Basic JavaScript Initialization

```javascript
import { AFS } from 'advanced-filter-system';

const filter = new AFS({
    containerSelector: '.filter-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter'
});
```

## Feature Documentation

### 1. Filter Modes

```javascript
// Set filter logic mode
filter.setFilterMode('AND'); // Items must match all selected filters
filter.setFilterMode('OR');  // Items must match any selected filter

// Alternative method
filter.setLogic('AND');
filter.setLogic(true); // true = AND, false = OR
```

### 2. Filter Groups

Groups allow complex filtering logic with independent AND/OR operations.

```javascript
// Add filter groups
filter.addFilterGroup('categories', ['category:tech', 'category:web'], 'OR');
filter.addFilterGroup('price', ['price:low', 'price:medium'], 'AND');

// Set how groups combine
filter.setGroupMode('AND'); // Items must match all groups
filter.setGroupMode('OR');  // Items must match any group

// Remove groups
filter.removeFilterGroup('price');
```

### 3. Search Functionality

```javascript
// Configure search
const filter = new AFS({
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description'], // Data attributes to search in
    debounceTime: 300 // Milliseconds
});

// Programmatic search
filter.search('query');
```

### 4. Sorting

```javascript
// Multi-criteria sorting
filter.sortMultiple([
    { key: 'year', direction: 'desc' },
    { key: 'title', direction: 'asc' }
]);

// Custom comparator
filter.sortWithComparator('price', (a, b) => parseFloat(a) - parseFloat(b));
```

### 5. Range Filtering

```javascript
// Filter by numeric range
filter.addRangeFilter('price', 100, 500);
```

### 6. Pagination

```javascript
// Enable pagination
filter.setPagination(12); // 12 items per page
```

### 7. State Management

```javascript
// URL State
// Automatically managed, creates URLs like:
// ?category=web,design&price=low,medium&search=project

// Export/Import State
const state = filter.exportState();
filter.importState(state);

// Presets
filter.savePreset('myFilters');
filter.loadPreset('myFilters');
```

### 8. Analytics

```javascript
filter.enableAnalytics((data) => {
    console.log('Filter event:', data);
    // { type: 'filter', filters: [...], visibleItems: 10, timestamp: '...' }
});
```

### 9. Responsive Design

```javascript
filter.setResponsiveOptions({
    '768': {
        animationDuration: 200,
        itemsPerPage: 8
    },
    '480': {
        animationDuration: 0,
        itemsPerPage: 4
    }
});
```

### 10. Animation Configuration

```javascript
filter.setAnimationOptions({
    duration: 300,
    type: 'ease-out'
});
```

### 11. Event System

```javascript
filter.on('filter', (data) => {
    console.log('Filter changed:', data);
});
```

### 12. Keyboard Navigation

```javascript
filter.enableKeyboardNavigation();
```

## Browser Compatibility

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ IE11 (with polyfills)

## Full Configuration Options

```javascript
const filter = new AFS({
    // Required
    containerSelector: '.filter-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    
    // Optional (with defaults)
    searchInputSelector: '.filter-search',
    counterSelector: '.filter-counter',
    activeClass: 'active',
    hiddenClass: 'hidden',
    animationDuration: 300,
    filterMode: 'OR',
    searchKeys: ['title'],
    debounceTime: 300
});
```

## API Methods Reference

### Filter Management

- `addFilter(type, value)`
- `removeFilter(type, value)`
- `getActiveFiltersByType(type)`
- `setFilterMode(mode)`
- `resetFilters()`

### Filter Groups

- `addFilterGroup(groupId, filters, operator)`
- `removeFilterGroup(groupId)`
- `setGroupMode(mode)`

### Search and Sort

- `search(query)`
- `sortMultiple(criteria)`
- `sortWithComparator(key, comparator)`
- `addRangeFilter(key, min, max)`

### State Management

- `exportState()`
- `importState(state)`
- `savePreset(presetName)`
- `loadPreset(presetName)`

### UI and Display

- `setPagination(itemsPerPage)`
- `setAnimationOptions(options)`
- `setResponsiveOptions(breakpoints)`
- `enableKeyboardNavigation()`

### Events and Analytics

- `on(eventName, callback)`
- `enableAnalytics(callback)`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this in your projects!
