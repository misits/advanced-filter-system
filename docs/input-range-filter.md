# Input Range Filter

`afs.inputRangeFilter` — min/max number inputs for filtering by a numeric `data-*` attribute. A lightweight alternative to the [slider](range-filter.md) when users prefer typing exact values.

## Quick start

```html
<div class="rating-range"></div>

<div class="items-container">
  <div class="filter-item" data-rating="4.5">…</div>
  <div class="filter-item" data-rating="3.8">…</div>
</div>
```

```javascript
afs.inputRangeFilter.addInputRange({
  key: 'rating',                                      // reads data-rating
  container: document.querySelector('.rating-range'), // a DOM element, not a selector
  min: 0,
  max: 5,
  step: 0.5,
  label: 'Rating',
});
```

> **The `container` is a DOM element.** Pass `document.querySelector(...)`, not the selector string.

## `addInputRange(options)`

| Property | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | — | `data-*` attribute to filter on |
| `container` | `HTMLElement` | — | Where the inputs are appended |
| `min` / `max` | `number` | auto | Computed from the items when omitted (fallback `0–100`) |
| `step` | `number` | `1` | Input step |
| `label` | `string` | `''` | Optional label rendered above the inputs |

## API

| Method | Description |
|---|---|
| `addInputRange(options)` | Create the min/max inputs |
| `setRange(key, min, max)` | Set values programmatically and re-filter |
| `getRange(key)` | `{ min, max }` (current selection) |
| `removeInputRange(key)` | Remove the widget from the DOM |

## Generated markup & styling

```html
<div class="afs-input-range-container">
  <div class="afs-input-range-label">Rating</div>
  <div class="afs-input-wrapper">
    <span class="afs-input-label">Min</span>
    <input type="number" class="afs-input min">
  </div>
  <div class="afs-input-wrapper">
    <span class="afs-input-label">Max</span>
    <input type="number" class="afs-input max">
  </div>
</div>
```

## Events

| Event | Payload |
|---|---|
| `inputRangeFilter` | `{ key, min, max }` (after each change) |

## Notes

- Input is debounced (300 ms) and values are clamped: typing a min greater than max auto-corrects the pair.
- Items with a missing or non-numeric `data-*` value are hidden while the range is active.
- Bounds are also enforced at the HTML level via the inputs' `min`/`max`/`step` attributes.
