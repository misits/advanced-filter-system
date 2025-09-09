# Range Filter Documentation

## Overview

The Range Filter component provides interactive dual-thumb range sliders for numerical and date-based filtering. It features automatic min/max calculation, optional histograms, smooth dragging, touch support, and customizable styling. Perfect for filtering price ranges, date ranges, ratings, and any numerical data.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Range Features](#range-features)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize AFS (range filter is accessed via afs.rangeFilter)
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Access range filter functionality
const rangeFilter = afs.rangeFilter;
```

## Basic Usage

### HTML Structure

```html
<!-- Range Slider Container -->
<div class="price-range-container"></div>
<div class="rating-range-container"></div>
<div class="date-range-container"></div>

<!-- Filterable Items with data attributes -->
<div class="filter-item" 
     data-price="2499" 
     data-rating="4.8" 
     data-date="2024-03-15">
    MacBook Pro - $2,499 - 4.8⭐ - March 15, 2024
</div>

<div class="filter-item" 
     data-price="1299" 
     data-rating="4.5" 
     data-date="2024-02-10">
    iPad Pro - $1,299 - 4.5⭐ - February 10, 2024
</div>
```

### JavaScript Implementation

```javascript
// Initialize AFS
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Add price range slider with histogram
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-range-container'),
    min: 0,
    max: 3000,
    step: 50,
    ui: {
        showHistogram: true,
        bins: 12
    }
});

// Add rating range slider
afs.rangeFilter.addRangeSlider({
    key: 'rating',
    type: 'number', 
    container: document.querySelector('.rating-range-container'),
    min: 4.0,
    max: 5.0,
    step: 0.1
});

