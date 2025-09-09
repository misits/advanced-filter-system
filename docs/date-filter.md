# Date Filter Documentation

## Overview

The Date Filter component provides specialized date range filtering with support for various date formats, automatic date parsing, and intuitive date picker interfaces. Perfect for filtering events, publications, deadlines, or any time-based data with proper date handling and validation.

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

// Initialize AFS (date filter is accessed via afs.dateFilter)
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Access date filter functionality
const dateFilter = afs.dateFilter;
```

## Basic Usage

### HTML Structure

```html
<!-- Date Range Container -->
<div class="event-date-container"></div>
<div class="publish-date-container"></div>

<!-- Filterable Items with data attributes -->
<div class="filter-item" 
     data-eventDate="2024-03-15" 
     data-publishDate="2024-02-10">
    Spring Conference - March 15, 2024
</div>

<div class="filter-item" 
     data-eventDate="2024-06-20" 
     data-publishDate="2024-01-05">
    Summer Workshop - June 20, 2024
</div>
```

### JavaScript Implementation

```javascript
// Initialize AFS
const afs = new AFS({
    containerSelector: '.items-container',
    itemSelector: '.filter-item'
});

// Add event date range filter
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('.event-date-container'),
    minDate: new Date('2024-01-01'),
    maxDate: new Date('2024-12-31'),
    format: 'YYYY-MM-DD'
});

