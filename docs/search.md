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
- [Best Practices](#best-practices)

## Installation

```javascript
import { Search } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    search: {
        enabled: true,
        inputSelector: '.afs-filter-search',
        keys: ['title', 'description']
    }
});

// Access search
const search = afs.search;
```

## Basic Usage

### HTML Structure

```html
<!-- Search Input -->
<input type="text" class="afs-filter-search" placeholder="Search...">

<!-- Searchable Items -->
<div class="afs-filter-item" 
     data-title="Product Name" 
     data-description="Product description"
     data-categories="category:electronics">
    <h3>Product Name</h3>
    <p>Product description</p>
</div>
```

### JavaScript Implementation

```javascript
// Initialize with search configuration
const afs = createAFS({
    search: {
        enabled: true,
        inputSelector: '.afs-filter-search',
        keys: ['title', 'description'],
        minLength: 2,
        debounce: 300,
        highlightMatches: true
    }
});
```

## Configuration

### Search Options

```javascript
{
    enabled: boolean;           // Enable search
    inputSelector: string;      // Search input selector
    keys: string[];            // Data attributes to search in
    minLength: number;         // Minimum characters before search
    debounce: number;          // Debounce delay in ms
    highlightMatches: boolean; // Highlight matching text
    highlightClass: string;    // CSS class for highlights
    caseSensitive: boolean;    // Case-sensitive search
    fuzzySearch: boolean;      // Enable fuzzy search
    searchMode: 'contains' | 'startsWith' | 'exact'; // Search mode
}
```

## Search Features

### Text Highlighting

```javascript
// Enable highlighting
const afs = createAFS({
    search: {
        enabled: true,
        highlightMatches: true,
        highlightClass: 'afs-search-highlight'
    }
});

// CSS for highlights
.afs-search-highlight {
    background-color: #fef08a;
    font-weight: 500;
}
```

### Fuzzy Search

```javascript
// Enable fuzzy search
const afs = createAFS({
    search: {
        enabled: true,
        fuzzySearch: true,
        fuzzyOptions: {
            threshold: 0.6,
            distance: 100
        }
    }
});
```

### Search Modes

```javascript
// Different search modes
const afs = createAFS({
    search: {
        enabled: true,
        searchMode: 'contains', // Default
        // or 'startsWith'
        // or 'exact'
    }
});
```

## API Reference

### Methods

#### `search(query: string): void`

Perform search with given query.

```javascript
afs.search.search('query');
```

#### `clear(): void`

Clear current search.

```javascript
afs.search.clear();
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

#### `configure(config: SearchConfig): void`

Update search configuration.

```javascript
afs.search.configure({
    keys: ['title', 'content'],
    minLength: 3
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
afs.on('searchApplied', (data) => {
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
    search: {
        enabled: true,
        inputSelector: '.afs-filter-search',
        keys: ['title']
    }
});
```

### Advanced Search Configuration

```javascript
// Complex search setup
const afs = createAFS({
    search: {
        enabled: true,
        inputSelector: '.afs-filter-search',
        keys: ['title', 'description', 'categories'],
        minLength: 2,
        debounce: 300,
        highlightMatches: true,
        fuzzySearch: true,
        caseSensitive: false,
        searchMode: 'contains'
    }
});
```

### Custom Search Implementation

```javascript
// Custom search logic
afs.search.configure({
    customSearch: (item, query) => {
        // Custom search implementation
        const searchText = item.dataset.title.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        // Custom matching logic
        return searchText.includes(searchQuery) || 
               item.dataset.categories.includes(searchQuery);
    }
});
```

## Best Practices

1. **Search Configuration**
   - Set appropriate minimum length to avoid excessive searches
   - Use debouncing for better performance
   - Configure relevant search keys

2. **User Experience**
   - Provide clear search input placeholder
   - Show search results count
   - Highlight matching text for better visibility

3. **Performance**
   - Use debouncing for real-time search
   - Limit search scope to relevant fields
   - Consider using fuzzy search for better matching

4. **Accessibility**
   - Use semantic HTML for search input
   - Include proper ARIA attributes
   - Ensure keyboard navigation works correctly

5. **Error Handling**
   - Handle empty search results gracefully
   - Provide feedback for no matches
   - Validate search input when needed
