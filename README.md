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
  - Multiple categories per item
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
  - Smooth transitions
  - Custom animations
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
    <!-- Counter -->
    <div class="afs-filter-counter"></div>

    <!-- Search -->
    <input type="text" class="afs-filter-search" placeholder="Search...">
    
    <!-- Filter Buttons -->
    <div class="filter-buttons">
        <button class="afs-btn-filter" data-filter="*">All</button>
        <button class="afs-btn-filter" data-filter="category:category1">Category 1</button>
        <button class="afs-btn-filter" data-filter="category:category2">Category 2</button>
    </div>

    <!-- Sort Buttons -->
    <div class="afs-sort-buttons">
        <button class="afs-btn-sort" data-sort-key="price">
            Price <span class="sort-direction">↑</span>
        </button>
        <button class="afs-btn-sort" data-sort-key="date">
            Date <span class="sort-direction">↑</span>
        </button>
    </div>

    <!-- Range Filter -->
    <div id="price-range"></div>

    <!-- Date Filter -->
    <div id="date-filter"></div>

    <!-- Items Container -->
    <div id="items-container">
        <div class="afs-filter-item" 
             data-categories="category:category1 category:category2" 
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
    <script type="module">
        import { AFS } from 'https://unpkg.com/advanced-filter-system@latest/dist/afs.modern.js';

        const afs = new AFS({
            containerSelector: '#items-container',
            itemSelector: '.afs-filter-item',
            searchInputSelector: '.afs-filter-search',
            filterButtonSelector: '.afs-btn-filter',
            sortButtonSelector: '.afs-btn-sort',
            counterSelector: '.afs-filter-counter',
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
            },
            styles: {
                button: {
                    padding: "12px 24px",
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    minHeight: "48px",
                    lineHeight: "1.8",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    hover: {
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                    },
                    active: {
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                    }
                },
                dropdown: {
                // Same properties as button
                }
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
import { AFS } from 'advanced-filter-system';

const afs = new AFS({
    containerSelector: '#items-container',
    itemSelector: '.afs-filter-item',
    debug: true,
    animation: {
        type: 'fade',
        duration: 300
    }
});
```

## Basic Usage

### Filtering

Multiple categories can be specified using space-separated values in the `data-categories` attribute:

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

JavaScript API:

```javascript
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
// Configure search
afs.search.configure({
    keys: ['title', 'description'],
    minLength: 2,
    debounce: 300
});

// Search programmatically
afs.search.search('query');
```

### Sorting

```javascript
// Single column sort
afs.sort.sort('price', 'asc');

// Multiple column sort
afs.sort.sortMultiple([
    { key: 'category', direction: 'asc' },
    { key: 'price', direction: 'desc' }
]);

// Custom sort
afs.sort.sortWithComparator('title', (a, b) => {
    return a.localeCompare(b);
});
```

### Pagination

```javascript
// Configure pagination
afs.pagination.configure({
    itemsPerPage: 10,
    showControls: true
});

// Navigate pages
afs.pagination.goToPage(2);
afs.pagination.nextPage();
afs.pagination.previousPage();
```

## Advanced Usage

### Filter Groups

```javascript
// Create filter group
afs.filter.createGroup('group1', {
    filters: ['category:category1', 'category:category2'],
    operator: 'OR'
});

// Set group mode
afs.filter.setGroupMode('AND'); // or 'OR'
```

### Custom Sorting

```javascript
// Custom sort function
afs.sort.sortWithComparator('price', (a, b) => {
    return parseFloat(a) - parseFloat(b);
});
```

### URL State Management

```javascript
// Enable URL state
afs.urlManager.enable();

// Get current state
const state = afs.urlManager.getState();

// Set state
afs.urlManager.setState(state);
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
const afs = new AFS({
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
const afs = new AFS({
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
const afs = new AFS({
    animation: {
        type: 'fade', // or 'slide', 'scale', etc.
        duration: 300,
        easing: 'ease-in-out'
    }
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import { createAFS, AFSOptions } from 'advanced-filter-system';

const options: AFSOptions = {
    containerSelector: '#items-container',
    itemSelector: '.filter-item'
};

const afs = new AFS(options);
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
