/**
 * @fileoverview State management for AFS
 */

export class State {
  constructor() {
    // path -> Set<callback>. Opt-in: subscribers react to setState() writes.
    // Internal modules do NOT subscribe here (they use the AFS event bus); this
    // is a public hook for consumers. An empty registry makes notify() ~free.
    this.subscribers = new Map();
    this.state = {
      filters: {
        current: new Set(['*']),
        groups: new Map(),
        ranges: new Map(),
        dateRanges: new Map(),
        mode: 'OR',
        groupMode: 'OR'
      },
      search: {
        query: '',
        keys: ['title']
      },
      sort: {
        orders: {},
        current: null
      },
      items: {
        visible: new Set(),
        total: 0
      },
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0
      }
    };
  }

  /**
   * Get current state.
   * NOTE: this is a live, read-only view. Never mutate the returned object or
   * its Set/Map collections directly — write through setState() or the
   * dedicated mutators (setVisibleItems/addVisibleItem/...), which are the only
   * code paths that notify subscribers.
   * @returns {Object} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Subscribe to state changes at a given path (or any descendant of it).
   * @param {string} path - Dot notation path, e.g. "items.visible" or "items"
   * @param {Function} callback - Called with (value, path) after a matching write
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path).add(callback);
    return () => {
      const set = this.subscribers.get(path);
      if (!set) return;
      set.delete(callback);
      if (set.size === 0) this.subscribers.delete(path);
    };
  }

  /**
   * Notify subscribers of `path` and of each of its ancestor paths, so a
   * listener on "items" also hears a write to "items.visible".
   * @private
   */
  notify(path, value) {
    if (this.subscribers.size === 0) return;
    const parts = path.split('.');
    for (let i = parts.length; i > 0; i--) {
      const ancestor = parts.slice(0, i).join('.');
      const set = this.subscribers.get(ancestor);
      if (!set) continue;
      [...set].forEach((cb) => {
        try {
          cb(value, path);
        } catch (error) {
          // A bad subscriber must not break the write or other subscribers
          // eslint-disable-next-line no-console
          console.error(`Error in state subscriber for ${ancestor}:`, error);
        }
      });
    }
  }

  /**
   * Update state
   * @param {string} path - Dot notation path to update
   * @param {any} value - New value
   */
  setState(path, value) {
    const parts = path.split('.');
    let current = this.state;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    this.notify(path, value);
  }

  /**
   * Replace the set of visible items.
   * @param {Set<HTMLElement>} set
   */
  setVisibleItems(set) {
    this.setState('items.visible', set);
  }

  /**
   * Add one item to the visible set (encapsulated O(1) write + notify).
   * @param {HTMLElement} item
   */
  addVisibleItem(item) {
    this.state.items.visible.add(item);
    this.notify('items.visible', this.state.items.visible);
  }

  /**
   * Remove one item from the visible set (encapsulated O(1) write + notify).
   * @param {HTMLElement} item
   */
  removeVisibleItem(item) {
    this.state.items.visible.delete(item);
    this.notify('items.visible', this.state.items.visible);
  }

  /**
   * Clear the visible set.
   */
  clearVisibleItems() {
    this.state.items.visible.clear();
    this.notify('items.visible', this.state.items.visible);
  }

  /**
   * Export state
   * @returns {Object} Exportable state
   */
  export() {
    return {
      filters: {
        current: Array.from(this.state.filters.current),
        groups: Array.from(this.state.filters.groups.entries()),
        ranges: Array.from(this.state.filters.ranges.entries()),
        dateRanges: Array.from(this.state.filters.dateRanges.entries()),
        mode: this.state.filters.mode,
        groupMode: this.state.filters.groupMode
      },
      search: { ...this.state.search },
      sort: { ...this.state.sort },
      pagination: { ...this.state.pagination }
    };
  }

  /**
   * Import state
   * @param {Object} importedState - State to import
   */
  import(importedState) {
    if (importedState.filters) {
      this.state.filters.current = new Set(importedState.filters.current);
      this.state.filters.groups = new Map(importedState.filters.groups);
      this.state.filters.ranges = new Map(importedState.filters.ranges);
      this.state.filters.dateRanges = new Map(importedState.filters.dateRanges);
      this.state.filters.mode = importedState.filters.mode;
      this.state.filters.groupMode = importedState.filters.groupMode;
    }

    if (importedState.search) {
      this.state.search = { ...importedState.search };
    }

    if (importedState.sort) {
      this.state.sort = { ...importedState.sort };
    }

    if (importedState.pagination) {
      this.state.pagination = { ...importedState.pagination };
    }
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.state = {
      filters: {
        current: new Set(['*']),
        groups: new Map(),
        ranges: new Map(),
        dateRanges: new Map(),
        mode: 'OR',
        groupMode: 'OR'
      },
      search: {
        query: '',
        keys: ['title']
      },
      sort: {
        orders: {},
        current: null
      },
      items: {
        visible: new Set(),
        total: 0
      },
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0
      }
    };
  }
}