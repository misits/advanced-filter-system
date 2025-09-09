# URL Manager Documentation

## Overview

The URL Manager component provides automatic URL state management for all AFS features. It synchronizes filter states, search queries, sorting, and pagination with browser URLs, enabling shareable filtered views, browser back/forward navigation, and persistent state across page refreshes. All state changes are automatically reflected in the URL without any additional configuration.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [URL Format](#url-format)
- [Features](#features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// URL management is automatically enabled when preserveState is true
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    
    // Enable URL state persistence (default: false)
    preserveState: true,
    
    // Optional: Custom URL parameter prefix (default: none)
    urlStateKey: 'filters'
});

// URL Manager is automatically accessible
const urlManager = afs.urlManager;
```

## Basic Usage

### Automatic State Synchronization

URL state management works automatically once enabled:

```javascript
// Initialize AFS with URL state management
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    searchInputSelector: '.search-input',
    
    // Enable URL state management
    preserveState: true,
    
    // All filtering, searching, sorting, and pagination
    // will automatically update the URL
    pagination: {
        enabled: true,
        itemsPerPage: 12
    }
});

// When users interact with filters, the URL automatically updates:
// - Clicking filters: /?category=tech&brand=apple
// - Searching: /?category=tech&search=laptop
// - Sorting: /?category=tech&sort=price,desc
// - Pagination: /?category=tech&page=2
```

### Shareable URLs

Users can share filtered URLs and recipients will see the same filtered view:

```javascript
// URL: /?category=tech,design&brand=apple&search=macbook&sort=price,desc&page=2

// When this URL is loaded, AFS automatically:
// 1. Applies category filters for 'tech' and 'design'
// 2. Applies brand filter for 'apple'
// 3. Sets search query to 'macbook' 
// 4. Sorts by price descending
// 5. Goes to page 2
```

### Browser Navigation

Back and forward buttons work seamlessly:

```javascript
// Users can navigate through their filtering history
// using browser back/forward buttons
// Each state change is preserved in browser history
```

## URL Format

The URL Manager generates clean, readable URLs using standard query parameters:

### Filter Parameters

```
# Single filter values
/?category=tech&brand=apple

# Multiple values for the same filter type (comma-separated)
/?category=tech,design&brand=apple,samsung

# Special filter modes (if not default)
/?category=tech&filterMode=mixed
```

### Search Parameters

```
# Search query
/?search=laptop&category=tech

# URL-encoded search terms
/?search=macbook%20pro&category=tech
```

### Sort Parameters

```
# Sort by field and direction (comma-separated)
/?sort=price,desc&category=tech

# Default direction (asc) can be omitted
/?sort=title,asc  # same as /?sort=title
```

### Pagination Parameters

```
# Current page
/?page=3&category=tech

# Items per page (if different from default)
/?page=2&perPage=20&category=tech
```

### Range Filter Parameters

```
# Numeric ranges (min,max)
/?range_price=100,500&category=tech

# Date ranges (ISO format)
/?dateRange_eventDate=2024-01-01T00:00:00Z,2024-12-31T23:59:59Z
```

### Complete Example

```
# Complex filtered state
/?category=tech,design&brand=apple&search=macbook&sort=price,desc&page=2&range_price=1000,3000&filterMode=mixed
```

## Features

### Automatic State Persistence

- **Filter states**: All active filters are preserved in URL
- **Search queries**: Search terms are maintained across sessions
- **Sort states**: Current sort field and direction are saved
- **Pagination**: Current page and items per page are tracked
- **Range filters**: Min/max values for all range filters are preserved

### Browser History Integration

- **Navigation support**: Back/forward buttons work correctly
- **History entries**: Each filter change creates a new history entry
- **State restoration**: Previous states are correctly restored

### URL Optimization

- **Clean URLs**: No unnecessary parameters in URLs
- **Default value handling**: Default values are omitted from URLs
- **Encoding**: Special characters are properly URL-encoded

### Error Handling

- **Invalid parameters**: Gracefully handles malformed URL parameters
- **Missing filters**: Handles URLs with non-existent filter values
- **State recovery**: Falls back to default state on URL parsing errors

## API Reference

### Core Methods

#### `updateURL(): void`

Manually update the URL with current filter state (usually called automatically).

```javascript
// Manually trigger URL update
afs.urlManager.updateURL();
```

#### `loadFromURL(): void`

Load and apply filter state from current URL (called automatically on page load and navigation).

```javascript
// Manually load state from URL
afs.urlManager.loadFromURL();
```

#### `clearURL(): void`

Clear all URL parameters and reset to default state.

```javascript
// Clear URL and reset all filters
afs.urlManager.clearURL();
// URL becomes: /path/to/page (no query parameters)
```

#### `initialize(): void`

Initialize URL manager and load initial state (called automatically).

```javascript
// Manual initialization (rarely needed)
afs.urlManager.initialize();
```

### Utility Methods

#### `getURLParams(): URLSearchParams`

Get current URL parameters as URLSearchParams object.

```javascript
const params = afs.urlManager.getURLParams();
console.log('Category filters:', params.get('category'));
console.log('Search query:', params.get('search'));
```

#### `hasParams(): boolean`

Check if URL contains any query parameters.

```javascript
if (afs.urlManager.hasParams()) {
    console.log('URL contains filter parameters');
}
```

#### `getParam(param: string): string|null`

Get specific parameter value from URL.

```javascript
const searchQuery = afs.urlManager.getParam('search');
const currentPage = afs.urlManager.getParam('page');
const sortBy = afs.urlManager.getParam('sort');
```

## Events

```javascript
// URL state has been loaded (on page load or navigation)
afs.on('urlStateLoaded', (data) => {
    console.log('URL state loaded:', data.params);
    console.log('Filters applied from URL');
});