// Add publish date range filter
afs.dateFilter.addDateRange({
    key: 'publishDate',
    container: document.querySelector('.publish-date-container'),
    minDate: new Date('2023-01-01'),
    maxDate: new Date(),  // Current date
    format: 'YYYY-MM-DD'
});
```

## Configuration

### Date Range Options

```javascript
// addDateRange method parameters
afs.dateFilter.addDateRange({
    key: string,                    // Data attribute name (required)
    container: HTMLElement,         // DOM container element (required)
    minDate: Date,                  // Minimum date (optional, auto-calculated if not provided)
    maxDate: Date,                  // Maximum date (optional, auto-calculated if not provided)
    format: string                  // Date format (optional, default: 'YYYY-MM-DD')
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | string | **required** | Data attribute name (e.g., 'eventDate', 'publishDate') |
| `container` | HTMLElement | **required** | DOM element to contain the date picker |
| `minDate` | Date | auto-calculated | Minimum date of the range |
| `maxDate` | Date | auto-calculated | Maximum date of the range |
| `format` | string | 'YYYY-MM-DD' | Date format for parsing and display |

## API Reference

### Core Methods

#### `addDateRange(options: DateRangeOptions): void`

Create a new date range filter with the specified configuration.

```javascript
// Complete example with all options
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('.date-picker'),
    minDate: new Date('2024-01-01'),
    maxDate: new Date('2024-12-31'),
    format: 'YYYY-MM-DD'
});
```

#### `getDateValues(key: string): Object|null`

Get current date values for a date range filter.

```javascript
const values = afs.dateFilter.getDateValues('eventDate');
if (values) {
    console.log('Start date:', values.startDate);
    console.log('End date:', values.endDate);
    console.log('Format:', values.format);
}
```

#### `setDateValues(key: string, startDate: Date, endDate: Date): void`

Set date range values programmatically.

```javascript
// Set event date range to March-June 2024
afs.dateFilter.setDateValues(
    'eventDate', 
    new Date('2024-03-01'), 
    new Date('2024-06-30')
);
```

#### `removeDateRange(key: string): void`

Remove a date range filter and clean up its elements.

```javascript
// Remove event date range
afs.dateFilter.removeDateRange('eventDate');
```

### Type Definitions

```javascript
// Date range configuration
interface DateRangeOptions {
    key: string;                    // Data attribute key
    container: HTMLElement;         // Container element
    minDate?: Date;                 // Minimum date
    maxDate?: Date;                 // Maximum date  
    format?: string;                // Date format
}

// Date values
interface DateValues {
    startDate: Date;                // Current start date
    endDate: Date;                  // Current end date
    format: string;                 // Date format used
}
```

## Events

```javascript
// Date range filter applied
afs.on('dateFilter', (data) => {
    console.log('Date range updated for:', data.key);
    console.log('Start date:', data.startDate);
    console.log('End date:', data.endDate);
});

// Listen for any filter changes (including date filters)
afs.on('filter:applied', (data) => {
    console.log('Total visible items:', data.visible);
    console.log('Active filters:', Array.from(data.activeFilters));
});
```

## Examples

### Event Date Filter

```javascript
// Event date range filter
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('.event-date-filter'),
    minDate: new Date('2024-01-01'),
    maxDate: new Date('2024-12-31'),
    format: 'YYYY-MM-DD'
});

// Listen for date changes
afs.on('dateFilter', (data) => {
    if (data.key === 'eventDate') {
        const start = data.startDate.toLocaleDateString();
        const end = data.endDate.toLocaleDateString();
        console.log(`Event dates: ${start} - ${end}`);
    }
});
```

### Publication Date Filter

```javascript
// Publication date filter (last 2 years)
const twoYearsAgo = new Date();
twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

afs.dateFilter.addDateRange({
    key: 'publishDate',
    container: document.querySelector('.publish-date-filter'),
    minDate: twoYearsAgo,
    maxDate: new Date(),  // Today
    format: 'YYYY-MM-DD'
});
```

### Multiple Date Ranges

```javascript
// Multiple date ranges working together
const afs = new AFS({
    containerSelector: '.articles-grid',
    itemSelector: '.article-card'
});

// Publication date range
afs.dateFilter.addDateRange({
    key: 'publishDate',
    container: document.querySelector('.publish-date-range')
});

// Last updated date range
afs.dateFilter.addDateRange({
    key: 'lastUpdated',
    container: document.querySelector('.update-date-range'),
    format: 'YYYY-MM-DD'
});

// Event date range
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: document.querySelector('.event-date-range'),
    minDate: new Date(),  // From today onwards
    maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)  // One year from now
});
```

### Dynamic Date Management

```javascript
// Add date ranges based on data availability
const afs = new AFS({ /* config */ });

// Check if event date data exists
const hasEventDate = Array.from(document.querySelectorAll('.filter-item'))
    .some(item => item.dataset.eventDate);

if (hasEventDate) {
    afs.dateFilter.addDateRange({
        key: 'eventDate',
        container: document.querySelector('.event-date-range')
    });
}

// Update date ranges when new data is loaded
function updateDateRanges() {
    // Remove existing range
    afs.dateFilter.removeDateRange('eventDate');
    
    // Add new range with updated data
    afs.dateFilter.addDateRange({
        key: 'eventDate',
        container: document.querySelector('.event-date-range'),
        format: 'YYYY-MM-DD'
    });
}
```

### Custom Date Format Handling

```javascript
// Handle different date formats
afs.dateFilter.addDateRange({
    key: 'customDate',
    container: document.querySelector('.custom-date-filter'),
    format: 'MM/DD/YYYY'  // US format
});

// Listen for changes and format display
afs.on('dateFilter', (data) => {
    if (data.key === 'customDate') {
        // Format for display
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const start = data.startDate.toLocaleDateString('en-US', options);
        const end = data.endDate.toLocaleDateString('en-US', options);
        
        document.querySelector('.date-display').textContent = 
            `${start} - ${end}`;
    }
});
```

## Best Practices

### 1. Data Structure

- **Use ISO date format**: Store dates as ISO strings (YYYY-MM-DD) in data attributes
- **Consistent formatting**: Use the same date format across all items
- **Handle invalid dates**: Provide fallback values for items with invalid dates

```html
<!-- Good: Consistent ISO date format -->
<div class="event" 
     data-eventDate="2024-03-15" 
     data-publishDate="2024-02-10" 
     data-deadline="2024-04-01">
    Event content
</div>

<!-- Bad: Inconsistent date formats -->
<div class="event" 
     data-eventDate="March 15, 2024" 
     data-publishDate="2/10/24" 
     data-deadline="04-01-2024">
    Event content  
</div>
```

### 2. Date Range Configuration

- **Set reasonable bounds**: Don't use overly wide date ranges
- **Consider timezone**: Be aware of timezone implications for date filtering
- **Use meaningful defaults**: Set sensible min/max dates for your use case

```javascript
// Good: Reasonable date range for events
const thisYear = new Date().getFullYear();
afs.dateFilter.addDateRange({
    key: 'eventDate',
    container: eventContainer,
    minDate: new Date(`${thisYear}-01-01`),
    maxDate: new Date(`${thisYear + 1}-12-31`),
    format: 'YYYY-MM-DD'
});
```

### 3. User Experience

- **Clear labeling**: Show what date range represents
- **Date format hints**: Show expected date format to users
- **Validation feedback**: Provide feedback for invalid date selections
- **Calendar integration**: Consider integrating with date picker libraries

```html
<!-- Good: Clear structure with labels and hints -->
<div class="date-filter-section">
    <h3>Event Date Range</h3>
    <div class="event-date-range">
        <!-- Date inputs will be added here by AFS -->
    </div>
    <small class="format-hint">Format: YYYY-MM-DD</small>
</div>
```

### 4. Date Parsing and Validation

- **Handle parsing errors**: Gracefully handle invalid date strings
- **Validate date ranges**: Ensure start date doesn't exceed end date
- **Support multiple formats**: Consider supporting common date formats

### 5. Performance

- **Cache date calculations**: Date parsing and comparison can be expensive
- **Remove unused ranges**: Call `removeDateRange()` when no longer needed
- **Optimize for large datasets**: Consider date indexing for very large item sets

### 6. Mobile Optimization

- **Touch-friendly inputs**: Ensure date inputs work well on mobile
- **Native date pickers**: Use HTML5 date inputs when appropriate
- **Responsive layout**: Adapt date filter layouts for smaller screens

```css
/* Example: Mobile-friendly date inputs */
.afs-date-range input[type="date"] {
    min-height: 44px;    /* Touch-friendly size */
    font-size: 16px;     /* Prevent zoom on iOS */
    padding: 12px;
    border-radius: 6px;
    width: 100%;
}

@media (max-width: 768px) {
    .afs-date-range {
        flex-direction: column;
        gap: 12px;
    }
}
```

### 7. Accessibility

- **Semantic HTML**: Use proper date inputs and labels
- **ARIA attributes**: Include appropriate ARIA labels for date ranges
- **Keyboard navigation**: Ensure date controls are keyboard accessible
- **Screen reader support**: Provide clear context for date selections

### 8. Integration

- **Combine with other filters**: Date ranges work seamlessly with other filter types
- **URL state**: Date ranges participate in URL state management automatically
- **Event handling**: Listen for `dateFilter` events to update UI and track usage

```javascript
// Good: Complete integration example
afs.on('dateFilter', (data) => {
    // Update display
    const display = document.querySelector(`#${data.key}-display`);
    const start = data.startDate.toLocaleDateString();
    const end = data.endDate.toLocaleDateString();
    display.textContent = `${start} - ${end}`;
    
    // Track analytics
    analytics.track('date_filter_used', {
        filter: data.key,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        dayRange: Math.ceil((data.endDate - data.startDate) / (1000 * 60 * 60 * 24))
    });
});
```

### 9. Timezone Considerations

- **Consistent timezone handling**: Use UTC dates when possible to avoid timezone issues
- **Local vs UTC**: Be clear about whether dates represent local time or UTC
- **Display formatting**: Format dates appropriately for the user's locale

```javascript
// Good: Consistent UTC date handling
const utcDate = new Date('2024-03-15T00:00:00Z');
afs.dateFilter.setDateValues('eventDate', utcDate, utcDate);

// Format for display in user's locale
const displayDate = utcDate.toLocaleDateString(navigator.language);
```