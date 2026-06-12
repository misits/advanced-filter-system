# Pagination

`afs.pagination` — split the visible items into pages, with generated page controls, items-per-page and optional scroll-to-top. Pagination is fully aware of active filters, search and sort order.

## Quick start

```html
<div class="items-container">
  <div class="filter-item">…</div>
  <!-- … -->
</div>

<!-- AFS renders the page controls inside this element -->
<div class="afs-pagination-container"></div>
```

```javascript
const afs = new AFS({
  containerSelector: '.items-container',
  itemSelector: '.filter-item',
  pagination: {
    enabled: true,
    itemsPerPage: 12,
    showPrevNext: true,
    scrollToTop: true,
  },
});
```

```css
.filter-item.hidden { display: none !important; }

.afs-pagination { display: flex; gap: .5rem; }
.afs-page-button { /* page button */ }
.afs-page-button.afs-page-active { /* current page */ }
```

## Options

| Option | Default | Description |
|---|---|---|
| `pagination.enabled` | `false` | Master switch |
| `pagination.itemsPerPage` | `10` | Items per page |
| `pagination.container` | `.afs-pagination-container` | Where the controls are rendered |
| `pagination.showPrevNext` | — | Render `‹` / `›` buttons |
| `pagination.maxButtons` | `7` | Max page buttons before ellipsis |
| `pagination.pageButtonClass` | `afs-page-button` | Class on each button |
| `pagination.activePageClass` | `afs-page-active` | Class on the current page button |
| `pagination.containerClass` | `afs-pagination` | Class on the generated wrapper |
| `pagination.scrollToTop` | `false` | Scroll back to the top of the items list on page change |
| `pagination.scrollOffset` | `50` | Pixels subtracted from the scroll target |
| `pagination.scrollBehavior` | `smooth` | `'smooth'` \| `'auto'` |
| `pagination.animationType` | `fade` | Animation applied to page items |

## Generated markup

```html
<div class="afs-pagination-container">      <!-- yours -->
  <div class="afs-pagination">              <!-- generated -->
    <button class="afs-page-button afs-pagination-prev" data-page="1">‹</button>
    <button class="afs-page-button afs-page-active" data-page="1">1</button>
    <button class="afs-page-button" data-page="2">2</button>
    <span class="afs-pagination-ellipsis">…</span>
    <button class="afs-page-button" data-page="9">9</button>
    <button class="afs-page-button afs-pagination-next" data-page="2">›</button>
  </div>
</div>
```

The wrapper is hidden automatically when there is a single page. Prev/next buttons are `disabled` at the boundaries.

## API

| Method | Description |
|---|---|
| `goToPage(page)` | Navigate (clamped to `1..totalPages`) |
| `nextPage()` / `previousPage()` | Relative navigation |
| `firstPage()` / `lastPage()` | Jump to the ends |
| `setItemsPerPage(count)` | Change page size and go back to page 1 |
| `getPageInfo()` | `{ currentPage, itemsPerPage, totalPages }` |
| `getCurrentPage()` / `getTotalPages()` / `getItemsPerPage()` | State getters |
| `setPaginationMode(enabled)` | Enable/disable at runtime (disabled = show all) |
| `update()` | Recompute pages (called automatically on filter/search/sort) |
| `destroy()` | Remove the generated controls |

```javascript
afs.pagination.goToPage(2);
afs.pagination.setItemsPerPage(24);
const { currentPage, totalPages } = afs.pagination.getPageInfo();
```

## Events

| Event | Payload |
|---|---|
| `pagination` | `{ currentPage, totalPages, itemsPerPage, visibleItems }` (every update) |
| `pageChanged` | `{ previousPage, currentPage, totalPages }` |
| `paginationModeChanged` | `{ enabled }` |

## Behavior notes

- **Pages follow the sort order** — items are paged by their current DOM position.
- **Filters reset the page when needed** — if the current page no longer exists after filtering, AFS clamps to the last valid page.
- **`scrollToTop` targets the items list** (your `containerSelector`), not the pagination controls, offset by `scrollOffset`.
- **URL** — the current page is reflected as `?page=N` (and `perPage=N` when it differs from the default); see [URL Manager](url-manager.md).
- When pagination is disabled, all matching items are simply shown.

## TypeScript

```typescript
interface PaginationOptions {
  enabled?: boolean;
  itemsPerPage?: number;
  container?: string;
  showPrevNext?: boolean;
  maxButtons?: number;
  pageButtonClass?: string;
  activePageClass?: string;
  containerClass?: string;
  scrollToTop?: boolean;
  scrollOffset?: number;
  scrollBehavior?: 'smooth' | 'auto';
  animationType?: string;
}
```
