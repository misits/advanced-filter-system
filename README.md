# Advanced Filter System (AFS)

A powerful and flexible vanilla JavaScript filtering system that provides advanced filtering, searching, sorting, and pagination capabilities for DOM elements. Zero dependencies, lightweight, and highly customizable.

[Live Demo](https://misits.github.io/advanced-filter-system) | [NPM Package](https://www.npmjs.com/package/advanced-filter-system)

## Table of Contents

- [Advanced Filter System (AFS)](#advanced-filter-system-afs)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [HTML Structure](#html-structure)
    - [JavaScript Initialization](#javascript-initialization)
  - [Basic Usage](#basic-usage)
    - [Filtering](#filtering)
    - [Searching](#searching)
    - [Sorting](#sorting)
    - [Pagination](#pagination)
  - [Advanced Usage](#advanced-usage)
    - [Filter Groups](#filter-groups)
    - [Custom Sorting](#custom-sorting)
    - [URL State Management](#url-state-management)
  - [Components](#components)
    - [Filter System](#filter-system)
    - [Range Filter](#range-filter)
    - [Input Range Filter](#input-range-filter)
    - [Date Filter](#date-filter)
    - [Search System](#search-system)
    - [Sort System](#sort-system)
    - [Pagination System](#pagination-system)
    - [URL Manager](#url-manager)
  - [Styling \& Theming](#styling--theming)
    - [Built-in Themes](#built-in-themes)
    - [Custom Themes](#custom-themes)
    - [Animations](#animations)
  - [Browser Support](#browser-support)
  - [TypeScript Support](#typescript-support)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 🔍 **Advanced Filtering**
  - Multiple filter types (text, range, date)
  - AND/OR logic
  - Filter groups
  - Dynamic filters
- 🔎 **Smart Search**
  - Real-time search
  - Multiple fields
  - Highlight matches
  - Minimum character threshold
- ↕️ **Flexible Sorting**
  - Multi-column sort
  - Custom comparators
  - Auto-detect data types
- 📄 **Pagination**
  - Dynamic page size
  - Custom controls
  - Scroll to top
- 🔗 **URL Management**
  - State persistence
  - Browser history support
  - Shareable URLs
- ⚡ **Performance**
  - Debounced updates
  - Efficient DOM manipulation
  - Minimal reflows
- 🎨 **Rich Animation**
  - 15+ built-in animations
  - Custom transitions
  - Hardware acceleration
- 💾 **State Management**
  - Centralized state
  - Import/Export
  - Undo/Redo support
- 🎯 **Event System**
  - Rich event API
  - Custom events
  - Event debugging

## Installation

```bash
# NPM
npm install advanced-filter-system

# Yarn
yarn add advanced-filter-system

# PNPM
pnpm add advanced-filter-system
```

Or include via CDN:

```html
<script src="https://unpkg.com/advanced-filter-system@1.1.1/dist/afs.modern.js"></script>
```

## Quick Start

### HTML Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>AFS Demo</title>
</head>
<body>
    <!-- Counter -->
    <div class="filter-counter"></div>

    <!-- Search -->
    <input type="text" class="filter-search" placeholder="Search...">
    
    <!-- Filter Buttons -->
    <div class="filter-buttons">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:category1">Category 1</button>
        <button class="btn-filter" data-filter="category:category2">Category 2</button>
    </div>

    <!-- Sort Buttons -->
    <div class="sort-buttons">
        <button class="btn-sort" data-sort-key="price">
            Price <span class="sort-direction">↑</span>
        </button>
        <button class="btn-sort" data-sort-key="date">
            Date <span class="sort-direction">↑</span>
        </button>
    </div>

    <!-- Range Filter -->
    <div id="price-range"></div>

    <!-- Date Filter -->
    <div id="date-filter"></div>

    <!-- Items Container -->
    <div id="items-container">
        <div class="filter-item" 
             data-categories="category:category1" 
             data-price="99.99"
             data-date="2024-03-15"
             data-title="Item 1"
             data-description="Description for item 1">
            <h3>Item 1</h3>
            <p>$99.99</p>
            <p>March 15, 2024</p>
        </div>
        <!-- More items... -->
    </div>

    <!-- Pagination -->
    <div class="pagination-container"></div>

    <!-- Scripts -->
    <script src="https://unpkg.com/advanced-filter-system@1.1.1/dist/afs.modern.js"></script>
    <script>
        const afs = AFS.createAFS({
            containerSelector: '#items-container',
            itemSelector: '.filter-item',
            searchInputSelector: '.filter-search',
            filterButtonSelector: '.btn-filter',
            sortButtonSelector: '.btn-sort',
            counterSelector: '.filter-counter',
            debug: true,
            responsive: true,
            preserveState: true,
            animation: {
                type: 'fade',
                duration: 300
            },
            pagination: {
                enabled: true,
                itemsPerPage: 10
            }
        });

        // Add range filter
        afs.rangeFilter.addRangeSlider({
            key: 'price',
            container: document.querySelector('#price-range'),
            min: 0,
            max: 1000,
            step: 10
        });

        // Add date filter
        afs.dateFilter.addDateRange({
            key: 'date',
            container: document.querySelector('#date-filter')
        });
    </script>
</body>
</html>
```

### JavaScript Initialization

Using ES modules:

```javascript
import { createAFS } from 'advanced-filter-system';

const afs = createAFS({
    containerSelector: '#items-container',
    itemSelector: '.filter-item',
    debug: true,
    animation: {
        type: 'fade',
        duration: 300
    }
});
```

## Basic Usage

### Filtering

```javascript
// HTML
<button class="btn-filter" data-filter="category:category1">Category 1</button>
<button class="btn-filter" data-filter="category:category2">Category 2</button>

<div class="filter-item" data-categories="category:category1 category:category2">
    Item content
</div>

// JavaScript
// Set filter mode
afs.filter.setFilterMode('AND'); // or 'OR'

// Add filter programmatically
afs.filter.addFilter('category1');

// Remove filter
afs.filter.removeFilter('category1');

// Clear all filters
afs.filter.clearAllFilters();
```

### Searching

```javascript
// HTML
<input type="text" class="filter-search">
<div class="filter-item" 
     data-title="Product Name" 
     data-description="Product description">
    Item content
</div>

// JavaScript
// Configure search
afs.search.updateConfig({
    searchKeys: ['title', 'description'],
    minSearchLength: 2,
    highlightMatches: true,
    debounceTime: 300
});

// Perform search programmatically
afs.search.search('query');

// Clear search
afs.search.clearSearch();
```

### Sorting

```javascript
// HTML
<button class="btn-sort" data-filter="price">Sort by Price</button>
<button class="btn-sort" data-filter="date">Sort by Date</button>

<div class="filter-item" data-price="99.99" data-date="2024-03-15">
    Item content
</div>

// JavaScript
// Basic sort
afs.sort.sort('price', 'asc');

// Multiple criteria sort
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' }
]);

// Reset sort
afs.sort.reset();
```

### Pagination

```javascript
// HTML
<div class="pagination-container"></div>

// JavaScript
// Configure pagination
const afs = createAFS({
    pagination: {
        enabled: true,
        itemsPerPage: 10,
        maxButtons: 7,
        showPrevNext: true,
        scrollToTop: true
    }
});

// Navigate pages
afs.pagination.goToPage(2);

// Change items per page
afs.pagination.setItemsPerPage(20);

// Get pagination info
const info = afs.pagination.getPageInfo();
```

## Advanced Usage

### Filter Groups

```javascript
// Create filter groups with different operators
afs.filter.addFilterGroup('price', {
    ranges: [[0, 100], [101, 500], [501, 1000]],
    operator: 'OR'
});

afs.filter.addFilterGroup('categories', {
    filters: ['electronics', 'books'],
    operator: 'AND'
});

// Set group mode
afs.filter.setGroupMode('AND');

// Remove group
afs.filter.removeFilterGroup('price');
```

### Custom Sorting

```javascript
// Custom comparator for special sorting needs
afs.sort.sortWithComparator('title', (a, b) => {
    // Sort by last word
    const getLastWord = str => str.split(' ').pop();
    const lastA = getLastWord(a);
    const lastB = getLastWord(b);
    return lastA.localeCompare(lastB);
});

// Sort with multiple languages
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b, 'es', { 
        sensitivity: 'base',
        numeric: true
    });
});
```

### URL State Management

```javascript
// Enable URL state
const afs = createAFS({
    urlStateEnabled: true,
    urlStateKey: 'filter'
});

// Handle state changes
afs.on('urlStateLoaded', (state) => {
    console.log('State loaded:', state);
});

// Manual control
afs.urlManager.updateURL();
afs.urlManager.loadFromURL();
afs.urlManager.clearURL();

// Get specific parameter
const searchQuery = afs.urlManager.getParam('search');
```

## Components

Each component can be used independently or as part of the AFS system.

### Filter System

See [Filter Documentation](docs/filter.md)

### Range Filter

See [Range Filter Documentation](docs/range-filter.md)

### Input Range Filter

See [Input Range Filter Documentation](docs/input-range-filter.md)

### Date Filter

See [Date Filter Documentation](docs/date-filter.md)

### Search System

See [Search Documentation](docs/search.md)

### Sort System

See [Sort Documentation](docs/sort.md)

### Pagination System

See [Pagination Documentation](docs/pagination.md)

### URL Manager

See [URL Manager Documentation](docs/url-manager.md)

## Styling & Theming

### Built-in Themes

```javascript
const afs = createAFS({
    styles: {
        colors: {
            primary: '#3b82f6',
            background: '#f3f4f6',
            text: '#1f2937'
        }
    }
});
```

### Custom Themes

```javascript
const afs = createAFS({
    styles: {
        colors: {
            primary: '#custom-color',
            background: '#custom-bg',
            text: '#custom-text'
        },
    }
});
```

### Animations

```javascript
const afs = createAFS({
    animation: {
        type: 'fade', // or 'slide', 'scale', etc.
        duration: 300,
        easing: 'ease-in-out'
    }
});
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Android Chrome (last 2 versions)

Required browser features:

- CSS Transitions
- Flexbox
- CSS Grid (optional)
- History API
- localStorage
- MutationObserver

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import { createAFS, AFSOptions } from 'advanced-filter-system';

const options: AFSOptions = {
    containerSelector: '#items-container',
    itemSelector: '.filter-item'
};

const afs = createAFS(options);
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

1. Setting up the development environment
2. Coding standards
3. Pull request process
4. Bug reporting
5. Feature requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ♥ by [misits](https://github.com/misits)
