# Search Documentation

## Overview

The Search component provides real-time search capabilities with features like multi-field search, result highlighting, debouncing, and minimum character thresholds.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Search Features](#search-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { Search } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description']
});

// Access search
const search = afs.search;
```

## Basic Usage

### HTML Structure

```html
<!-- Search Input -->
<input type="text" class="filter-search" placeholder="Search...">

<!-- Searchable Items -->
<div class="filter-item" 
     data-title="Product Name" 
     data-description="Product description"
     data-categories="electronics">
    <h3>Product Name</h3>
    <p>Product description</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with search configuration
const afs = createAFS({
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description'],
    minSearchLength: 2,
    debounceTime: 300,
    highlightMatches: true
});
```

## Configuration

### Search Options

```javascript
{
    searchInputSelector: string;    // Search input selector
    searchKeys: string[];          // Data attributes to search in
    minSearchLength: number;       // Minimum characters before search
    debounceTime: number;         // Debounce delay in ms
    highlightMatches: boolean;    // Highlight matching text
    highlightClass: string;       // CSS class for highlights
    caseSensitive: boolean;       // Case-sensitive search
    fuzzySearch: boolean;         // Enable fuzzy search
    searchMode: 'contains' | 'startsWith' | 'exact'; // Search mode
}
```

## Search Features

### Text Highlighting

```javascript
// Enable highlighting
const afs = createAFS({
    highlightMatches: true,
    highlightClass: 'search-highlight'
});

// CSS for highlights
.search-highlight {
    background-color: yellow;
    font-weight: bold;
}
```

### Fuzzy Search

```javascript
// Enable fuzzy search
const afs = createAFS({
    fuzzySearch: true,
    fuzzyOptions: {
        threshold: 0.6,
        distance: 100
    }
});
```

### Search Modes

```javascript
// Different search modes
const afs = createAFS({
    searchMode: 'contains', // Default
    // or 'startsWith'
    // or 'exact'
});
```

## API Reference

### Methods

#### `search(query: string): void`

Perform search with given query.

```javascript
afs.search.search('query');
```

#### `clearSearch(): void`

Clear current search.

```javascript
afs.search.clearSearch();
```

#### `setValue(value: string): void`

Set search input value programmatically.

```javascript
afs.search.setValue('new query');
```

#### `getValue(): string`

Get current search value.

```javascript
const query = afs.search.getValue();
```

#### `updateConfig(config: SearchConfig): void`

Update search configuration.

```javascript
afs.search.updateConfig({
    searchKeys: ['title', 'content'],
    minSearchLength: 3
});
```

### Properties

```javascript
interface SearchState {
    query: string;
    matches: number;
    total: number;
}
```

## Events

```javascript
// Search performed
afs.on('search', (data) => {
    console.log('Query:', data.query);
    console.log('Matches:', data.matches);
    console.log('Total:', data.total);
});

// Search cleared
afs.on('searchCleared', () => {
    console.log('Search cleared');
});

// Search started
afs.on('searchStarted', (data) => {
    console.log('Searching for:', data.query);
});

// Search completed
afs.on('searchCompleted', (data) => {
    console.log('Found matches:', data.matches);
});
```

## Examples

### Basic Search

```javascript
// Simple text search
const afs = createAFS({
    searchInputSelector: '.filter-search',
    searchKeys: ['title']
});
```

### Advanced Search Configuration

```javascript
// Complex search setup
const afs = createAFS({
    searchInputSelector: '.filter-search',
    searchKeys: ['title', 'description', 'categories'],
    minSearchLength: 2,
    debounceTime: 300,
    highlightMatches: true,
    fuzzySearch: true,
    caseSensitive: false,
    searchMode: 'contains'
});
```

### Custom Search Implementation

```javascript
// Custom search logic
afs.search.updateConfig({
    customSearch: (item, query) => {
        // Custom search implementation
        const searchText = item.dataset.title.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        // Custom matching logic
        return searchText.includes(searchQuery) || 
               item.dataset.tags.includes(searchQuery);
    }
});
```

### Search with Filters

```javascript
// Combine search with filters
afs.on('search', (data) => {
    // Apply additional filters after search
    if (data.matches > 0) {
        afs.filter.addFilter('inStock');
    }
});
```

## TypeScript

```typescript
interface SearchOptions {
    searchInputSelector: string;
    searchKeys: string[];
    minSearchLength?: number;
    debounceTime?: number;
    highlightMatches?: boolean;
    highlightClass?: string;
    caseSensitive?: boolean;
    fuzzySearch?: boolean;
    searchMode?: 'contains' | 'startsWith' | 'exact';
    customSearch?: (item: HTMLElement, query: string) => boolean;
}

interface SearchEvent {
    query: string;
    matches: number;
    total: number;
}

interface SearchResult {
    matches: Set<HTMLElement>;
    query: string;
}
```

## Best Practices

1. **Performance Optimization**

   ```javascript
   // Debounce search for better performance
   const afs = createAFS({
       debounceTime: 300,
       searchKeys: ['title'], // Limit search fields for better performance
   });
   ```

2. **Memory Management**

   ```javascript
   // Clean up highlights when removing items
   afs.on('itemRemoved', (item) => {
       afs.search.removeHighlights(item);
   });
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.search.search(query);
   } catch (error) {
       console.error('Search error:', error);
       // Handle error appropriately
   }
   ```

4. **Accessibility**

   ```javascript
   // Add ARIA attributes
   const searchInput = document.querySelector('.filter-search');
   searchInput.setAttribute('role', 'searchbox');
   searchInput.setAttribute('aria-label', 'Search items');
   
   // Add search results announcement
   afs.on('searchCompleted', (data) => {
       announceSearchResults(data.matches);
   });
   ```

5. **URL Integration**

   ```javascript
   // Update URL with search query
   afs.on('search', (data) => {
       const url = new URL(window.location);
       url.searchParams.set('q', data.query);
       window.history.pushState({}, '', url);
   });
   ```

6. **Search Results Caching**

   ```javascript
   const searchCache = new Map();
   
   function getCachedResults(query) {
       return searchCache.get(query);
   }
   
   afs.on('searchCompleted', (data) => {
       searchCache.set(data.query, data.matches);
   });
   ```
