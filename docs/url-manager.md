# URL Manager Documentation

## Overview

The URL Manager handles state persistence through URL parameters, enabling shareable filter states and browser history integration.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [URL Parameter Format](#url-parameter-format)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { URLManager } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    urlState: {
        enabled: true
    }
});

// Access URL manager
const urlManager = afs.urlManager;
```

## Basic Usage

### Initial Setup

```javascript
const afs = createAFS({
    urlState: {
        enabled: true,
        key: 'filter', // Optional URL prefix
        delay: 100    // Delay before initial state load
    }
});
```

### History Integration

```javascript
// Handle browser navigation
window.addEventListener('popstate', () => {
    afs.urlManager.loadFromURL();
});
```

## Configuration

### URL Manager Options

```javascript
{
    enabled: boolean;           // Enable URL state
    key?: string;              // URL parameter prefix
    delay?: number;            // Initial load delay
    pushState?: boolean;       // Use pushState or replaceState
    encodeValues?: boolean;    // URL encode parameter values
    mapping?: {               // Custom parameter names
        filter: string;
        search: string;
        sort: string;
        page: string;
    }
}
```

## URL Parameter Format

### Standard Parameters

```javascript
// Example URL structure
?category=electronics,books     // Filters
&price=100,500                 // Range filter
&search=laptop                 // Search query
&sort=price,desc              // Sort state
&page=2                       // Pagination
```

### Parameter Types

```javascript
// Filter parameters
category=value1,value2         // Multiple values
filterMode=and                 // Filter mode
groupMode=or                   // Group mode

// Range parameters
range_price=0,1000            // Numeric range
dateRange_published=2024-01-01,2024-12-31  // Date range

// Search parameter
search=query                   // Search query

// Sort parameters
sort=key,direction            // Sort state

// Pagination parameters
page=2                        // Current page
perPage=20                    // Items per page
```

## API Reference

### Methods

#### `updateURL(): void`

Update URL with current state.

```javascript
afs.urlManager.updateURL();
```

#### `loadFromURL(): void`

Load state from URL parameters.

```javascript
afs.urlManager.loadFromURL();
```

#### `clearURL(): void`

Clear all URL parameters.

```javascript
afs.urlManager.clearURL();
```

#### `getURLParams(): URLSearchParams`

Get current URL parameters.

```javascript
const params = afs.urlManager.getURLParams();
```

#### `getParam(name: string): string | null`

Get specific parameter value.

```javascript
const searchQuery = afs.urlManager.getParam('search');
```

#### `hasParams(): boolean`

Check if URL has any parameters.

```javascript
if (afs.urlManager.hasParams()) {
    // Handle parameters
}
```

### Properties

```javascript
interface URLState {
    filters: string[];
    ranges: Map<string, Range>;
    dateRanges: Map<string, DateRange>;
    search: string;
    sort: SortState;
    page: number;
}
```

## Events

```javascript
// URL state loaded
afs.on('urlStateLoaded', (data) => {
    console.log('Loaded state:', data.params);
});

// URL updated
afs.on('urlUpdated', (data) => {
    console.log('New URL:', data.url);
});

// URL cleared
afs.on('urlCleared', () => {
    console.log('URL state cleared');
});
```

## Examples

### Basic State Management

```javascript
// Update URL when state changes
afs.on('filterApplied', () => {
    afs.urlManager.updateURL();
});

afs.on('searchApplied', () => {
    afs.urlManager.updateURL();
});

afs.on('sortApplied', () => {
    afs.urlManager.updateURL();
});
```

### Complex State Persistence

```javascript
// Save complete filter state
function saveCompleteState() {
    const state = {
        filters: Array.from(afs.filter.getActiveFilters()),
        search: afs.search.getValue(),
        sort: afs.sort.getCurrentSort(),
        page: afs.pagination.getPageInfo().currentPage
    };
    
    afs.urlManager.updateURL();
}

// Restore complete state
function restoreCompleteState() {
    afs.urlManager.loadFromURL();
}
```

### Custom Parameter Handling

```javascript
// Custom parameter processing
afs.urlManager.processCustomParam = (key, value) => {
    if (key === 'custom') {
        // Handle custom parameter
        return processCustomValue(value);
    }
    return value;
};
```

### Shareable URLs

```javascript
// Generate shareable URL
function getShareableURL() {
    const url = new URL(window.location.href);
    afs.urlManager.updateURL();
    return url.toString();
}

// Copy URL to clipboard
function copyShareableURL() {
    const url = getShareableURL();
    navigator.clipboard.writeText(url);
}
```

## Best Practices

1. **URL Structure**
   - Keep URLs clean and readable
   - Use consistent parameter naming
   - Avoid unnecessary parameters

2. **State Management**
   - Update URL only when necessary
   - Handle browser navigation properly
   - Clear URL when resetting state

3. **Performance**
   - Debounce URL updates
   - Minimize URL parameter size
   - Cache URL state when possible

4. **Security**
   - Sanitize URL parameters
   - Validate parameter values
   - Handle malformed URLs gracefully

5. **User Experience**
   - Provide clear URL feedback
   - Support bookmarking
   - Enable easy sharing
