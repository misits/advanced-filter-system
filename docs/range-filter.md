# Range Filter Documentation

## Overview

The Range Filter component provides interactive range sliders for numerical and data-based filtering. It supports features like histograms, custom steps, and real-time updates.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [UI Customization](#ui-customization)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { RangeFilter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    rangeFilter: {
        enabled: true
    }
});

// Access range filter
const rangeFilter = afs.rangeFilter;
```

## Basic Usage

### HTML Structure

```html
<!-- Range Filter Container -->
<div id="price-range"></div>

<!-- Filterable Items -->
<div class="afs-filter-item" data-price="99.99">Product 1</div>
<div class="afs-filter-item" data-price="149.99">Product 2</div>
```

### JavaScript Implementation

```javascript
// Initialize range slider
afs.rangeFilter.addRangeSlider({
    key: 'price',
    container: document.querySelector('#price-range'),
    min: 0,
    max: 1000,
    step: 10,
    ui: {
        showHistogram: true,
        bins: 10
    }
});
```

## Configuration

### Range Options

```javascript
{
    enabled: boolean;           // Enable range filter
    key: string;               // Data attribute key
    container: Element;        // Container element
    type?: 'number';          // Filter type
    min?: number;             // Minimum value
    max?: number;             // Maximum value
    step?: number;            // Step value
    ui?: {
        showHistogram: boolean;
        bins: number;
    }
}
```

### UI Components

The range slider consists of:

- Track (background bar)
- Selected range indicator
- Min/Max thumbs
- Value labels
- Optional histogram

## UI Customization

### Basic Styling

```css
.afs-range-slider {
    width: 100%;
    height: 40px;
    margin: 20px 0;
}

.afs-range-track {
    background: #e5e7eb;
    height: 4px;
    border-radius: 2px;
}

.afs-range-thumb {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
}

.afs-range-thumb:hover {
    transform: scale(1.1);
}

.afs-range-thumb:active {
    transform: scale(0.95);
}
```

### Histogram Styling

```css
.afs-histogram {
    height: 40px;
    margin-bottom: 10px;
}

.afs-histogram-bar {
    background: #e5e7eb;
    transition: background-color 0.2s;
}

.afs-histogram-bar.afs-active {
    background: #3b82f6;
}
```

## API Reference

### Methods

#### `addRangeSlider(options: RangeOptions): void`

Add a new range slider.

```javascript
afs.rangeFilter.addRangeSlider({
    key: 'price',
    container: document.querySelector('#price-range'),
    min: 0,
    max: 1000
});
```

#### `getRangeValues(key: string): RangeValues`

Get current range values.

```javascript
const values = afs.rangeFilter.getRangeValues('price');
console.log(values.min, values.max);
```

#### `setRangeValues(key: string, min: number, max: number): void`

Set range values programmatically.

```javascript
afs.rangeFilter.setRangeValues('price', 100, 500);
```

#### `removeRangeSlider(key: string): void`

Remove a range slider.

```javascript
afs.rangeFilter.removeRangeSlider('price');
```

### Properties

```javascript
interface RangeState {
    min: number;
    max: number;
    currentMin: number;
    currentMax: number;
    step: number;
    type: 'number';
}
```

## Events

```javascript
// Range updated
afs.on('rangeFilterApplied', (data) => {
    console.log('Key:', data.key);
    console.log('Min:', data.min);
    console.log('Max:', data.max);
});

// Range created
afs.on('rangeCreated', (data) => {
    console.log('Range filter created:', data.key);
});

// Range removed
afs.on('rangeRemoved', (data) => {
    console.log('Range filter removed:', data.key);
});
```

## Examples

### Basic Range Filter

```javascript
// Simple price range
afs.rangeFilter.addRangeSlider({
    key: 'price',
    container: document.querySelector('#price-range'),
    min: 0,
    max: 1000,
    step: 10
});
```

### Range with Histogram

```javascript
// Price range with distribution histogram
afs.rangeFilter.addRangeSlider({
    key: 'price',
    container: document.querySelector('#price-range'),
    min: 0,
    max: 1000,
    step: 10,
    ui: {
        showHistogram: true,
        bins: 20
    }
});
```

### Multiple Range Filters

```javascript
// Price range
afs.rangeFilter.addRangeSlider({
    key: 'price',
    container: document.querySelector('#price-range'),
    min: 0,
    max: 1000
});

// Weight range
afs.rangeFilter.addRangeSlider({
    key: 'weight',
    container: document.querySelector('#weight-range'),
    min: 0,
    max: 100
});
```

## Best Practices

1. **Range Configuration**
   - Set appropriate min/max values
   - Use meaningful step sizes
   - Consider data distribution

2. **User Experience**
   - Provide clear value feedback
   - Use smooth animations
   - Support keyboard navigation

3. **Performance**
   - Debounce range updates
   - Optimize histogram rendering
   - Cache range calculations

4. **Accessibility**
   - Use semantic HTML
   - Include ARIA attributes
   - Support keyboard controls

5. **Error Handling**
   - Validate range values
   - Handle edge cases
   - Provide fallback UI
