# State

`afs.state` — the central store that every feature reads from and writes to (active filters, search query, sort, the visible-items set, pagination). Most apps never touch it directly, but it exposes a small public API for reading state and reacting to changes.

## Reading

```javascript
const s = afs.state.getState();
s.items.visible;   // Set<HTMLElement> currently shown
s.items.total;     // number of items
s.search.query;    // current search string
s.sort.current;    // { key, direction } | null
s.pagination;      // { currentPage, itemsPerPage, totalPages }
```

> `getState()` returns a **live, read-only view**. Do not mutate the returned object or its `Set`/`Map`s directly — write through `setState()` or the mutators below, which are the only paths that notify subscribers.

## Subscribing

`subscribe(path, callback)` is called after any write at `path` **or any descendant** of it (a listener on `"items"` also fires for `"items.visible"`). It returns an unsubscribe function.

```javascript
const off = afs.state.subscribe('items.visible', (visible, path) => {
  console.log(`${visible.size} items visible`);
});

// later
off();
```

Internal modules do **not** subscribe here (they coordinate through the `afs.on(...)` event bus), so the registry is empty by default and notifications are essentially free until you opt in.

> If you subscribe to a high-frequency path (`items.visible` changes once per item during a search/range/date filter), debounce your handler.

## Writing

| Method | Description |
|---|---|
| `setState(path, value)` | Set a dot-path value (e.g. `setState('search.query', 'pro')`) and notify subscribers |
| `setVisibleItems(set)` | Replace the visible-items `Set` |
| `addVisibleItem(item)` | Add one element to the visible set (O(1) + notify) |
| `removeVisibleItem(item)` | Remove one element from the visible set |
| `clearVisibleItems()` | Empty the visible set |
| `export()` | Serializable snapshot (Sets/Maps → arrays) |
| `import(snapshot)` | Restore from an `export()` snapshot |
| `reset()` | Reset to initial state (subscriptions are kept) |

## State vs the event bus

- **`afs.state.subscribe(path, cb)`** — fine-grained, fires on a specific state write.
- **`afs.on(event, cb)`** — coarse, high-level lifecycle events (`filter`, `search`, `sort`, `pagination`, `filtersApplied`, …) emitted after an operation completes. Prefer this for most app code; use `subscribe` when you need to react to a single piece of state.
