# Date Filter

`afs.dateFilter` — a start/end date picker pair that filters items by a date `data-*` attribute, using native `<input type="date">` controls.

## Quick start

```html
<div class="date-range"></div>

<div class="items-container">
  <div class="filter-item" data-date="2024-03-15">…</div>
  <div class="filter-item" data-date="2025-01-20">…</div>
</div>
```

```javascript
afs.dateFilter.addDateRange({
  key: 'date',                                      // reads data-date
  container: document.querySelector('.date-range'), // a DOM element, not a selector
});
```

> **The `container` is a DOM element.** Pass `document.querySelector(...)`, not the selector string.
>
> Item dates should be ISO strings (`YYYY-MM-DD`) — they're parsed with `new Date(value)`.

## `addDateRange(options)`

| Property | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | — | `data-*` attribute to filter on |
| `container` | `HTMLElement` | — | Where the inputs are appended |
| `minDate` / `maxDate` | `Date` | auto | Computed from the items when omitted (fallback: current year) |
| `format` | `string` | `dateFormat` option (`YYYY-MM-DD`) | Stored for reference; the native inputs use ISO format |

## API

| Method | Description |
|---|---|
| `addDateRange(options)` | Create the date inputs |
| `setDateRange(key, startDate, endDate)` | Set the range programmatically (`Date` objects) and re-filter |
| `getDateRange(key)` | `{ startDate, endDate }` (current selection) |
| `removeDateRange(key)` | Remove the widget from the DOM |

## Generated markup & styling

```html
<div class="afs-date-range-container">
  <div class="afs-date-input-wrapper">
    <input type="date" class="afs-date-input start-date">
  </div>
  <div class="afs-date-input-wrapper">
    <input type="date" class="afs-date-input end-date">
  </div>
</div>
```

## Events

| Event | Payload |
|---|---|
| `dateFilter` | `{ key, startDate, endDate }` (after each change) |

## Notes

- Comparison is **day-inclusive**: the start date counts from 00:00 and the end date until 23:59, and item dates are compared at midnight — an item dated exactly on a boundary is included.
- Changes are debounced (300 ms, on the `change` event).
- Items with a missing or invalid date are hidden while the range is active.
- Active date ranges are reflected in the URL as `dateRange_<key>`; see [URL Manager](url-manager.md).
