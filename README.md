# Advanced Filter System (AFS)

A powerful and flexible vanilla JavaScript filtering system that provides advanced filtering, searching, sorting, and pagination capabilities for DOM elements. Zero dependencies, lightweight, and highly customizable.

[Live Demo](https://misits.github.io/advanced-filter-system) | [NPM Package](https://www.npmjs.com/package/advanced-filter-system) | [Interactive Examples](examples/demo.html)

## Table of Contents

- [Advanced Filter System (AFS)](#advanced-filter-system-afs)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [HTML Structure](#html-structure)
    - [JavaScript Initialization](#javascript-initialization)
  - [Filter Logic Modes](#filter-logic-modes)
    - [Mixed Mode (Recommended)](#mixed-mode-recommended)
    - [Per-Type Logic Configuration](#per-type-logic-configuration)
    - [Legacy Modes](#legacy-modes)
  - [Filter Types & UI Components](#filter-types--ui-components)
    - [Button Filters](#button-filters)
    - [Select Dropdowns](#select-dropdowns)
    - [Radio Buttons](#radio-buttons)
    - [Checkboxes](#checkboxes)
    - [Range Sliders](#range-sliders)
    - [Date Range Filters](#date-range-filters)
  - [Advanced Features](#advanced-features)
    - [Search & Filtering](#search--filtering)
    - [Sorting](#sorting)
    - [Pagination](#pagination)
    - [URL State Management](#url-state-management)
    - [Animations](#animations)
  - [Configuration Options](#configuration-options)
  - [API Reference](#api-reference)
  - [Examples](#examples)
  - [Browser Support](#browser-support)
  - [TypeScript Support](#typescript-support)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- 🎯 **Advanced Filter Logic**
  - Mixed mode (OR within categories, AND between)
  - Per-type logic configuration
  - Multi-select and toggle modes
  - Category-specific clearing
- 🔍 **Multiple Filter Types**
  - Button filters (toggle/multi-select)
  - Select dropdowns
  - Radio buttons (exclusive)
  - Checkboxes (multi-select)
  - Range sliders with histograms
  - Date range filters
- 🔎 **Smart Search**
  - Real-time fuzzy search
  - Multiple searchable fields
  - Configurable debouncing
  - Minimum character threshold
- ↕️ **Flexible Sorting**
  - Multi-column sorting
  - Custom sort functions
  - Auto-detect data types
  - Sort direction indicators
- 📄 **Advanced Pagination**
  - Dynamic page sizes
  - Smooth transitions
  - Scroll-to-top option
  - Custom pagination controls
- 🎨 **Rich Animations**
  - 14+ animation types (fade, slide, scale, flip, etc.)
  - Hardware-accelerated transitions
  - Customizable duration and easing
- 🔗 **State Management**
  - URL state persistence
  - Browser history support
  - Shareable filtered URLs
  - State import/export
- ⚡ **Performance Optimized**
  - Debounced updates
  - Efficient DOM manipulation
  - Minimal reflows and repaints
- 🎯 **Event System**
  - Comprehensive event API
  - Custom event support
  - Debug mode with logging

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
<script type="module">
    import { AFS } from 'https://unpkg.com/advanced-filter-system@latest/dist/afs.modern.js';
</script>
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
    <!-- Filter Controls -->
    <div class="filter-controls">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:tech">Technology</button>
        <button class="btn-filter" data-filter="category:design">Design</button>
    </div>
    
    <!-- Search Input -->
    <input type="text" class="filter-search" placeholder="Search...">
    
    <!-- Results Counter -->
    <div class="filter-counter"></div>
    
    <!-- Filterable Items -->
    <div class="items-container">
        <div class="filter-item" 
             data-categories="category:tech brand:apple" 
             data-title="MacBook Pro"
             data-price="2499"
             data-date="2024-03-15">
            <h3>MacBook Pro</h3>
            <p>$2,499</p>
        </div>
        <!-- More items... -->
    </div>
    
    <!-- Pagination Container -->
    <div class="afs-pagination-container"></div>
</body>
</html>
```

### JavaScript Initialization

```javascript
import { AFS } from 'advanced-filter-system';

const afs = new AFS({
    // Required selectors
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    searchInputSelector: '.filter-search',
    counterSelector: '.filter-counter',
    
    // Search configuration
    searchKeys: ['title', 'categories'],
    
    // NEW: Advanced filter logic
    filterCategoryMode: 'mixed', // OR within categories, AND between
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },  // Multi-select OR
        brand: 'OR',                            // Toggle mode
        price: 'AND'                            // Multi-select AND
    },
    
    // Pagination
    pagination: {
        enabled: true,
        itemsPerPage: 12
    },
    
    // Animations
    animation: {
        type: 'fade',
        duration: 300
    },
    
    // Debug mode
    debug: true
});
```

## Filter Logic Modes

### Mixed Mode (Recommended)

The most intuitive filtering experience - OR logic within filter categories, AND logic between different categories.

```javascript
const afs = new AFS({
    filterCategoryMode: 'mixed',
    // When user selects: Tech OR Design AND Apple OR Samsung
    // Shows: (Tech OR Design) AND (Apple OR Samsung)
});
```

### Per-Type Logic Configuration

Configure each filter type independently for maximum flexibility.

```javascript
const afs = new AFS({
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },  // Multi-select checkboxes
        brand: 'OR',                            // Toggle buttons (exclusive)
        price: 'AND',                           // Multi-select with AND logic
        features: { mode: 'OR', multi: true }   // Multi-select with OR logic
    }
});

// Update logic at runtime
afs.filter.setFilterTypeLogic('brand', { mode: 'OR', multi: true });
```

### Legacy Modes

```javascript
// Legacy OR mode (all filters use OR logic)
const afs = new AFS({ filterCategoryMode: 'OR' });

// Legacy AND mode (all filters use AND logic)
const afs = new AFS({ filterCategoryMode: 'AND' });
```

## Filter Types & UI Components

### Button Filters

```html
<!-- Toggle mode (exclusive) -->
<button class="btn-filter" data-filter="category:tech">Technology</button>

<!-- Multi-select mode -->
<button class="btn-filter" data-filter="brand:apple">Apple</button>
<button class="btn-filter" data-filter="brand:samsung">Samsung</button>

<!-- Clear specific category -->
<button class="btn-filter" data-filter="category:*">Clear Categories</button>
```

### Select Dropdowns

```html
<select class="afs-filter-dropdown">
    <option value="*">All Categories</option>
    <option value="category:tech">Technology</option>
    <option value="category:design">Design</option>
</select>
```

### Radio Buttons

```html
<label><input type="radio" name="category" class="btn-filter" data-filter="*" checked> All</label>
<label><input type="radio" name="category" class="btn-filter" data-filter="category:tech"> Tech</label>
<label><input type="radio" name="category" class="btn-filter" data-filter="category:design"> Design</label>
```

### Checkboxes

```html
<label><input type="checkbox" class="btn-filter" data-filter="category:tech"> Technology</label>
<label><input type="checkbox" class="btn-filter" data-filter="category:design"> Design</label>
```

### Range Sliders

```javascript
// Add price range slider with histogram
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: '.price-range-container',
    min: 0,
    max: 3000,
    step: 50,
    ui: {
        showHistogram: true,
        bins: 10
    }
});

// Add rating range slider
afs.rangeFilter.addRangeSlider({
    key: 'rating',
    type: 'number',
    container: '.rating-range-container',
    min: 4.0,
    max: 5.0,
    step: 0.1
});
```

### Date Range Filters

```javascript
// Add date range filter
afs.dateFilter.addDateRange({
    key: 'date',
    container: '.date-range-container',
    minDate: new Date('2024-01-01'),
    maxDate: new Date(),
    format: 'YYYY-MM-DD'
});
```

## Advanced Features

### Search & Filtering

```javascript
// Configure search
afs.search.configure({
    keys: ['title', 'description', 'categories'],
    fuzzy: true,
    minLength: 2,
    debounce: 300
});

// Programmatic filtering
afs.filter.addFilter('category:tech');
afs.filter.removeFilter('category:tech');
afs.filter.clearAllFilters();
```

### Sorting

```javascript
// Sort by single field
afs.filter.sortWithOrder('price', 'DESC');

// Custom sorting
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b, 'en', { numeric: true });
});

// Shuffle items
afs.filter.shuffle();
```

### Pagination

```javascript
// Configure pagination
afs.pagination.configure({
    itemsPerPage: 12,
    showControls: true,
    scrollToTop: true,
    scrollBehavior: 'smooth'
});

// Toggle pagination mode
afs.pagination.setPaginationMode(true); // Enable
afs.pagination.setPaginationMode(false); // Show all
```

### URL State Management

```javascript
// Enable URL state persistence
const afs = new AFS({
    preserveState: true,
    urlStateKey: 'filters' // Custom URL parameter name
});

// Manual state management
const state = afs.getState();
afs.setState(state);
```

### Animations

```javascript
const afs = new AFS({
    animation: {
        type: 'fade', // fade, slide, scale, flip, rotate, zoom, bounce, blur, etc.
        duration: 400,
        easing: 'ease-out'
    }
});

// Change animation at runtime
afs.filter.animation.setAnimation('slide');
```

## Configuration Options

```javascript
const afs = new AFS({
    // Required selectors
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    searchInputSelector: '.filter-search',
    counterSelector: '.filter-counter',
    
    // Filter logic (NEW!)
    filterCategoryMode: 'mixed', // 'mixed', 'OR', 'AND'
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },
        brand: 'OR',
        price: 'AND'
    },
    
    // Search configuration
    searchKeys: ['title', 'categories', 'description'],
    searchMode: 'fuzzy', // 'fuzzy' or 'exact'
    searchMinChars: 2,
    debounceTime: 300,
    
    // Pagination
    pagination: {
        enabled: true,
        itemsPerPage: 12,
        container: '.afs-pagination-container',
        showPrevNext: true,
        scrollToTop: true,
        scrollBehavior: 'smooth'
    },
    
    // Counter display
    counter: {
        template: 'Showing {visible} of {total} items',
        filteredTemplate: '({filtered} filtered)',
        noResultsTemplate: 'No items found'
    },
    
    // Animations
    animation: {
        type: 'fade',
        duration: 300,
        easing: 'ease-out'
    },
    
    // State management
    preserveState: true,
    urlStateKey: 'filters',
    
    // Styling
    styles: {
        colors: {
            primary: '#000',
            background: '#f5f5f5',
            text: '#333'
        },
        button: {
            borderRadius: '6px',
            padding: '8px 16px'
        }
    },
    
    // Debug mode
    debug: true
});
```

## API Reference

### Core Methods

```javascript
// Filter management
afs.filter.addFilter('category:tech');
afs.filter.removeFilter('category:tech');
afs.filter.clearAllFilters();
afs.filter.setFilterTypeLogic('brand', 'AND');

// Search
afs.search.search('query');
afs.search.clearSearch();

// Sorting
afs.filter.sortWithOrder('price', 'DESC');
afs.filter.shuffle();

// Pagination
afs.pagination.goToPage(2);
afs.pagination.nextPage();
afs.pagination.previousPage();

// State
const state = afs.getState();
afs.setState(state);

// Events
afs.on('filter:applied', (data) => {
    console.log(`Showing ${data.visible} of ${data.total} items`);
});
```

### Event System

```javascript
// Available events
afs.on('filter:applied', callback);
afs.on('search:performed', callback);
afs.on('sort:applied', callback);
afs.on('pagination:changed', callback);
afs.on('state:changed', callback);
```

## Examples

The project includes comprehensive examples demonstrating all features:

- **[Interactive Demo](examples/demo.html)** - Complete demo with all filter types
- **[Button Filters](examples/demo.html#buttons)** - Toggle and multi-select buttons  
- **[Select Dropdowns](examples/demo.html#select)** - Dropdown filter controls
- **[Radio Buttons](examples/demo.html#radio)** - Exclusive radio button filters
- **[Checkboxes](examples/demo.html#checkbox)** - Multi-select checkbox filters
- **[Range Filters](examples/demo.html#range)** - Sliders with histogram support
- **[Search Functionality](examples/demo.html#search)** - Real-time search examples

### Running Examples Locally

```bash
# Clone the repository
git clone https://github.com/misits/advanced-filter-system.git
cd advanced-filter-system

# Open examples in browser
open examples/index.html
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

Modern browser features used:
- ES6 Modules
- CSS Custom Properties
- IntersectionObserver API
- URLSearchParams API

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { AFS, AFSOptions, FilterTypeLogic } from 'advanced-filter-system';

interface CustomOptions extends AFSOptions {
    customProperty: string;
}

const filterLogic: FilterTypeLogic = {
    category: { mode: 'OR', multi: true },
    brand: 'OR'
};

const afs = new AFS({
    containerSelector: '#items',
    itemSelector: '.item',
    filterTypeLogic: filterLogic
} as CustomOptions);
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

1. Setting up the development environment
2. Code style and standards
3. Testing requirements
4. Pull request process
5. Bug reporting guidelines
6. Feature request templates

### Development Setup

```bash
# Clone and install
git clone https://github.com/misits/advanced-filter-system.git
cd advanced-filter-system
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ♥ by [misits](https://github.com/misits)

**Star ⭐ this repo if you find it helpful!**