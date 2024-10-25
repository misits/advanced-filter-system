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
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { RangeFilter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    // Range filter configurations
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
<div class="filter-item" data-price="99.99">Product 1</div>
<div class="filter-item" data-price="149.99">Product 2</div>
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
    key: string;           // Data attribute key
    container: Element;    // Container element
    type?: 'number';      // Filter type
    min?: number;         // Minimum value
    max?: number;         // Maximum value
    step?: number;        // Step value
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
}

.afs-histogram-bar.active {
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
afs.on('rangeFilter', (data) => {
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

// Rating range
afs.rangeFilter.addRangeSlider({
    key: 'rating',
    container: document.querySelector('#rating-range'),
    min: 0,
    max: 5,
    step: 0.5
});
```

### Dynamic Updates

```javascript
// Update range values programmatically
function updatePriceRange(min, max) {
    afs.rangeFilter.setRangeValues('price', min, max);
}

// React to range changes
afs.on('rangeFilter', (data) => {
    if (data.key === 'price') {
        updateProductList(data.min, data.max);
    }
});
```

## TypeScript

```typescript
interface RangeOptions {
    key: string;
    container: HTMLElement;
    type?: 'number';
    min?: number;
    max?: number;
    step?: number;
    ui?: {
        showHistogram: boolean;
        bins: number;
    };
}

interface RangeValues {
    min: number;
    max: number;
    type: string;
}

interface RangeFilterEvent {
    key: string;
    min: number;
    max: number;
}
```

## Best Practices

1. **Performance**

   ```javascript
   // Optimize histogram calculation
   const options = {
       ui: {
           showHistogram: true,
           bins: 10 // Balance between detail and performance
       }
   };
   ```

2. **Responsive Design**

   ```javascript
   // Listen for container resize
   window.addEventListener('resize', debounce(() => {
       afs.rangeFilter.refresh();
   }, 250));
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.rangeFilter.setRangeValues('price', min, max);
   } catch (error) {
       console.error('Range error:', error);
       // Handle error appropriately
   }
   ```

4. **Accessibility**

   ```javascript
   // Add ARIA attributes
   const slider = document.querySelector('.afs-range-slider');
   slider.setAttribute('role', 'slider');
   slider.setAttribute('aria-valuemin', min);
   slider.setAttribute('aria-valuemax', max);
   ```