// Add date range slider
afs.rangeFilter.addRangeSlider({
    key: 'date',
    type: 'date',
    container: document.querySelector('.date-range-container'),
    min: '2024-01-01',
    max: '2024-12-31'
});
```

## Configuration

### Range Slider Options

```javascript
// addRangeSlider method parameters
afs.rangeFilter.addRangeSlider({
    key: string,                    // Data attribute name (required)
    type: 'number' | 'date',       // Data type (required)
    container: HTMLElement,         // DOM container element (required)
    min: number | string,           // Minimum value (optional, auto-calculated if not provided)
    max: number | string,           // Maximum value (optional, auto-calculated if not provided)
    step: number,                   // Step size for values (optional, default: 1)
    ui: {                          // UI configuration (optional)
        showHistogram: boolean,     // Show histogram bars (default: false)
        bins: number               // Number of histogram bins (default: 10)
    }
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | string | **required** | Data attribute name (e.g., 'price', 'rating') |
| `type` | string | **required** | Data type: 'number' or 'date' |
| `container` | HTMLElement | **required** | DOM element to contain the slider |
| `min` | number/string | auto-calculated | Minimum value of the range |
| `max` | number/string | auto-calculated | Maximum value of the range |
| `step` | number | 1 | Step size for slider values |
| `ui.showHistogram` | boolean | false | Display histogram bars behind slider |
| `ui.bins` | number | 10 | Number of histogram bins to display |

## Range Features

### Automatic Min/Max Calculation

When `min` and `max` are not provided, the range slider automatically calculates them from your data:

```javascript
// Automatic calculation - analyzes all items with data-price
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-range-container')
    // min and max are calculated automatically
});
```

### Histogram Support

Optional histograms show data distribution behind the slider:

```javascript
// Enable histogram with 15 bins
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-range-container'),
    ui: {
        showHistogram: true,
        bins: 15  // More bins = more granular display
    }
});
```

### Touch and Drag Support

- **Smooth dragging**: Optimized with requestAnimationFrame and debouncing
- **Touch support**: Works on mobile devices with touch events
- **Bounds checking**: Thumbs stay within valid ranges
- **Step snapping**: Values snap to defined step intervals

### Date Range Support

Handle date ranges with automatic conversion:

```javascript
// Date range slider
afs.rangeFilter.addRangeSlider({
    key: 'date',
    type: 'date',
    container: document.querySelector('.date-range-container'),
    min: '2024-01-01',    // ISO date string
    max: '2024-12-31',    // ISO date string
    step: 1               // Days
});
```

## API Reference

### Core Methods

#### `addRangeSlider(options: RangeOptions): void`

Create a new range slider with the specified configuration.

```javascript
// Complete example with all options
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-range'),
    min: 0,
    max: 1000,
    step: 10,
    ui: {
        showHistogram: true,
        bins: 20
    }
});
```

#### `getRangeValues(key: string): Object|null`

Get current values for a range slider.

```javascript
const values = afs.rangeFilter.getRangeValues('price');
if (values) {
    console.log('Min:', values.min);
    console.log('Max:', values.max);
    console.log('Type:', values.type);
}
```

#### `setRangeValues(key: string, min: number|string, max: number|string): void`

Set range values programmatically.

```javascript
// Set price range to $200-800
afs.rangeFilter.setRangeValues('price', 200, 800);

// Set date range
afs.rangeFilter.setRangeValues('date', '2024-03-01', '2024-06-30');
```

#### `removeRangeSlider(key: string): void`

Remove a range slider and clean up its elements.

```javascript
// Remove price range slider
afs.rangeFilter.removeRangeSlider('price');
```

### Type Definitions

```javascript
// Range slider configuration
interface RangeOptions {
    key: string;                    // Data attribute key
    type: 'number' | 'date';       // Value type
    container: HTMLElement;         // Container element
    min?: number | string;          // Minimum value
    max?: number | string;          // Maximum value  
    step?: number;                  // Step interval
    ui?: {
        showHistogram?: boolean;    // Show histogram
        bins?: number;              // Histogram bins
    };
}

// Range values
interface RangeValues {
    min: number;                    // Current minimum
    max: number;                    // Current maximum
    type: 'number' | 'date';       // Value type
}
```

## Events

```javascript
// Range filter applied
afs.on('rangeFilter', (data) => {
    console.log('Range updated for:', data.key);
    console.log('Min value:', data.min);
    console.log('Max value:', data.max);
});

// Listen for any filter changes (including range filters)
afs.on('filtersApplied', (data) => {
    console.log('Total visible items:', data.visible);
    console.log('Active filters:', Array.from(data.activeFilters));
});
```

## Examples

### E-commerce Price Filter

```javascript
// Price range with histogram for e-commerce
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-filter'),
    min: 0,
    max: 2000,
    step: 25,
    ui: {
        showHistogram: true,
        bins: 16
    }
});

// Listen for price changes
afs.on('rangeFilter', (data) => {
    if (data.key === 'price') {
        document.querySelector('.price-display').textContent = 
            `$${data.min} - $${data.max}`;
    }
});
```

### Rating Filter

```javascript
// Rating range slider (4.0 to 5.0 stars)
afs.rangeFilter.addRangeSlider({
    key: 'rating',
    type: 'number',
    container: document.querySelector('.rating-filter'),
    min: 4.0,
    max: 5.0,
    step: 0.1
});
```

### Date Range Filter

```javascript
// Event date range filter
afs.rangeFilter.addRangeSlider({
    key: 'eventDate',
    type: 'date',
    container: document.querySelector('.date-filter'),
    min: '2024-01-01',
    max: '2024-12-31'
});

// Format date display
afs.on('rangeFilter', (data) => {
    if (data.key === 'eventDate') {
        const startDate = new Date(data.min).toLocaleDateString();
        const endDate = new Date(data.max).toLocaleDateString();
        document.querySelector('.date-display').textContent = 
            `${startDate} - ${endDate}`;
    }
});
```

### Multiple Range Filters

```javascript
// Multiple range filters working together
const afs = new AFS({
    containerSelector: '.products-grid',
    itemSelector: '.product-card'
});

// Price filter
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: document.querySelector('.price-range'),
    ui: { showHistogram: true, bins: 10 }
});

// Rating filter  
afs.rangeFilter.addRangeSlider({
    key: 'rating',
    type: 'number',
    container: document.querySelector('.rating-range'),
    min: 3.0,
    max: 5.0,
    step: 0.1
});

// Size filter (numerical sizes)
afs.rangeFilter.addRangeSlider({
    key: 'size',
    type: 'number',
    container: document.querySelector('.size-range'),
    step: 0.5
});

// All ranges work together automatically!
```

### Dynamic Range Management

```javascript
// Add ranges based on data availability
const afs = new AFS({ /* config */ });

// Check if price data exists before adding price range
const hasPrice = Array.from(document.querySelectorAll('.filter-item'))
    .some(item => item.dataset.price);

if (hasPrice) {
    afs.rangeFilter.addRangeSlider({
        key: 'price',
        type: 'number',
        container: document.querySelector('.price-range'),
        ui: { showHistogram: true }
    });
}

// Update ranges when new data is loaded
function updateRanges() {
    // Remove existing range
    afs.rangeFilter.removeRangeSlider('price');
    
    // Add new range with updated data
    afs.rangeFilter.addRangeSlider({
        key: 'price',
        type: 'number',
        container: document.querySelector('.price-range'),
        ui: { showHistogram: true }
    });
}
```

## Best Practices

### 1. Data Structure

- **Use consistent data attributes**: Store range values in `data-*` attributes
- **Proper number formatting**: Use plain numbers without currency symbols or commas
- **Date formatting**: Use ISO date strings (YYYY-MM-DD) for consistency

```html
<!-- Good: Clean data attributes -->
<div class="product" data-price="1299.99" data-rating="4.8" data-date="2024-03-15">
    Product content
</div>

<!-- Bad: Formatted data that's hard to parse -->
<div class="product" data-price="$1,299.99" data-rating="4.8/5" data-date="March 15, 2024">
    Product content  
</div>
```

### 2. Range Configuration

- **Choose appropriate step sizes**: Use meaningful intervals (e.g., $25 steps for prices)
- **Set reasonable min/max**: Don't use overly wide ranges that make precision difficult
- **Use histograms wisely**: Enable for price/quantity data, skip for sparse data

```javascript
// Good: Reasonable price range configuration
afs.rangeFilter.addRangeSlider({
    key: 'price',
    type: 'number',
    container: priceContainer,
    min: 0,
    max: 2000,
    step: 25,          // $25 increments
    ui: {
        showHistogram: true,
        bins: 12       // Good balance of detail vs. simplicity
    }
});
```

### 3. User Experience

- **Provide clear labels**: Show what the range represents
- **Display current values**: Show selected min/max values to users
- **Use meaningful containers**: Place ranges in logical UI sections

```html
<!-- Good: Clear labeling and structure -->
<div class="filter-section">
    <h3>Price Range</h3>
    <div class="price-range-container"></div>
    <div class="price-display">$0 - $1000</div>
</div>
```

### 4. Performance

- **Limit histogram bins**: 10-20 bins are usually sufficient
- **Debounce updates**: Range filtering is automatically debounced
- **Remove unused ranges**: Call `removeRangeSlider()` when ranges are no longer needed

### 5. Mobile Optimization

- **Touch-friendly sizing**: Ensure thumbs are large enough for touch interaction
- **Responsive design**: Ranges work well on mobile but consider spacing
- **Test on devices**: Verify smooth dragging on actual mobile devices

### 6. Accessibility

- **Semantic HTML**: Ranges are built with proper ARIA attributes
- **Keyboard support**: Consider adding keyboard navigation for accessibility
- **Color contrast**: Ensure sufficient contrast between range elements and background

```css
/* Example: Ensure good contrast and touch targets */
.afs-range-thumb {
    min-width: 24px;    /* Large enough for touch */
    min-height: 24px;
    background: #2563eb; /* High contrast color */
    border: 2px solid white; /* Visible boundary */
}
```

### 7. Integration

- **Combine with other filters**: Range filters work seamlessly with button filters, search, etc.
- **URL state**: Ranges participate in URL state management automatically
- **Event handling**: Listen for `rangeFilter` events to update UI and analytics

```javascript
// Good: Complete integration
afs.on('rangeFilter', (data) => {
    // Update URL
    // Update display
    // Track analytics
    analytics.track('range_filter_used', {
        filter: data.key,
        min: data.min,
        max: data.max
    });
});
```