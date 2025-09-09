# Search Documentation

## Overview

The Search component provides powerful real-time search capabilities with features like multi-field search, intelligent matching, result highlighting, debouncing, and minimum character thresholds. The search system uses advanced regex patterns to match parts of words and ensures all search terms are found within the searchable text.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Search Features](#search-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize with search configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description'],
    minSearchLength: 2,
    debounceTime: 300,
    highlightMatches: true
});

// Access search
const search = afs.search;
```

## Basic Usage

### HTML Structure

```html
<!-- Search Input -->
<input type="text" class="filter-search" placeholder="Search items...">

<!-- Searchable Items -->
<div class="filter-item" 
     data-title="MacBook Pro" 
     data-description="High-performance laptop for professionals"
     data-categories="category:tech brand:apple">
    <h3 data-search-key="title">MacBook Pro</h3>
    <p data-search-key="description">High-performance laptop for professionals</p>
</div>

<div class="filter-item" 
     data-title="Adobe Creative Suite"
     data-description="Complete design software package"
     data-categories="category:design brand:adobe">
    <h3 data-search-key="title">Adobe Creative Suite</h3>
    <p data-search-key="description">Complete design software package</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with search configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description', 'categories'],
    minSearchLength: 2,
    debounceTime: 300,
    highlightMatches: true
});
```

## Configuration

### Search Options

```javascript
const afs = new AFS({
    // Required selectors
    searchInputSelector: '.filter-search',    // Search input selector
    
    // Search configuration
    searchKeys: ['title', 'description'],     // Data attributes to search in
    minSearchLength: 2,                       // Minimum characters before search
    debounceTime: 300,                        // Debounce delay in ms
    highlightMatches: true,                   // Enable text highlighting
    highlightClass: 'afs-highlight'           // CSS class for highlights
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchInputSelector` | string | null | CSS selector for search input |
| `searchKeys` | string[] | `['title']` | Data attributes to search within |
| `minSearchLength` | number | 2 | Minimum query length to trigger search |
| `debounceTime` | number | 300 | Delay in ms before search executes |
| `highlightMatches` | boolean | false | Whether to highlight matching text |
| `highlightClass` | string | `'afs-highlight'` | CSS class for highlighted text |

## Search Features

### Intelligent Matching

The search system uses advanced regex patterns that:
- Match parts of words (not just complete words)
- Ensure all search terms are present in the searchable text
- Are case-insensitive by default
- Support multi-word searches

```javascript
// Search for "macbook pro" will match:
// - "MacBook Pro" (exact match)
// - "macbook professional" (partial word match)
// - "pro macbook" (different order)
```

### Text Highlighting

When enabled, search terms are highlighted in the visible content using `data-search-key` attributes.

```javascript
// Enable highlighting
const afs = new AFS({
    highlightMatches: true,
    highlightClass: 'afs-highlight'
});
```

```css
/* CSS for highlights */
.afs-highlight {
    background-color: #fef08a;
    padding: 0 2px;
    border-radius: 2px;
    font-weight: 500;
}
```

### Multi-Field Search

Search across multiple data attributes simultaneously:

```javascript
const afs = new AFS({
    searchKeys: ['title', 'description', 'categories', 'brand']
});
```

### Debounced Input

Prevents excessive search operations during typing:

```javascript
const afs = new AFS({
    debounceTime: 300 // Wait 300ms after user stops typing
});
```

## API Reference

### Methods

#### `search(query: string): void`

Perform search with the given query string.

```javascript
afs.search.search('MacBook Pro');
```

#### `clearSearch(): void`

Clear current search and show all items.

```javascript
afs.search.clearSearch();
```

#### `setValue(value: string): void`

Set search input value and trigger search.

```javascript
afs.search.setValue('Adobe Creative');
```

#### `getValue(): string`

Get current search query from state.

```javascript
const currentQuery = afs.search.getValue();
console.log('Current search:', currentQuery);
```

#### `updateConfig(config: Object): void`

Update search configuration at runtime.

```javascript
afs.search.updateConfig({
    searchKeys: ['title', 'description', 'brand'],
    minSearchLength: 3,
    highlightClass: 'custom-highlight'
});
```

### Properties

The search component maintains state through the main AFS state system:

```javascript
// Access search state
const searchState = afs.state.getState().search;
console.log('Query:', searchState.query);

// Search-related item state
const itemState = afs.state.getState().items;
console.log('Visible items:', itemState.visible);
console.log('Total items:', itemState.total);
```

## Events

```javascript
// Search performed with results
afs.on('search', (data) => {
    console.log('Query:', data.query);
    console.log('Matches:', data.matches);
    console.log('Total:', data.total);
});

// Search cleared - all items shown
afs.on('searchCleared', () => {
    console.log('Search cleared, showing all items');
});

// Listen for state changes
afs.on('search', (data) => {
    console.log('Search performed:', data.query);
    console.log('Results found:', data.matches);
});
```

## Examples

### Basic Search Setup

```javascript
// Simple search configuration
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    searchInputSelector: '.search-input',
    searchKeys: ['title']
});
```

### Advanced Search Configuration

```javascript
// Comprehensive search setup
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    searchInputSelector: '.search-input',
    
    // Search configuration
    searchKeys: ['title', 'description', 'categories'],
    minSearchLength: 2,
    debounceTime: 250,
    highlightMatches: true,
    highlightClass: 'search-highlight'
});
```

### Search with Filtering

```javascript
// Combine search with filters
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    searchInputSelector: '.search-input',
    filterButtonSelector: '.btn-filter',
    
    // Advanced filter logic
    filterCategoryMode: 'mixed',
    filterTypeLogic: {
        category: { mode: 'OR', multi: true },
        brand: 'OR'
    },
    
    // Search configuration
    searchKeys: ['title', 'description'],
    highlightMatches: true
});

