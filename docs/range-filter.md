# Range Filter

`afs.rangeFilter` — a dual-thumb slider that filters items by a numeric (or date) `data-*` attribute, with an optional distribution histogram. Mouse and touch supported.

## Quick start

```html
<div class="price-slider"></div>

<div class="items-container">
  <div class="filter-item" data-price="199">…</div>
  <div class="filter-item" data-price="49">…</div>
</div>
```

```javascript
afs.rangeFilter.addRangeSlider({
  key: 'price',                                     // reads data-price
  type: 'number',                                   // 'number' | 'date'
  container: document.querySelector('.price-slider'), // a DOM element, not a selector
  min: 0,
  max: 1000,
  step: 10,
  ui: { showHistogram: true, bins: 12 },
});
```

> **The `container` is a DOM element.** Pass `document.querySelector(...)`, not the selector string.

## `addRangeSlider(options)`

| Property | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | — | `data-*` attribute to filter on |
| `type` | `'number' \| 'date'` | — | Date values are compared as timestamps |
| `container` | `HTMLElement` | — | Where the slider is appended |
| `min` / `max` | `number` | auto | Computed from the items when omitted |
| `step` | `number` | `1` | Thumb increment |
| `ui.showHistogram` | `boolean` | `false` | Show the value distribution behind the track |
| `ui.bins` | `number` | `10` | Histogram bar count |

## API

| Method | Description |
|---|---|
| `addRangeSlider(options)` | Create a slider |
| `setRangeValues(key, min, max)` | Move the thumbs programmatically and re-filter |
| `getRangeValues(key)` | `{ min, max, type }` (current selection) |
| `removeRangeSlider(key)` | Remove the slider from the DOM |
| `destroy()` | Remove all sliders |

## Generated markup & styling

```html
<div class="afs-range-container">
  <div class="afs-histogram">          <!-- when showHistogram -->
    <div class="afs-histogram-bar active"></div>…
  </div>
  <div class="afs-range-slider">
    <div class="afs-range-track"></div>
    <div class="afs-range-selected"></div>
    <div class="afs-range-thumb"></div>
    <div class="afs-range-thumb"></div>
  </div>
  <!-- value labels -->
</div>
```

Default colors and sizes come from the `styles.slider.ui` options (track/thumb/histogram backgrounds, radii, sizes) — see `src/core/Options.js`. Histogram bars inside the selected range get the `active` class.

## Events

| Event | Payload |
|---|---|
| `rangeFilter` | `{ key, min, max }` (after each change) |

## Notes

- Items whose value falls outside `[min, max]` (inclusive) are hidden; the range combines with regular filters and search.
- For `type: 'date'`, item values are parsed with `new Date(value)` — use ISO strings (`2024-03-15`).
- Slider values display with `toFixed(2)` for numbers and `toLocaleDateString()` for dates.
- For typed min/max inputs instead of a slider, see [Input Range Filter](input-range-filter.md).
