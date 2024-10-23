
# Advanced Filter System

A flexible and powerful JavaScript library for filtering DOM elements with search and sorting capabilities.

## Features

- 🔍 Multiple typed filters (category, price, etc.)
- 🔎 Text search with debouncing
- 📊 Multi-criteria sorting
- 🔗 URL state management
- ✨ Smooth animations
- 🔢 Results counter
- 📱 Responsive

## Installation

### Via npm

```bash
npm install advanced-filter-system
```

### Direct Download

Download `src/AFS.js` from this repository and include it in your project.

## Basic Usage

### HTML Structure

```html
<div class="filter-container">
    <!-- Filter buttons with types -->
    <div class="filters">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:web">Web</button>
        <button class="btn-filter" data-filter="category:design">Design</button>
        <button class="btn-filter" data-filter="price:low">Low Price</button>
    </div>

    <!-- Search (optional) -->
    <input type="text" class="filter-search" placeholder="Search...">

    <!-- Counter (optional) -->
    <div class="filter-counter"></div>

    <!-- Filterable items -->
    <div class="items">
        <div class="filter-item" 
             data-categories="category:web category:low" 
             data-title="Project 1"
             data-price="low"
             data-year="2023">
            <!-- Content -->
        </div>
    </div>
</div>
```

### JavaScript Initialization

```javascript
import { AFS } from 'advanced-filter-system';

const filter = new AFS({
    containerSelector: '.filter-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter'
});
```

## Advanced Configuration

### Full Options

```javascript
const filter = new AFS({
    // Required
    containerSelector: '.filter-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    
    // Optional (default values)
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

### Managing Multiple Filters

```javascript
// Add filters
filter.addFilter('category', 'web');
filter.addFilter('price', 'low');

// Remove filters
filter.removeFilter('category', 'web');

// Get active filters by type
const activeCategories = filter.getActiveFiltersByType('category');
```

### URL State Management

Filters are automatically managed in the URL:

```javascript
// URL format:
// ?category=web,design&price=low,medium&search=project
```

## Examples

### Portfolio Filter with Multiple Categories

```html
<div class="portfolio filter-container">
    <div class="filters">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="type:web">Web</button>
        <button class="btn-filter" data-filter="type:app">Apps</button>
        <button class="btn-filter" data-filter="tech:react">React</button>
        <button class="btn-filter" data-filter="tech:vue">Vue</button>
    </div>

    <div class="portfolio-items">
        <div class="filter-item" 
             data-categories="type:web tech:react"
             data-title="React Project">
            <h3>React Web Project</h3>
            <p>Description...</p>
        </div>
    </div>
</div>

<script>
const portfolioFilter = new AFS({
    containerSelector: '.portfolio',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    filterMode: 'AND' // Must match all selected filters
});
</script>
```

### Advanced Product Filter

```html
<div class="products filter-container">
    <!-- Filters by type -->
    <div class="filters">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:electronics">Electronics</button>
        <button class="btn-filter" data-filter="price:low">Low Price</button>
        <button class="btn-filter" data-filter="price:medium">Medium Price</button>
        <button class="btn-filter" data-filter="stock:available">In Stock</button>
    </div>

    <input type="text" class="filter-search" placeholder="Search...">
    <div class="filter-counter"></div>

    <div class="product-grid">
        <div class="filter-item" 
             data-categories="category:electronics price:low stock:available" 
             data-title="Smartphone"
             data-price="599">
            <!-- Product content -->
        </div>
    </div>
</div>
```

## Browser Compatibility

- Chrome
- Firefox
- Safari
- Edge
- IE11 (with polyfills)

## Contribution

Contributions are welcome! Feel free to submit a Pull Request.

## License

MIT License