// URL has been updated (after filter changes)
afs.on('filtersApplied', (data) => {
    console.log('Filters applied, URL will be updated');
    console.log('Visible items:', data.visibleItems);
});
```

## Examples

### Basic URL State Management

```javascript
// Enable URL state management
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    filterButtonSelector: '.btn-filter',
    preserveState: true  // Enable URL state management
});

// All interactions automatically update URL:
// - Filter clicks update URL with filter parameters
// - Search updates URL with search parameter
// - Sort changes update URL with sort parameters
// - Page changes update URL with page parameter
```

### Custom URL State Key

```javascript
// Use custom parameter prefix
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item',
    preserveState: true,
    urlStateKey: 'shop'  // Custom prefix
});

// URLs will use custom parameter names:
// /?shop_category=tech&shop_search=laptop&shop_page=2
```

### Programmatic URL Management

```javascript
const afs = new AFS({
    preserveState: true,
    // ... other config
});

// Check if URL has existing filters
if (afs.urlManager.hasParams()) {
    console.log('Page loaded with existing filters');
    
    // Get specific parameters
    const category = afs.urlManager.getParam('category');
    const search = afs.urlManager.getParam('search');
    
    console.log('Category filter:', category);
    console.log('Search query:', search);
}

// Clear all URL parameters and reset state
document.querySelector('#clear-all').addEventListener('click', () => {
    afs.urlManager.clearURL();
});

// Manually trigger URL update (rarely needed)
document.querySelector('#update-url').addEventListener('click', () => {
    afs.urlManager.updateURL();
});
```

### URL State Monitoring

```javascript
const afs = new AFS({
    preserveState: true,
    // ... other config
});

// Monitor URL state changes
afs.on('urlStateLoaded', (data) => {
    console.log('Filters loaded from URL:', data.params);
    
    // Update UI to reflect loaded state
    const filterCount = Object.keys(data.params).length;
    document.querySelector('.filter-indicator').textContent = 
        `${filterCount} filters active`;
});

// Track filter changes for analytics
let urlUpdateCount = 0;
afs.on('filtersApplied', () => {
    urlUpdateCount++;
    console.log(`URL updated ${urlUpdateCount} times`);
    
    // Track for analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'filter_state_changed', {
            'session_filter_changes': urlUpdateCount
        });
    }
});
```

### Sharing and Bookmarking

```javascript
const afs = new AFS({
    preserveState: true,
    // ... other config
});

// Create shareable link button
document.querySelector('#share-filters').addEventListener('click', () => {
    const currentURL = window.location.href;
    
    // Copy to clipboard
    navigator.clipboard.writeText(currentURL).then(() => {
        alert('Filter URL copied to clipboard!');
    });
});

