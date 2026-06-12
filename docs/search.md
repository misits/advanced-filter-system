# Search

`afs.search` — debounced text search across the data attributes of your items, with optional match highlighting.

## Quick start

```html
<input type="search" class="filter-search" placeholder="Search…">

<div class="items-container">
  <div class="filter-item" data-title="MacBook Pro" data-categories="category:tech">…</div>
</div>
```

```javascript
const afs = new AFS({
  containerSelector: '.items-container',
  itemSelector: '.filter-item',
  searchInputSelector: '.filter-search',
  searchKeys: ['title', 'categories'],   // which data-* attributes to search
  debounceTime: 300,
});
```

Typing in the input filters items in real time. The `search` event of the input (the native ✕ clear button) and the <kbd>Enter</kbd> key are handled too.

## How matching works

- The query is split on whitespace; **every term must match** (AND), anywhere in the searched values — `mac pro` matches `data-title="MacBook Pro"`.
- Matching is case-insensitive and matches substrings (`fer` matches *Ferrari*).
- Items are matched against the `data-*` attributes listed in `searchKeys`.
- Queries shorter than `minSearchLength` (default 2) are ignored; an empty query clears the search.

## Highlighting

When `highlightMatches` is enabled, AFS wraps matched words inside elements that carry `data-search-key`:

```html
<div class="filter-item" data-title="MacBook Pro">
  <h3 data-search-key="title">MacBook Pro</h3>   <!-- words get wrapped here -->
</div>
```

```css
.afs-highlight { background: #fff3bf; }
```

Highlights are removed when the search is cleared or the item is hidden.

## API

| Method | Description |
|---|---|
| `search(query)` | Run a search programmatically |
| `setValue(value)` | Set the input value and search |
| `getValue()` | Current query (`string`) |
| `clearSearch()` | Clear input, query, highlights; show all items |
| `updateConfig({ searchKeys, minSearchLength, highlightClass, debounceTime })` | Update configuration at runtime |
| `destroy()` | Unbind listeners |

## Options

| Option | Default | Description |
|---|---|---|
| `searchInputSelector` | `.afs-filter-search` | The text input |
| `searchKeys` | `['title']` | `data-*` attributes searched |
| `debounceTime` | `300` | Delay (ms) before searching while typing |
| `minSearchLength` | `2` | Minimum query length |
| `highlightMatches` | `false` | Wrap matches in `.afs-highlight` spans |

## Events

| Event | Payload |
|---|---|
| `search` | `{ query, matches, total }` |
| `searchCleared` | — |

```javascript
afs.on('search', ({ query, matches, total }) => {
  console.log(`"${query}" matched ${matches}/${total}`);
});
```

## Notes

- Search combines with active filters: an item must satisfy both to stay visible.
- With pagination enabled, search results are paginated like any other state.
- `afs.filter.clearAllFilters()` also clears the search.