// Programmatic control
afs.filter.addFilter('category:tech');
afs.search.setValue('laptop');
```

### Custom Search Behavior

```javascript
// Initialize AFS
const afs = new AFS({
    searchKeys: ['title', 'description', 'brand'],
    highlightMatches: true
});

// Update configuration at runtime
afs.search.updateConfig({
    searchKeys: ['title', 'description', 'brand', 'features'],
    minSearchLength: 3,
    highlightClass: 'custom-highlight'
});

// Listen for search events
afs.on('search', (data) => {
    document.querySelector('.search-results').textContent = 
        `Found ${data.matches} of ${data.total} items`;
});
```

## Best Practices

### 1. Search Configuration

- **Set appropriate minimum length**: Use `minSearchLength: 2` or higher to avoid excessive searches
- **Use debouncing**: Set `debounceTime: 300` for optimal balance between responsiveness and performance  
- **Configure relevant search keys**: Include only necessary data attributes to improve performance
- **Enable highlighting**: Use `highlightMatches: true` for better user feedback

### 2. HTML Structure

- **Use data attributes**: Store searchable content in `data-*` attributes for consistency
- **Add search-key markers**: Use `data-search-key` attributes on elements that should be highlighted
- **Semantic HTML**: Use proper input type and placeholder text

```html
<!-- Good: Proper structure -->
<div class="filter-item" data-title="MacBook Pro" data-brand="Apple">
    <h3 data-search-key="title">MacBook Pro</h3>
    <span data-search-key="brand">Apple</span>
</div>
```

### 3. Performance Optimization

- **Limit search scope**: Only include necessary fields in `searchKeys`
- **Use appropriate debounce timing**: 250-300ms works well for most use cases
- **Monitor search performance**: Use debug mode to track search timing

### 4. User Experience

- **Clear input placeholder**: Use descriptive placeholder text like "Search products..."
- **Show results count**: Display number of matches to provide feedback
- **Provide clear feedback**: Handle empty results gracefully
- **Enable keyboard support**: Search input should support Enter key and clear on Escape

### 5. Accessibility

- **Use semantic HTML**: Proper input elements with labels
- **ARIA attributes**: Include appropriate ARIA labels and descriptions
- **Keyboard navigation**: Ensure search is fully keyboard accessible
- **Screen reader support**: Provide status updates for search results

```html
<!-- Accessible search input -->
<label for="search-input">Search products</label>
<input type="search" 
       id="search-input" 
       class="filter-search"
       placeholder="Type to search..." 
       aria-describedby="search-results">
<div id="search-results" class="sr-only" aria-live="polite"></div>
```
