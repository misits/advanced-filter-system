# Input Range Documentation

## Overview

The Input Range component provides simple numerical range filtering using HTML input elements. It offers a lightweight alternative to slider-based ranges, with support for min/max inputs, automatic value calculation, and step increments. Perfect for precise numerical filtering where users prefer typing values directly.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Installation

```javascript
import { AFS } from 'advanced-filter-system';

// Initialize AFS (input range filter is accessed via afs.inputRangeFilter)
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Access input range filter functionality
const inputRangeFilter = afs.inputRangeFilter;
```

## Basic Usage

### HTML Structure

```html
<!-- Input Range Container -->
<div class="price-input-container"></div>
<div class="rating-input-container"></div>

<!-- Filterable Items with data attributes -->
<div class="filter-item" data-price="2499" data-rating="4.8">
    MacBook Pro - $2,499 - 4.8⭐
</div>

<div class="filter-item" data-price="1299" data-rating="4.5">
    iPad Pro - $1,299 - 4.5⭐
</div>
```

### JavaScript Implementation

```javascript
// Initialize AFS
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Add price input range
afs.inputRangeFilter.addInputRange({
    key: 'price',
    container: document.querySelector('.price-input-container'),
    min: 0,
    max: 3000,
    step: 50,
    label: 'Price Range'
});

// Add rating input range
afs.inputRangeFilter.addInputRange({
    key: 'rating',
    container: document.querySelector('.rating-input-container'),
    min: 4.0,
    max: 5.0,
    step: 0.1,
    label: 'Minimum Rating'
});
```

## Configuration

### Input Range Options

```javascript
// addInputRange method parameters
afs.inputRangeFilter.addInputRange({
    key: string,                    // Data attribute name (required)
    container: HTMLElement,         // DOM container element (required)
    min: number,                    // Minimum value (optional, auto-calculated if not provided)
    max: number,                    // Maximum value (optional, auto-calculated if not provided)
    step: number,                   // Step size for inputs (optional, default: 1)
    label: string                   // Label text for the input range (optional)
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | string | **required** | Data attribute name (e.g., 'price', 'rating') |
| `container` | HTMLElement | **required** | DOM element to contain the inputs |
| `min` | number | auto-calculated | Minimum value of the range |
| `max` | number | auto-calculated | Maximum value of the range |
| `step` | number | 1 | Step size for input values |
| `label` | string | '' | Display label for the input range |

## API Reference

### Core Methods

#### `addInputRange(options: InputRangeOptions): void`

Create a new input range filter with the specified configuration.

```javascript
// Complete example with all options
afs.inputRangeFilter.addInputRange({
    key: 'price',
    container: document.querySelector('.price-inputs'),
    min: 100,
    max: 2000,
    step: 25,
    label: 'Price Range ($)'
});
```

#### `getRangeValues(key: string): Object|null`

Get current values for an input range filter.

```javascript
const values = afs.inputRangeFilter.getRangeValues('price');
if (values) {
    console.log('Min:', values.min);
    console.log('Max:', values.max);
}
```

#### `setRangeValues(key: string, min: number, max: number): void`

Set input range values programmatically.

```javascript
// Set price range to $500-1500
afs.inputRangeFilter.setRangeValues('price', 500, 1500);
```

#### `removeInputRange(key: string): void`

Remove an input range filter and clean up its elements.

```javascript
// Remove price input range
afs.inputRangeFilter.removeInputRange('price');
```

### Type Definitions

```javascript
// Input range configuration
interface InputRangeOptions {
    key: string;                    // Data attribute key
    container: HTMLElement;         // Container element
    min?: number;                   // Minimum value
    max?: number;                   // Maximum value  
    step?: number;                  // Step interval
    label?: string;                 // Display label
}

// Range values
interface RangeValues {
    min: number;                    // Current minimum
    max: number;                    // Current maximum
}
```

## Events

```javascript
// Input range filter applied
afs.on('inputRangeFilter', (data) => {
    console.log('Input range updated for:', data.key);
    console.log('Min value:', data.min);
    console.log('Max value:', data.max);
});

// Listen for any filter changes (including input range filters)
afs.on('filter:applied', (data) => {
    console.log('Total visible items:', data.visible);
    console.log('Active filters:', Array.from(data.activeFilters));
});
```

## Examples

### Price Input Filter

```javascript
// Price range inputs for e-commerce
afs.inputRangeFilter.addInputRange({
    key: 'price',
    container: document.querySelector('.price-input-filter'),
    min: 0,
    max: 5000,
    step: 25,
    label: 'Price Range'
});

// Listen for price changes
afs.on('inputRangeFilter', (data) => {
    if (data.key === 'price') {
        console.log(`Price filter: $${data.min} - $${data.max}`);
    }
});
```

### Rating Input Filter

```javascript
// Rating input range (precise decimal values)
afs.inputRangeFilter.addInputRange({
    key: 'rating',
    container: document.querySelector('.rating-input-filter'),
    min: 1.0,
    max: 5.0,
    step: 0.1,
    label: 'Rating Range'
});
```

### Multiple Input Ranges

```javascript
// Multiple input ranges working together
const afs = new AFS({
    containerSelector: '.products-grid',
    itemSelector: '.product-card'
});

