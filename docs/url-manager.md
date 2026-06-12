# URL Manager

`afs.urlManager` — keeps the full AFS state in the URL automatically: every filter, search, sort and pagination change updates the query string, and loading a URL restores that exact state. No configuration needed.

```text
https://example.com/products?category=tech,design&brand=apple&search=pro&sort=price,desc&page=2
```

- **Shareable** — copy the URL, get the same filtered view
- **History-aware** — back/forward navigate through filter states (`popstate` is handled)
- **Restored on load** — `loadFromURL()` runs once all features are initialized

## URL parameters

| Parameter | Example | Written when |
|---|---|---|
| `<type>` | `category=tech,design` | One param per filter type; comma-separated values |
| `filterMode` | `filterMode=and` | Global mode differs from `OR` |
| `groupMode` | `groupMode=and` | Filter groups exist with non-default mode |
| `group_<id>` / `groupOp_<id>` | `group_g1=a,b` | Filter groups |
| `range_<key>` | `range_price=100,500` | Range slider selection differs from full range |
| `dateRange_<key>` | `dateRange_date=2024-01-01T…` | Date range active |
| `search` | `search=macbook` | Query non-empty |
| `sort` | `sort=price,desc` | Sort active |
| `page` | `page=2` | Current page > 1 |
| `perPage` | `perPage=24` | Items-per-page differs from the configured default |

Defaults are omitted, so an unfiltered view has a clean URL.

## API

Most apps never call these — everything is automatic. They're useful for custom integrations:

| Method | Description |
|---|---|
| `updateURL()` | Serialize the current state into the URL (`pushState`) |
| `loadFromURL()` | Read the URL and apply the state |
| `clearURL()` | Remove all params and reset filters |
| `getURLParams()` | Current `URLSearchParams` |
| `getParam(name)` | One param value or `null` |
| `hasParams()` | Whether the URL carries any state |

## Events

| Event | Payload |
|---|---|
| `urlStateLoaded` | `{ params }` — after a URL state has been applied (initial load and `popstate`) |

```javascript
afs.on('urlStateLoaded', ({ params }) => {
  console.log('State restored from URL', params);
});
```

## Behavior notes

- **Initialization is protected**: URL writes are blocked until the incoming URL has been read, so feature setup can't wipe the parameters of a shared link.
- The URL only updates when it actually changes — no redundant history entries.
- Filter-type names become parameter names; avoid types that collide with the reserved params above (`search`, `sort`, `page`, `perPage`, `filterMode`, `groupMode`, `group_*`, `range_*`, `dateRange_*`).

## URL state vs `preserveState`

These are two different mechanisms:

| | URL state (this module) | `preserveState: true` |
|---|---|---|
| Storage | query string | `sessionStorage` |
| Scope | shareable across users | same tab/session only |
| When | always on | saved on tab hide, restored on return; expires after `stateExpiry` (default 24 h) |
