# AFS Documentation

Advanced Filter System (AFS) is a dependency-free JavaScript library for filtering, searching, sorting and paginating DOM elements.

New here? Start with the [README quick start](../README.md#quick-start), then open the module you need:

| Module | Instance | Covers |
|---|---|---|
| [Filter](filter.md) | `afs.filter` | Buttons, checkboxes, radios, dropdowns, logic modes, filter groups |
| [Search](search.md) | `afs.search` | Text search, debouncing, highlighting |
| [Sort](sort.md) | `afs.sort` | Sort buttons, multi-criteria, custom comparators, shuffle |
| [Pagination](pagination.md) | `afs.pagination` | Page controls, items-per-page, scroll-to-top |
| [Range Filter](range-filter.md) | `afs.rangeFilter` | Dual-thumb slider with optional histogram |
| [Input Range Filter](input-range-filter.md) | `afs.inputRangeFilter` | Min/max number inputs |
| [Date Filter](date-filter.md) | `afs.dateFilter` | Date range pickers |
| [URL Manager](url-manager.md) | `afs.urlManager` | URL parameters, shareable state, history |

## The mental model

1. **Items** are DOM elements matched by `itemSelector` inside `containerSelector`. Each item carries its data in `data-*` attributes:

   ```html
   <div class="filter-item"
        data-categories="category:tech brand:apple"  <!-- facets, as "type:value" pairs -->
        data-title="MacBook Pro"                     <!-- searchable / sortable -->
        data-price="2499"                            <!-- sortable / range-filterable -->
        data-date="2024-03-15">                      <!-- sortable / date-filterable -->
   ```

2. **Controls** (buttons, inputs, selects) are plain HTML wired to AFS through selectors and `data-filter` / `data-sort-key` attributes. AFS binds the events for you.

3. **State flows one way**: a control changes the active filters → AFS computes the visible set → animation/pagination renders it → counter and URL update → events fire.

4. Everything is also scriptable: each module exposes the same operations as public methods (`afs.filter.addFilter(…)`, `afs.pagination.goToPage(…)`, …).

## Shared conventions

- `type:value` — the universal filter format (`category:tech`, `brand:apple`)
- `*` — show everything; `type:*` — clear all filters of one type
- Visibility is rendered with the `hiddenClass` (default `hidden`) — **your CSS must hide it**:

  ```css
  .filter-item.hidden { display: none !important; }
  ```

- Active controls receive `activeClass` (default `active`)
- Range/date widget containers are **DOM elements**, not selectors
- All events go through `afs.on(event, callback)` / `afs.once` / `afs.off`

## Try it

The [interactive demo](../examples/demo.html) exercises every feature on one page, with the relevant API named under each control. Build the library first (`npm run build`), then serve the repo root and open `examples/demo.html`.