// Price inputs
afs.inputRangeFilter.addInputRange({
    key: 'price',
    container: document.querySelector('.price-inputs'),
    label: 'Price ($)'
});

// Rating inputs
afs.inputRangeFilter.addInputRange({
    key: 'rating',
    container: document.querySelector('.rating-inputs'),
    min: 3.0,
    max: 5.0,
    step: 0.1,
    label: 'Rating'
});

// Weight inputs
afs.inputRangeFilter.addInputRange({
    key: 'weight',
    container: document.querySelector('.weight-inputs'),
    step: 0.5,
    label: 'Weight (lbs)'
});
```

### Dynamic Input Range Management

```javascript
// Add input ranges based on data availability
const afs = new AFS({ /* config */ });

// Check if price data exists
const hasPrice = Array.from(document.querySelectorAll('.filter-item'))
    .some(item => item.dataset.price);

if (hasPrice) {
    afs.inputRangeFilter.addInputRange({
        key: 'price',
        container: document.querySelector('.price-inputs'),
        label: 'Price Range'
    });
}

// Update input ranges when new data is loaded
function updateInputRanges() {
    // Remove existing range
    afs.inputRangeFilter.removeInputRange('price');
    
    // Add new range with updated data
    afs.inputRangeFilter.addInputRange({
        key: 'price',
        container: document.querySelector('.price-inputs'),
        label: 'Updated Price Range'
    });
}
```

## Best Practices

### 1. Data Structure

- **Use clean numerical data**: Store values as plain numbers in data attributes
- **Consistent formatting**: Avoid currency symbols or commas in data attributes
- **Handle missing data**: Provide fallback values for items without data

```html
<!-- Good: Clean numerical data -->
<div class="product" data-price="1299.99" data-weight="3.5" data-rating="4.8">
    Product content
</div>

<!-- Bad: Formatted data that's hard to parse -->
<div class="product" data-price="$1,299.99" data-weight="3.5 lbs" data-rating="4.8★">
    Product content  
</div>
```

### 2. Input Range Configuration

- **Choose appropriate step sizes**: Use meaningful intervals (e.g., 0.1 for ratings, 25 for prices)
- **Set reasonable bounds**: Don't use overly wide ranges that reduce usability
- **Provide clear labels**: Help users understand what they're filtering

```javascript
// Good: Well-configured input range
afs.inputRangeFilter.addInputRange({
    key: 'price',
    container: priceContainer,
    min: 0,
    max: 2000,
    step: 25,          // $25 increments
    label: 'Price Range ($)'
});
```

### 3. User Experience

- **Clear labeling**: Show what each input represents (Min/Max)
- **Validation feedback**: Provide feedback for invalid inputs
- **Placeholder text**: Use meaningful placeholder values
- **Reset functionality**: Allow users to clear inputs easily

```html
<!-- Good: Clear structure with labels -->
<div class="input-range-section">
    <h3>Price Range</h3>
    <div class="price-inputs">
        <!-- Inputs will be added here by AFS -->
    </div>
    <button class="clear-price-range">Clear</button>
</div>
```

### 4. Input Validation

- **Handle invalid inputs**: Gracefully handle non-numerical inputs
- **Enforce bounds**: Ensure min doesn't exceed max and vice versa
- **Provide feedback**: Show users when their inputs are out of range

### 5. Performance

- **Debounce input changes**: Input changes are automatically debounced
- **Remove unused ranges**: Call `removeInputRange()` when no longer needed
- **Limit simultaneous ranges**: Too many active ranges can impact performance

### 6. Mobile Optimization

- **Touch-friendly inputs**: Ensure inputs are large enough for mobile
- **Number keyboards**: Use appropriate input types for mobile keyboards
- **Responsive layout**: Adapt input layouts for smaller screens

```css
/* Example: Mobile-friendly input styling */
.afs-input-range input {
    min-height: 44px;    /* Touch-friendly size */
    font-size: 16px;     /* Prevent zoom on iOS */
    padding: 12px;
    border-radius: 6px;
}

@media (max-width: 768px) {
    .afs-input-range {
        flex-direction: column;
        gap: 8px;
    }
}
```

### 7. Accessibility

- **Semantic HTML**: Use proper labels and form elements
- **ARIA attributes**: Include appropriate ARIA labels and descriptions
- **Keyboard navigation**: Ensure inputs are keyboard accessible
- **Screen reader support**: Provide clear context for screen readers

### 8. Integration

- **Combine with other filters**: Input ranges work seamlessly with other filter types
- **URL state**: Input ranges participate in URL state management automatically
- **Event handling**: Listen for `inputRangeFilter` events to update UI and track usage

```javascript
// Good: Complete integration example
afs.on('inputRangeFilter', (data) => {
    // Update display
    const display = document.querySelector(`#${data.key}-display`);
    display.textContent = `${data.min} - ${data.max}`;
    
    // Track analytics
    analytics.track('input_range_used', {
        filter: data.key,
        min: data.min,
        max: data.max
    });
});
```