// Create bookmark with current filter state
document.querySelector('#bookmark-filters').addEventListener('click', () => {
    const params = afs.urlManager.getURLParams();
    const hasFilters = params.toString().length > 0;
    
    if (hasFilters) {
        // Generate descriptive bookmark title
        const activeFilters = [];
        if (params.get('category')) activeFilters.push(`Category: ${params.get('category')}`);
        if (params.get('search')) activeFilters.push(`Search: ${params.get('search')}`);
        
        const title = `Filtered View - ${activeFilters.join(', ')}`;
        
        // Attempt to add bookmark (browser dependent)
        if (window.sidebar && window.sidebar.addPanel) {
            window.sidebar.addPanel(title, window.location.href, '');
        } else if (window.external && ('AddFavorite' in window.external)) {
            window.external.AddFavorite(window.location.href, title);
        } else {
            alert(`Bookmark this page: ${title}\\n${window.location.href}`);
        }
    } else {
        alert('Apply some filters first to create a meaningful bookmark!');
    }
});
```

## Best Practices

### 1. Enable URL State Management

- **Always use for public interfaces**: Enable `preserveState: true` for user-facing filter interfaces
- **Consider SEO implications**: Filtered URLs can be indexed by search engines
- **Use meaningful parameter names**: Default parameter names are descriptive and SEO-friendly

```javascript
// Good: Enable URL state for shareable filter interfaces
const afs = new AFS({
    preserveState: true,  // Enable URL state management
    // ... other config
});
```

### 2. Handle URL State Loading

- **Wait for URL load**: Allow URL state to load before making programmatic changes
- **Monitor state loading**: Use events to know when URL state has been applied
- **Handle loading states**: Show loading indicators while URL state is being applied

```javascript
// Good: Wait for URL state before additional setup
afs.on('urlStateLoaded', () => {
    // Now safe to make additional programmatic changes
    console.log('URL state loaded, ready for interaction');
    
    // Update UI based on loaded state
    updateFilterSummary();
    hideLoadingIndicator();
});
```

### 3. URL Parameter Management

- **Don't manually modify URLs**: Let AFS manage URL parameters automatically
- **Use clean parameter names**: Default names are already optimized
- **Handle special characters**: Search terms and filter values are automatically encoded

### 4. Browser History

- **Respect browser navigation**: Don't interfere with back/forward button behavior
- **Test navigation thoroughly**: Ensure all filter states restore correctly
- **Consider history length**: Very active filtering can create long browser histories

### 5. Error Handling

- **Handle malformed URLs**: URL Manager gracefully handles invalid parameters
- **Provide fallbacks**: Always have default states when URL parsing fails
- **Log URL errors**: Monitor URL parsing errors in production

```javascript
// Good: Monitor URL state loading errors
afs.on('urlStateLoaded', (data) => {
    const paramCount = Object.keys(data.params).length;
    if (paramCount === 0 && window.location.search.length > 1) {
        // URL had parameters but none were applied - possible parsing error
        console.warn('URL parameters present but no state loaded');
    }
});
```

### 6. Performance Considerations

- **URL updates are debounced**: Multiple rapid changes won't create excessive history entries
- **State loading is efficient**: URL parsing and state application are optimized
- **Consider very long URLs**: Many active filters can create long URLs

### 7. SEO and Accessibility

- **Filtered URLs are indexable**: Search engines can index filtered views
- **Use descriptive filter values**: Filter parameters should be meaningful
- **Consider canonical URLs**: For SEO, consider canonical tags for default views

### 8. Analytics Integration

- **Track URL state changes**: Monitor how users interact with filters
- **Analyze filter usage**: URL parameters reveal popular filter combinations
- **Track sharing**: Monitor if users share filtered URLs

```javascript
// Good: Analytics integration
afs.on('urlStateLoaded', (data) => {
    // Track when users load shared filter URLs
    if (Object.keys(data.params).length > 0) {
        gtag('event', 'filtered_url_loaded', {
            'filter_count': Object.keys(data.params).length,
            'has_search': !!data.params.search,
            'has_sort': !!data.params.sort
        });
    }
});
```

### 9. Testing URL Management

- **Test all filter combinations**: Ensure all filter types work with URLs
- **Test browser navigation**: Verify back/forward buttons work correctly
- **Test URL sharing**: Ensure shared URLs work in different browsers
- **Test malformed URLs**: Verify graceful handling of invalid parameters

### 10. Mobile Considerations

- **URL sharing on mobile**: Consider mobile sharing UX for filtered URLs
- **History navigation**: Back/forward gestures should work correctly
- **URL length**: Mobile browsers may handle very long URLs differently