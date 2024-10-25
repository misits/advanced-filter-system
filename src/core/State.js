/**
 * @fileoverview State management for AFS
 */

export class State {
  constructor() {
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
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return this.state;
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