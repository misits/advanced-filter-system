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
- [TypeScript](#typescript)
- [Best Practices](#best-practices)

## Installation

```javascript
import { DateFilter } from 'advanced-filter-system';

// As part of AFS
const afs = createAFS({
    dateFormat: 'YYYY-MM-DD'
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
<div class="filter-item" data-date="2024-03-15">Event 1</div>
<div class="filter-item" data-date="2024-04-20">Event 2</div>
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
    key: string;           // Data attribute key
    container: Element;    // Container element
    format?: string;      // Date format (default: 'YYYY-MM-DD')
    minDate?: Date;       // Minimum selectable date
    maxDate?: Date;       // Maximum selectable date
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
        <input type="date" class="afs-date-input start-date">
    </div>
    <div class="afs-date-input-wrapper">
        <label>End Date</label>
        <input type="date" class="afs-date-input end-date">
    </div>
</div>
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
afs.on('dateFilter', (data) => {
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

### Preset Ranges

```javascript
// Create preset date ranges
function createPresetRanges() {
    const today = new Date();
    
    return {
        'Last 7 Days': {
            start: new Date(today.setDate(today.getDate() - 7)),
            end: new Date()
        },
        'Last 30 Days': {
            start: new Date(today.setDate(today.getDate() - 30)),
            end: new Date()
        },
        'This Year': {
            start: new Date(today.getFullYear(), 0, 1),
            end: new Date(today.getFullYear(), 11, 31)
        }
    };
}

// Apply preset range
function applyPresetRange(presetName) {
    const ranges = createPresetRanges();
    const range = ranges[presetName];
    
    if (range) {
        afs.dateFilter.setDateRange('eventDate', range.start, range.end);
    }
}
```

## TypeScript

```typescript
interface DateRangeOptions {
    key: string;
    container: HTMLElement;
    format?: string;
    minDate?: Date;
    maxDate?: Date;
}

interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface DateFilterEvent {
    key: string;
    startDate: Date;
    endDate: Date;
}
```

## Best Practices

1. **Date Validation**

   ```javascript
   function validateDateRange(start, end) {
       if (start > end) {
           throw new Error('Start date must be before end date');
       }
       
       if (start < minDate || end > maxDate) {
           throw new Error('Dates must be within allowed range');
       }
   }
   ```

2. **Localization**

   ```javascript
   // Set locale-specific date format
   const locale = navigator.language;
   const dateFormat = new Intl.DateTimeFormat(locale).format;
   
   afs.dateFilter.addDateRange({
       key: 'date',
       container: element,
       format: dateFormat
   });
   ```

3. **Error Handling**

   ```javascript
   try {
       afs.dateFilter.setDateRange('eventDate', startDate, endDate);
   } catch (error) {
       console.error('Date range error:', error);
       // Handle error appropriately
   }
   ```

4. **Performance**

   ```javascript
   // Cache date calculations
   const cachedDates = new Map();
   
   function getFormattedDate(date, format) {
       const key = `${date.toISOString()}-${format}`;
       if (!cachedDates.has(key)) {
           cachedDates.set(key, formatDate(date, format));
       }
       return cachedDates.get(key);
   }
   ```

5. **Accessibility**

   ```javascript
   // Add ARIA labels
   const startInput = document.querySelector('.start-date');
   startInput.setAttribute('aria-label', 'Start date');
   startInput.setAttribute('aria-required', 'true');
   ```
