# Date Filter Documentation

## Overview

The Date Filter component provides date range filtering capabilities with support for various date formats, custom ranges, and intuitive date picker interfaces.

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
import { DateFilter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    dateFilter: {
        enabled: true,
        format: 'YYYY-MM-DD'
    }
});

// Access date filter
const dateFilter = afs.dateFilter;
```

## Basic Usage

### HTML Structure

```html
<!-- Date Filter Container -->
<div id="date-filter"></div>

<!-- Filterable Items -->
<div class="afs-filter-item" data-date="2024-03-15">Event 1</div>
<div class="afs-filter-item" data-date="2024-04-20">Event 2</div>
```

### JavaScript Implementation

```javascript
// Initialize date range
afs.dateFilter.addDateRange({
    key: 'date',
    container: document.querySelector('#date-filter'),
    format: 'YYYY-MM-DD',
    minDate: new Date('2024-01-01'),
    maxDate: new Date('2024-12-31')
});
```

## Configuration

### Date Range Options

```javascript
{
    enabled: boolean;           // Enable date filter
    key: string;               // Data attribute key
    container: Element;        // Container element
    format?: string;          // Date format (default: 'YYYY-MM-DD')
    minDate?: Date;           // Minimum selectable date
    maxDate?: Date;           // Maximum selectable date
}
```

### Supported Date Formats

```javascript
const formats = {
    'YYYY-MM-DD': '2024-03-15',
    'DD-MM-YYYY': '15-03-2024',
    'MM/DD/YYYY': '03/15/2024'
};
```

## UI Components

The date filter consists of:

- Start date input
- End date input
- Date picker calendars
- Clear button
- Apply button

### Default HTML Structure

```html
<div class="afs-date-range-container">
    <div class="afs-date-input-wrapper">
        <label>Start Date</label>
        <input type="date" class="afs-date-input afs-date-input-start">
    </div>
    <div class="afs-date-input-wrapper">
        <label>End Date</label>
        <input type="date" class="afs-date-input afs-date-input-end">
    </div>
</div>
```

### CSS Styling

```css
.afs-date-range-container {
    display: flex;
    gap: 16px;
    align-items: center;
}

.afs-date-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.afs-date-input {
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    width: 150px;
    transition: border-color 0.2s;
}

.afs-date-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.afs-date-input:invalid {
    border-color: #ef4444;
}

.afs-date-picker {
    position: absolute;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    z-index: 50;
}
```

## API Reference

### Methods

#### `addDateRange(options: DateRangeOptions): void`

Add a new date range filter.

```javascript
afs.dateFilter.addDateRange({
    key: 'published',
    container: document.querySelector('#date-filter'),
    format: 'YYYY-MM-DD'
});
```

#### `getDateRange(key: string): DateRange`

Get current date range.

```javascript
const range = afs.dateFilter.getDateRange('published');
console.log(range.startDate, range.endDate);
```

#### `setDateRange(key: string, startDate: Date, endDate: Date): void`

Set date range programmatically.

```javascript
afs.dateFilter.setDateRange('published', 
    new Date('2024-01-01'), 
    new Date('2024-12-31')
);
```

#### `removeDateRange(key: string): void`

Remove a date range filter.

```javascript
afs.dateFilter.removeDateRange('published');
```

### Properties

```javascript
interface DateRange {
    startDate: Date;
    endDate: Date;
    format: string;
}

interface DateState {
    min: Date;
    max: Date;
    current: {
        start: Date;
        end: Date;
    };
}
```

## Events

```javascript
// Date range changed
afs.on('dateFilterApplied', (data) => {
    console.log('Key:', data.key);
    console.log('Start:', data.startDate);
    console.log('End:', data.endDate);
});

// Date range created
afs.on('dateRangeCreated', (data) => {
    console.log('Date range created:', data.key);
});

// Date range removed
afs.on('dateRangeRemoved', (data) => {
    console.log('Date range removed:', data.key);
});
```

## Examples

### Basic Date Range Filter

```javascript
// Simple date range
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('#date-filter')
});
```

### Custom Date Format

```javascript
// European date format
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('#date-filter'),
    format: 'DD-MM-YYYY'
});
```

### Multiple Date Ranges

```javascript
// Event date range
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('#event-date-filter')
});

// Publication date range
afs.dateFilter.addDateRange({
    key: 'publishedDate',
    container: document.querySelector('#pub-date-filter')
});
```

## Best Practices

1. **Date Configuration**
   - Use consistent date formats
   - Set appropriate date ranges
   - Handle timezone differences

2. **User Experience**
   - Provide clear date feedback
   - Support keyboard navigation
   - Show date validation errors

3. **Performance**
   - Debounce date updates
   - Cache date calculations
   - Optimize date picker rendering

4. **Accessibility**
   - Use semantic HTML
   - Include ARIA attributes
   - Support keyboard controls

5. **Error Handling**
   - Validate date inputs
   - Handle invalid dates
   - Provide clear feedback
