# Filter

`afs.filter` — show and hide items based on the `type:value` pairs declared in their `data-categories` attribute. Supports buttons, checkboxes, radios and dropdowns, with configurable logic per filter type.

## Quick start

```html
<button class="btn-filter" data-filter="*">All</button>
<button class="btn-filter" data-filter="category:tech">Tech</button>
<button class="btn-filter" data-filter="category:design">Design</button>

<div class="items-container">
  <div class="filter-item" data-categories="category:tech brand:apple">…</div>
  <div class="filter-item" data-categories="category:design brand:moleskine">…</div>
</div>
```

```javascript
const afs = new AFS({
  containerSelector: '.items-container',
  itemSelector: '.filter-item',
  filterButtonSelector: '.btn-filter',
});
```

```css
.btn-filter.active { /* active control */ }
.filter-item.hidden { display: none !important; }
```

## Filter values

| `data-filter` | Behavior |
|---|---|
| `type:value` | Toggles that filter |
| `*` | Resets — shows everything (`resetFilters()`) |
| `type:*` | Clears every active filter of that type (`clearFilterCategory()`) |

## Control types

All controls matched by `filterButtonSelector` need a `data-filter` attribute.

### Buttons

```html
<button class="btn-filter" data-filter="brand:apple">Apple</button>
```

In OR mode (default), buttons of the same type are **exclusive**: activating one deactivates its siblings. Use `multi: true` (below) for multi-select.

### Checkboxes — multi-select

```html
<label><input type="checkbox" class="btn-filter" data-filter="brand:apple"> Apple</label>
<label><input type="checkbox" class="btn-filter" data-filter="brand:samsung"> Samsung</label>
```

Checkbox `checked` state is kept in sync with the active filters.

### Radios — exclusive groups

```html
<label><input type="radio" name="stock" class="btn-filter" data-filter="stock:*" checked> All</label>
<label><input type="radio" name="stock" class="btn-filter" data-filter="stock:in"> In stock</label>
<label><input type="radio" name="stock" class="btn-filter" data-filter="stock:out"> Out of stock</label>
```

Radios sharing a `name` are always exclusive. A `type:*` radio acts as the "any" option.

### Dropdowns

Dropdowns use their own selector (`filterDropdownSelector`, default `.afs-filter-dropdown`) and a `data-filter-type` attribute:

```html
<select class="afs-filter-dropdown" data-filter-type="category">
  <option value="">All categories</option>
  <option value="category:tech">Tech</option>
  <option value="category:design">Design</option>
</select>
```

Selecting an option replaces the previous selection of that type. An empty value, `*` or `type:all` clears the type.

## Logic modes

### Mixed mode (default)

`filterCategoryMode: 'mixed'` — filters of the same type combine with OR, different types combine with AND:

> *(Tech OR Design) AND (Apple OR Samsung)*

Per-type behavior is tuned with `filterTypeLogic`:

```javascript
const afs = new AFS({
  filterCategoryMode: 'mixed',
  filterTypeLogic: {
    category: { mode: 'OR', multi: true },  // multi-select, OR
    brand: 'OR',                            // exclusive toggle (one at a time)
    tags: 'AND',                            // items must match ALL selected tags
  },
});

// or at runtime:
afs.filter.setFilterTypeLogic('brand', { mode: 'OR', multi: true });
afs.filter.setFilterTypeLogic({ category: 'OR', tags: 'AND' });
```

| Config | Selection | Matching |
|---|---|---|
| `'OR'` | exclusive (one active per type) | item has the value |
| `{ mode: 'OR', multi: true }` | multi-select | item has at least one selected value |
| `'AND'` | multi-select | item has **all** selected values |

### Global modes

```javascript
new AFS({ filterCategoryMode: 'OR' });   // every filter ORs together
new AFS({ filterCategoryMode: 'AND' });  // items must match every active filter
afs.filter.setFilterMode('AND');         // switch at runtime
```

## Filter groups

Named groups for building complex queries programmatically:

```javascript
afs.filter.addFilterGroup('essentials', ['category:tech', 'category:office'], 'OR');
afs.filter.addFilterGroup('premium', ['price:high', 'brand:apple'], 'AND');
afs.filter.setGroupMode('AND');          // how groups combine: 'AND' | 'OR'
afs.filter.removeFilterGroup('premium');
```

## API

| Method | Description |
|---|---|
| `addFilter(filter)` | Activate a filter; replaces any other filter of the same type |
| `removeFilter(filter)` | Deactivate a filter; resets to `*` if none remain |
| `toggleFilterExclusive(filter)` | Toggle, deactivating all other filters of the same type |
| `clearFilterCategory('type:*')` | Clear all filters of one type |
| `resetFilters()` | Back to `*` (all items visible) |
| `clearAllFilters()` | Reset filters **and** search, dropdowns, checkboxes, sort orders, groups |
| `applyFilters()` | Re-evaluate visibility (called automatically after changes) |
| `setFilterMode('OR'\|'AND')` | Set global logic |
| `setFilterTypeLogic(type, logic)` | Set per-type logic (string or `{mode, multi}`) |
| `setFilterTypeExclusive(types, exclusive?)` | Force exclusive toggle for given type(s) |
| `addFilterGroup(id, filters, operator?)` / `removeFilterGroup(id)` / `setGroupMode(mode)` | Filter groups |
| `getActiveFilters()` | `Set<string>` of active filters (copy) |
| `getFilterGroups()` | `Map` of groups (copy) |
| `addFilterButton(button, filter)` / `removeFilterButton(button)` | Register controls dynamically |
| `refresh()` | Re-apply filters and update the counter |
| `destroy()` | Unbind all listeners |

## Options

| Option | Default | Description |
|---|---|---|
| `filterButtonSelector` | `.afs-btn-filter` | Buttons / checkboxes / radios |
| `filterDropdownSelector` | `.afs-filter-dropdown` | `<select>` controls |
| `activeClass` | `active` | Applied to active controls |
| `hiddenClass` | `hidden` | Applied to hidden items |
| `filterMode` | `OR` | Global logic (non-mixed mode) |
| `filterCategoryMode` | `mixed` | `mixed` \| `OR` \| `AND` |
| `filterTypeLogic` | `{}` | Per-type logic map |
| `groupMode` | `AND` | How filter groups combine |

## Events

| Event | Payload |
|---|---|
| `filter` | `{ activeFilters, visibleItems, added, removed }` |
| `filtersApplied` | `{ activeFilters, visibleItems }` |
| `filterToggled` | `{ filter, activeFilters }` |
| `filterChanged` | `{ type, value, activeFilters }` (dropdowns) |
| `filterRemoved` | `{ filter, activeFilters }` |
| `filterCategoryCleared` | `{ category, removedFilters, activeFilters }` |
| `filterToggledExclusive` | `{ filter, type, activeFilters }` |
| `filtersReset` / `filtersCleared` | — |
| `itemsShown` / `itemsHidden` | `{ items: Set<HTMLElement> }` |

```javascript
afs.on('filtersApplied', ({ activeFilters, visibleItems }) => {
  console.log(`${visibleItems} items match`, activeFilters);
});
```

## Notes

- The active set always contains either `*` or at least one `type:value` filter — removing the last filter restores `*` automatically.
- With pagination enabled, the Filter module only computes the visible set; rendering is delegated to [Pagination](pagination.md).
- `clearAllFilters()` is the "reset everything" button; `resetFilters()` only touches filters.
