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
- [Best Practices](#best-practices)

## Installation

```javascript
import { InputRange } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    inputRange: {
        enabled: true
    }
});

// Access input range
const inputRange = afs.inputRange;
```

## Basic Usage

### HTML Structure

```html
<!-- Input Range Container -->
<div id="price-filter"></div>

<!-- Filterable Items -->
<div class="afs-filter-item" data-price="99.99">Product 1</div>
<div class="afs-filter-item" data-price="149.99">Product 2</div>
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
    enabled: boolean;           // Enable input range
    key: string;               // Data attribute key
    container: Element;        // Container element
    min?: number;             // Minimum value
    max?: number;             // Maximum value
    step?: number;            // Step increment (default: 1)
    label?: string;           // Label for the range (optional)
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
        <input type="number" class="afs-input afs-input-min">
    </div>
    <div class="afs-input-wrapper">
        <label>Max</label>
        <input type="number" class="afs-input afs-input-max">
    </div>
</div>
```

### CSS Styling

```css
.afs-input-range-container {
    display: flex;
    gap: 16px;
    align-items: center;
}

.afs-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.afs-input {
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 100px;
    transition: border-color 0.2s;
}

.afs-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.afs-input:invalid {
    border-color: #ef4444;
}
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
afs.on('inputRangeApplied', (data) => {
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

// Weight range
afs.inputRange.addInputRange({
    key: 'weight',
    container: document.querySelector('#weight-filter'),
    min: 0,
    max: 100,
    step: 1,
    label: 'Weight Filter'
});
```

## Best Practices

1. **Input Configuration**
   - Set appropriate min/max values
   - Use meaningful step sizes
   - Provide clear labels

2. **User Experience**
   - Validate input values
   - Show clear error states
   - Support keyboard navigation

3. **Performance**
   - Debounce input updates
   - Validate on blur
   - Cache range calculations

4. **Accessibility**
   - Use semantic HTML
   - Include ARIA attributes
   - Support keyboard controls

5. **Error Handling**
   - Validate input values
   - Handle edge cases
   - Provide clear feedback
