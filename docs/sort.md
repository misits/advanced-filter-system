# Sort

`afs.sort` — reorder items by any `data-*` attribute. Numbers, ISO dates and strings are detected automatically.

## Quick start

```html
<button class="btn-sort" data-sort-key="price" data-sort-direction="asc">
  Price <span class="sort-direction"></span>
</button>
<button class="btn-sort" data-sort-key="date" data-sort-direction="desc">
  Newest <span class="sort-direction"></span>
</button>

<div class="items-container">
  <div class="filter-item" data-price="2499" data-date="2024-03-15">…</div>
  <div class="filter-item" data-price="29"   data-date="2025-01-20">…</div>
</div>
```

```javascript
const afs = new AFS({
  containerSelector: '.items-container',
  itemSelector: '.filter-item',
  sortButtonSelector: '.btn-sort',
});
```

```css
.btn-sort.sort-active { /* the active sort button */ }
```

## Button behavior

- **First click** applies the button's declared `data-sort-direction` (default `asc`).
- **Subsequent clicks** on the same button toggle the direction.
- The active button gets `activeSortClass` (default `sort-active`); if the button contains a `.sort-direction` element, it is filled with `↑` / `↓`.

## Type detection

The sort type is inferred from the first item's value:

| Value looks like | Sorted as |
|---|---|
| `42`, `3.14` | number |
| `2024-03-15` (ISO date prefix) | date |
| anything else | string (case-insensitive) |

Missing/invalid values sort last.

## API

| Method | Description |
|---|---|
| `sort(key, direction)` | Sort by one attribute (`'asc'` \| `'desc'`) |
| `sortMultiple(criteria)` | Multi-level sort: `[{ key: 'category', direction: 'asc' }, { key: 'price', direction: 'desc' }]` |
| `sortWithComparator(key, fn)` | Custom comparator `(a, b) => number` receiving raw attribute values |
| `shuffle()` | Random order (Fisher–Yates); clears the sort state |
| `reset()` | Clear sort state and button indicators (does not restore original order) |
| `getCurrentSort()` | `{ key, direction }` or `null` |
| `addSortButton(button, key, direction?)` / `removeSortButton(button)` | Register buttons dynamically |
| `destroy()` | Unbind all listeners |

```javascript
afs.sort.sort('price', 'desc');

afs.sort.sortWithComparator('title', (a, b) =>
  a.localeCompare(b, 'en', { numeric: true })
);
```

## Options

| Option | Default | Description |
|---|---|---|
| `sortButtonSelector` | `.afs-btn-sort` | Sort buttons (need `data-sort-key`) |
| `activeSortClass` | `sort-active` | Applied to the active button |

## Events

| Event | Payload |
|---|---|
| `sort` | `{ key, direction, sortType, itemCount }` |
| `sortMultiple` | `{ criteria, itemCount, sortTypes }` |
| `sortCustom` | `{ key, comparatorName, itemCount }` |
| `sortShuffled` | `{ itemCount }` |
| `sortCleared` | `{ buttonCount }` |

## Notes

- Sorting reorders the DOM; with pagination enabled, pages follow the new order automatically.
- `sortWithComparator()` does not update `getCurrentSort()` state.
- Sorting all items happens regardless of filtering — hidden items are reordered too, so they appear in the right place when revealed.
