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
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { URLManager } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    urlStateEnabled: true
});

// Access URL manager
const urlManager = afs.urlManager;
```

## Basic Usage

### Initial Setup

```javascript
const afs = createAFS({
    urlStateEnabled: true,
    urlStateKey: 'filter', // Optional URL prefix
    urlStateDelay: 100    // Delay before initial state load
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
    stateKey?: string;         // URL parameter prefix
    delay?: number;            // Initial load delay
    pushState?: boolean;       // Use pushState or replaceState
    encodeValues?: boolean;    // URL encode parameter values
    parameterMapping?: {       // Custom parameter names
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
afs.on('filter', () => {
    afs.urlManager.updateURL();
});

afs.on('search', () => {
    afs.urlManager.updateURL();
});

afs.on('sort', () => {
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
// Create shareable URL
function getShareableURL() {
    afs.urlManager.updateURL();
    return window.location.href;
}

// Share button implementation
const shareButton = document.createElement('button');
shareButton.addEventListener('click', () => {
    const url = getShareableURL();
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
});
```

## TypeScript

```typescript
interface URLManagerOptions {
    enabled: boolean;
    stateKey?: string;
    delay?: number;
    pushState?: boolean;
    encodeValues?: boolean;
    parameterMapping?: ParameterMapping;
}

interface ParameterMapping {
    filter: string;
    search: string;
    sort: string;
    page: string;
}

interface URLStateEvent {
    params: Record<string, string>;
    source: 'url' | 'history';
}

interface URLUpdateEvent {
    url: string;
    state: URLState;
}
```

## Best Practices

1. **State Serialization**

   ```javascript
   // Efficient state serialization
   function serializeState(state) {
       return Object.entries(state)
           .filter(([_, value]) => value !== null && value !== undefined)
           .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
           .join('&');
   }
   ```

2. **History Management**

   ```javascript
   // Handle browser navigation properly
   window.addEventListener('popstate', (event) => {
       if (event.state) {
           afs.urlManager.loadFromURL(true); // Skip history update
       }
   });
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.urlManager.loadFromURL();
   } catch (error) {
       console.error('URL state error:', error);
       afs.urlManager.clearURL(); // Reset to clean state
   }
   ```

4. **Performance**

   ```javascript
   // Debounce URL updates
   const debouncedUpdate = debounce(() => {
       afs.urlManager.updateURL();
   }, 300);
   
   afs.on('filter', debouncedUpdate);
   afs.on('search', debouncedUpdate);
   ```

5. **Clean URLs**

   ```javascript
   // Remove empty parameters
   function cleanURL(params) {
       Array.from(params.entries()).forEach(([key, value]) => {
           if (!value || value === '[]' || value === '{}') {
               params.delete(key);
           }
       });
       return params;
   }
   ```

6. **State Validation**

   ```javascript
   // Validate URL parameters
   function validateURLState(params) {
       const allowedParams = new Set(['filter', 'search', 'sort', 'page']);
       let isValid = true;
       
       params.forEach((value, key) => {
           if (!allowedParams.has(key)) {
               isValid = false;
           }
       });
       
       return isValid;
   }
   ```
