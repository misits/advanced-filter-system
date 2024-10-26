# Input Range Documentation

## Overview

The Input Range component provides numerical range filtering capabilities with support for minimum and maximum values, step increments, and a clean input interface.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [UI Components](#ui-components)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { InputRange } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS();

// Access input range
const inputRange = afs.inputRange;
```

## Basic Usage

### HTML Structure

```html
<!-- Input Range Container -->
<div id="price-filter"></div>

<!-- Filterable Items -->
<div class="filter-item" data-price="99.99">Product 1</div>
<div class="filter-item" data-price="149.99">Product 2</div>
```

### JavaScript Implementation

```javascript
// Initialize input range
afs.inputRange.addInputRange({
    key: 'price',
    container: document.querySelector('#price-filter'),
    min: 0,
    max: 1000,
    step: 10,
    label: 'Price Range'
});
```

## Configuration

### Input Range Options

```javascript
{
    key: string;           // Data attribute key
    container: Element;    // Container element
    min?: number;         // Minimum value
    max?: number;         // Maximum value
    step?: number;        // Step increment (default: 1)
    label?: string;       // Label for the range (optional)
}
```

## UI Components

The input range consists of:

- Range label (optional)
- Minimum value input
- Maximum value input
- Labels for inputs

### Default HTML Structure

```html
<div class="afs-input-range-container">
    <div class="afs-input-wrapper">
        <label>Min</label>
        <input type="number" class="afs-input min">
    </div>
    <div class="afs-input-wrapper">
        <label>Max</label>
        <input type="number" class="afs-input max">
    </div>
</div>
```

## API Reference

### Methods

#### `addInputRange(options: InputRangeOptions): void`

Add a new input range filter.

```javascript
afs.inputRange.addInputRange({
    key: 'price',
    container: document.querySelector('#price-filter'),
    min: 0,
    max: 1000
});
```

#### `getRange(key: string): RangeValues`

Get current range values.

```javascript
const range = afs.inputRange.getRange('price');
console.log(range.min, range.max);
```

#### `setRange(key: string, min: number, max: number): void`

Set range values programmatically.

```javascript
afs.inputRange.setRange('price', 100, 500);
```

#### `removeInputRange(key: string): void`

Remove an input range filter.

```javascript
afs.inputRange.removeInputRange('price');
```

### Properties

```javascript
interface RangeValues {
    min: number;
    max: number;
}

interface RangeState {
    min: number;
    max: number;
    step: number;
    currentMin: number;
    currentMax: number;
}
```

## Events

```javascript
// Range changed
afs.on('inputRangeFilter', (data) => {
    console.log('Key:', data.key);
    console.log('Min:', data.min);
    console.log('Max:', data.max);
});

// Range created
afs.on('inputRangeCreated', (data) => {
    console.log('Input range created:', data.key);
});

// Range removed
afs.on('inputRangeRemoved', (data) => {
    console.log('Input range removed:', data.key);
});
```

## Examples

### Basic Range Filter

```javascript
// Simple price range
afs.inputRange.addInputRange({
    key: 'price',
    container: document.querySelector('#price-filter'),
    min: 0,
    max: 1000
});
```

### Custom Step Value

```javascript
// Range with custom step
afs.inputRange.addInputRange({
    key: 'quantity',
    container: document.querySelector('#quantity-filter'),
    min: 0,
    max: 100,
    step: 5
});
```

### Multiple Range Filters

```javascript
// Price range
afs.inputRange.addInputRange({
    key: 'price',
    container: document.querySelector('#price-filter'),
    label: 'Price Range'
});

// Rating range
afs.inputRange.addInputRange({
    key: 'rating',
    container: document.querySelector('#rating-filter'),
    min: 0,
    max: 5,
    step: 0.5,
    label: 'Rating Filter'
});
```

### Dynamic Range Calculation

```javascript
// Calculate range based on items
function calculatePriceRange() {
    const prices = Array.from(items).map(item => 
        parseFloat(item.dataset.price)
    ).filter(price => !isNaN(price));

    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
}

// Apply dynamic range
const priceRange = calculatePriceRange();
afs.inputRange.setRange('price', priceRange.min, priceRange.max);
```

## TypeScript

```typescript
interface InputRangeOptions {
    key: string;
    container: HTMLElement;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
}

interface RangeValues {
    min: number;
    max: number;
}

interface InputRangeEvent {
    key: string;
    min: number;
    max: number;
}
```

## Best Practices

1. **Value Validation**

   ```javascript
   function validateRange(min, max) {
       if (min > max) {
           throw new Error('Minimum value must be less than maximum value');
       }
       
       if (min < absMin || max > absMax) {
           throw new Error('Values must be within allowed range');
       }
   }
   ```

2. **Number Formatting**

   ```javascript
   // Format number display
   const formatter = new Intl.NumberFormat(locale, {
       style: 'decimal',
       minimumFractionDigits: 0,
       maximumFractionDigits: 2
   });
   
   afs.inputRange.addInputRange({
       key: 'price',
       container: element,
       formatter: formatter.format
   });
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.inputRange.setRange('price', min, max);
   } catch (error) {
       console.error('Range error:', error);
       // Handle error appropriately
   }
   ```

4. **Input Debouncing**

   ```javascript
   // Debounce input updates
   const debouncedUpdate = debounce(value => {
       afs.inputRange.setRange('price', value.min, value.max);
   }, 300);
   ```

5. **Accessibility**

   ```javascript
   // Add ARIA attributes
   const minInput = document.querySelector('.min-input');
   minInput.setAttribute('aria-label', 'Minimum value');
   minInput.setAttribute('aria-required', 'true');
   ```

## Integration with Filter System

```javascript
// Integration with main filter system
afs.on('inputRangeFilter', (data) => {
    afs.filter.applyInputRangeFilter(data.key, data.min, data.max);
});

// Clear filters
afs.filter.on('filtersCleared', () => {
    // Reset all input ranges to their initial values
    afs.inputRange.activeRanges.forEach((range, key) => {
        afs.inputRange.setRange(key, range.state.min, range.state.max);
    });
});
```
