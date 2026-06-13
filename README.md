# Advanced Filter System (AFS)

A flexible, dependency-free JavaScript library for filtering DOM elements — with search, sorting, range filters, pagination and URL state built in.

[Live Demo](https://misits.github.io/advanced-filter-system) · [NPM](https://www.npmjs.com/package/advanced-filter-system) · [Documentation](docs/README.md)

## Features

- **Filtering** — buttons, checkboxes, radios and dropdowns, with OR / AND / mixed logic configurable per filter type
- **Search** — debounced text search across any data attributes, with optional match highlighting
- **Sorting** — by any data attribute (numbers, dates, strings auto-detected), multi-criteria, custom comparators, shuffle
- **Range filters** — draggable sliders (with optional histogram), min/max number inputs, date ranges
- **Pagination** — page controls, items-per-page, smooth scroll-to-top, fully aware of active filters and sort order
- **URL state** — the full filter state lives in the URL: shareable links, restored on load, updated via `replaceState` so it never floods browser history
- **Animations** — fade, slide, scale, flip, rotate, zoom, bounce, blur and more
- **TypeScript** — complete type definitions included

## Installation

```bash
npm install advanced-filter-system
```

Or via CDN:

```html
<script type="module">
  import { AFS } from 'https://unpkg.com/advanced-filter-system@latest/dist/afs.modern.js';
</script>
```

## Quick start

A minimal, complete setup — filter buttons, search, counter and pagination:

```html
<!-- Filter controls -->
<button class="btn-filter" data-filter="*">All</button>
<button class="btn-filter" data-filter="category:tech">Tech</button>
<button class="btn-filter" data-filter="category:design">Design</button>

<!-- Search and counter -->
<input type="text" class="filter-search" placeholder="Search…">
<div class="filter-counter"></div>

<!-- Items: data-categories holds space-separated "type:value" pairs -->
<div class="items-container">
  <div class="filter-item" data-categories="category:tech brand:apple"
       data-title="MacBook Pro" data-price="2499">
    MacBook Pro — $2,499
  </div>
  <div class="filter-item" data-categories="category:design brand:moleskine"
       data-title="Sketchbook" data-price="29">
    Sketchbook — $29
  </div>
</div>

<!-- Pagination controls are rendered in here -->
<div class="afs-pagination-container"></div>
```

```javascript
import { AFS } from 'advanced-filter-system';

const afs = new AFS({
  containerSelector: '.items-container',   // required
  itemSelector: '.filter-item',            // required
  filterButtonSelector: '.btn-filter',
  searchInputSelector: '.filter-search',
  counterSelector: '.filter-counter',
  searchKeys: ['title', 'categories'],
  pagination: { enabled: true, itemsPerPage: 12 },
  animation: { type: 'fade', duration: 300 },
});
```

```css
/* AFS toggles these two classes — style them however you like */
.btn-filter.active { background: #000; color: #fff; }
.filter-item.hidden { display: none !important; }
```

That's it. Clicking a filter button, typing in the search box or changing pages all update the items, the counter and the URL.

## How filtering works

Every item declares its facets in `data-categories`, as space-separated `type:value` pairs:

```html
<div class="filter-item" data-categories="category:tech brand:apple color:silver">
```

Filter controls target those pairs through `data-filter`:

| `data-filter` value | Meaning |
|---|---|
| `category:tech` | Toggle this filter |
| `*` | Reset — show everything |
| `category:*` | Clear every active `category:` filter |

By default AFS runs in **mixed mode**: filters of the same type combine with OR, different types combine with AND. Selecting *Tech*, *Design* and *Apple* shows items that are `(tech OR design) AND apple`. Each type's logic is configurable:

```javascript
const afs = new AFS({
  filterCategoryMode: 'mixed',
  filterTypeLogic: {
    category: { mode: 'OR', multi: true },  // multi-select (checkbox-style)
    brand: 'OR',                            // exclusive (one at a time)
    tags: 'AND',                            // items must match all selected
  },
});
```

Buttons, checkboxes (`<input type="checkbox" data-filter>`), radios (`<input type="radio" data-filter>`) and dropdowns (`<select data-filter-type>`) are all supported — see the [Filter documentation](docs/filter.md).

## Documentation

| Module | Covers |
|---|---|
| [Filter](docs/filter.md) | Buttons, checkboxes, radios, dropdowns, logic modes, filter groups |
| [Search](docs/search.md) | Text search, debouncing, highlighting |
| [Sort](docs/sort.md) | Sort buttons, multi-criteria, custom comparators, shuffle |
| [Pagination](docs/pagination.md) | Page controls, items-per-page, scroll-to-top |
| [Range Filter](docs/range-filter.md) | Slider with optional histogram (numbers or dates) |
| [Input Range Filter](docs/input-range-filter.md) | Min/max number inputs |
| [Date Filter](docs/date-filter.md) | Date range pickers |
| [URL Manager](docs/url-manager.md) | URL parameters, shareable state, history |

## Common options

All options with their defaults live in [`src/core/Options.js`](src/core/Options.js). The ones you'll touch most:

```javascript
const afs = new AFS({
  // Selectors (containerSelector and itemSelector are required)
  containerSelector: '.afs-filter-container',
  itemSelector: '.afs-filter-item',
  filterButtonSelector: '.afs-btn-filter',
  filterDropdownSelector: '.afs-filter-dropdown',
  searchInputSelector: '.afs-filter-search',
  counterSelector: '.afs-filter-counter',
  sortButtonSelector: '.afs-btn-sort',

  // CSS classes AFS toggles
  activeClass: 'active',
  hiddenClass: 'hidden',
  activeSortClass: 'sort-active',

  // Filter logic
  filterCategoryMode: 'mixed',   // 'mixed' | 'OR' | 'AND'
  filterTypeLogic: {},           // per-type config, see above

  // Search
  searchKeys: ['title'],
  debounceTime: 300,

  // Pagination (disabled by default)
  pagination: {
    enabled: false,
    itemsPerPage: 10,
    container: '.afs-pagination-container',
    showPrevNext: true,
    scrollToTop: false,          // scrolls back to the top of the items list
    scrollOffset: 50,
    scrollBehavior: 'smooth',    // 'smooth' | 'auto'
  },

  // Counter
  counter: {
    template: 'Showing {visible} of {total}',
    showFiltered: true,
    filteredTemplate: '({filtered} filtered)',
    noResultsTemplate: 'No items found',
  },

  // Animations
  animation: { type: 'fade', duration: 300 },

  // Misc
  debug: false,                  // log to console
  preserveState: false,          // persist state in sessionStorage across tab switches
});
```

## API at a glance

Each feature lives on the instance: `afs.filter`, `afs.search`, `afs.sort`, `afs.pagination`, `afs.rangeFilter`, `afs.inputRangeFilter`, `afs.dateFilter`, `afs.urlManager`.

```javascript
// Filtering
afs.filter.addFilter('category:tech');
afs.filter.removeFilter('category:tech');
afs.filter.clearAllFilters();                 // filters + search + dropdowns + checkboxes

// Search
afs.search.setValue('macbook');
afs.search.clearSearch();

// Sorting
afs.sort.sort('price', 'desc');
afs.sort.shuffle();
afs.sort.reset();

// Pagination
afs.pagination.goToPage(2);
afs.pagination.nextPage();
afs.pagination.setItemsPerPage(24);
afs.pagination.getPageInfo();                 // { currentPage, itemsPerPage, totalPages }

// Range widgets (containers are DOM elements)
afs.rangeFilter.addRangeSlider({
  key: 'price', type: 'number',
  container: document.querySelector('.price-slider'),
  min: 0, max: 1000, step: 10,
  ui: { showHistogram: true, bins: 12 },
});
afs.inputRangeFilter.addInputRange({ key: 'rating', container: el, min: 0, max: 5, step: 0.5 });
afs.dateFilter.addDateRange({ key: 'date', container: el });

// Lifecycle
afs.refresh();                                // re-scan items (after DOM changes)
afs.destroy();
```

### Events

```javascript
afs.on('filtersApplied', ({ activeFilters, visibleItems }) => { /* … */ });
afs.on('search', ({ query, matches, total }) => { /* … */ });
afs.on('sort', ({ key, direction }) => { /* … */ });
afs.on('pageChanged', ({ currentPage, totalPages }) => { /* … */ });
afs.on('filtersCleared', () => { /* … */ });
afs.on('urlStateLoaded', ({ params }) => { /* … */ });
```

`on`, `once`, `off`, `removeAllListeners` are available. Each module's documentation lists its events and payloads.

## TypeScript

Type definitions ship with the package:

```typescript
import { AFS, AFSOptions, FilterTypeLogic } from 'advanced-filter-system';

const logic: FilterTypeLogic = {
  category: { mode: 'OR', multi: true },
  brand: 'OR',
};

const afs = new AFS({
  containerSelector: '#items',
  itemSelector: '.item',
  filterTypeLogic: logic,
});
```

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses ES modules, `URLSearchParams` and the History API. `dist/afs.legacy.js` (UMD) is provided for non-module environments.

## Development

```bash
git clone https://github.com/misits/advanced-filter-system.git
cd advanced-filter-system
npm install

npm test             # jest test suite
npm run build        # build dist/ (development)
npm run build:prod   # minified production build

# Try the demo (imports ../dist/afs.modern.js, so build first)
npm run build && npx serve .
# then open http://localhost:3000/examples/demo.html
```

## License

MIT — see [LICENSE](LICENSE).

---

Made with ♥ by [misits](https://github.com/misits)
