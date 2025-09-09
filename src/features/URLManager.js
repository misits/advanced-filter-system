/**
 * @fileoverview URL state management for AFS
 */

export class URLManager {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.defaultParams = new URLSearchParams();
    this.setupPopStateHandler();
  }

  /**
   * Initialize URL state
   * @public
   */
  initialize() {
    // Load URL state after all features are initialized
    this.loadFromURL();
  }

  /**
   * Setup history popstate handler
   * @private
   */
  setupPopStateHandler() {
    window.addEventListener('popstate', () => {
      this.loadFromURL();
    });
  }

  /**
   * Update URL with current filter state
   * @public
   */
  /**
 * Update URL with current filter state
 * @public
 */
updateURL() {
  this.afs.logger.debug("Updating URL state");
  const params = new URLSearchParams();
  const state = this.afs.state.getState();  // Get current state of filters

  // Get active filters directly from the Filter instance
  const activeFilters = this.afs.filter.getActiveFilters();

  // Update the state object with the active filters
  state.filters.current = activeFilters;

  // Add filters to URL
  this.addFiltersToURL(params, state);
  
  // Add ranges (if applicable) to URL
  this.addRangesToURL(params, state);
  
  // Add search query to URL
  this.addSearchToURL(params, state);
  
  // Add sort state to URL
  this.addSortToURL(params, state);
  
  // Add pagination to URL
  this.addPaginationToURL(params, state);
  
  // Push the updated URL
  this.pushState(params);  // Push the new URL state to the browser
}

  /**
   * Add filters to URL parameters
   * @private
   * @param {URLSearchParams} params
   * @param {Object} state
   */
  addFiltersToURL(params, state) {
    const filters = state.filters;

    // Skip if only default filter is active
    if (filters.current.size === 0 || 
        (filters.current.size === 1 && filters.current.has('*'))) {
      return;
    }

    // Group filters by type
    const filtersByType = {};
    for (const filter of filters.current) {
      if (filter !== '*') {
        const [type, value] = filter.split(':');
        if (!filtersByType[type]) {
          filtersByType[type] = new Set();
        }
        filtersByType[type].add(value);
      }
    }

    // Add filters to params
    Object.entries(filtersByType).forEach(([type, values]) => {
      params.set(type, Array.from(values).join(','));
    });

    // Add filter mode if not default
    if (filters.mode !== 'OR') {
      params.set('filterMode', filters.mode.toLowerCase());
    }

    // Add group mode if groups exist and mode isn't default
    if (filters.groups.size > 0 && filters.groupMode !== 'OR') {
      params.set('groupMode', filters.groupMode.toLowerCase());
    }

    // Add filter groups if they exist
    filters.groups.forEach((group, groupId) => {
      params.set(`group_${groupId}`, Array.from(group.filters).join(','));
      if (group.operator !== 'OR') {
        params.set(`groupOp_${groupId}`, group.operator.toLowerCase());
      }
    });
  }

  /**
   * Add range filters to URL parameters
   * @private
   * @param {URLSearchParams} params
   * @param {Object} state
   */
  addRangesToURL(params, state) {
    // Handle numeric ranges
    state.filters.ranges.forEach((range, key) => {
      const { currentMin, currentMax } = range;
      if (currentMin !== range.min || currentMax !== range.max) {
        params.set(`range_${key}`, `${currentMin},${currentMax}`);
      }
    });

    // Handle date ranges
    state.filters.dateRanges.forEach((range, key) => {
      const { start, end } = range;
      params.set(`dateRange_${key}`, `${start.toISOString()},${end.toISOString()}`);
    });
  }

  /**
   * Add search parameters to URL
   * @private
   * @param {URLSearchParams} params
   * @param {Object} state
   */
  addSearchToURL(params, state) {
    if (state.search.query) {
      params.set('search', state.search.query);
    }
  }

  /**
   * Add sort parameters to URL
   * @private
   * @param {URLSearchParams} params
   * @param {Object} state
   */
  addSortToURL(params, state) {
    if (state.sort.current) {
      const { key, direction } = state.sort.current;
      params.set('sort', `${key},${direction}`);
    }
  }

  /**
   * Add pagination parameters to URL
   * @private
   * @param {URLSearchParams} params
   * @param {Object} state
   */
  addPaginationToURL(params, state) {
    const { currentPage, itemsPerPage } = state.pagination;

    if (!this.afs.options.get('pagination.enabled')) {
      return;
    }

    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    if (itemsPerPage !== this.afs.options.get('pagination.itemsPerPage')) {
      params.set('perPage', itemsPerPage.toString());
    }
  }

  /**
   * Update browser URL
   * @private
   * @param {URLSearchParams} params
   */
  pushState(params) {
    const queryString = params.toString();
    const newURL = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    
    // Only update if URL actually changed
    if (newURL !== window.location.href) {
      window.history.pushState({}, '', newURL);
      this.afs.logger.debug('URL updated:', newURL);
    }
  }

  /**
 * Load filter state from URL
 * @public
 */
  loadFromURL() {
    this.afs.logger.debug('Loading state from URL');
    const params = new URLSearchParams(window.location.search);
  
    try {
      // Clear existing filters first
      if (this.afs.filter) {
        this.afs.filter.clearAllFilters();
      }
  
      // Process filter mode first
      const filterMode = params.get('filterMode');
      if (filterMode && this.afs.filter) {
        this.afs.filter.setFilterMode(filterMode.toUpperCase());
      }
  
      // Get all parameters that are not special parameters
      const filterParams = Array.from(params.entries()).filter(([key]) => 
        this.isRegularFilter(key)
      );
  
      if (filterParams.length > 0 && this.afs.filter) {
        // Remove default '*' filter
        this.afs.filter.activeFilters.clear();
  
        // Process each filter parameter
        filterParams.forEach(([type, value]) => {
          if (value) {
            // Handle comma-separated values if present
            const values = value.split(',');
            values.forEach(val => {
              const filter = `${type}:${val}`;
              this.afs.filter.addFilter(filter);
            });
          }
        });
      }
  
      // Apply filters before processing other parameters
      if (this.afs.filter) {
        this.afs.filter.applyFilters();
      }
  
      // Process other parameters...
      this.processSearchFromURL(params);
      this.processSortFromURL(params);
      this.processPaginationFromURL(params);
  
      this.afs.emit("urlStateLoaded", { params: Object.fromEntries(params) });
      this.afs.logger.info('State loaded from URL');
    } catch (error) {
      this.afs.logger.error('Error loading state from URL:', error);
      // Reset to default state on error
      if (this.afs.filter) {
        this.afs.filter.clearAllFilters();
      }
    }
  }
  
  /**
   * Process filters from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processFiltersFromURL(params) {
    const state = this.afs.state.getState();
    let hasFilters = false;

    // Process filter mode
    const filterMode = params.get('filterMode');
    if (filterMode) {
      state.filters.mode = filterMode.toUpperCase();
    }

    // Process group mode
    const groupMode = params.get('groupMode');
    if (groupMode) {
      state.filters.groupMode = groupMode.toUpperCase();
    }

    // Process regular filters
    for (const [type, values] of params.entries()) {
      if (this.isRegularFilter(type)) {
        values.split(',').filter(Boolean).forEach(value => {
          hasFilters = true;
          state.filters.current.add(`${type}:${value}`);
        });
      }
    }

    // Process filter groups
    for (const [key, value] of params.entries()) {
      if (key.startsWith('group_')) {
        const groupId = key.replace('group_', '');
        const operator = params.get(`groupOp_${groupId}`)?.toUpperCase() || 'OR';
        state.filters.groups.set(groupId, {
          filters: new Set(value.split(',')),
          operator
        });
      }
    }

    // Set default if no filters
    if (!hasFilters && state.filters.groups.size === 0) {
      state.filters.current.add('*');
    }
  }

  /**
   * Process range filters from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processRangesFromURL(params) {
    const state = this.afs.state.getState();

    // Process numeric ranges
    for (const [key, value] of params.entries()) {
      if (key.startsWith('range_')) {
        const rangeKey = key.replace('range_', '');
        const [min, max] = value.split(',').map(Number);
        state.filters.ranges.set(rangeKey, { currentMin: min, currentMax: max });
      }
    }

    // Process date ranges
    for (const [key, value] of params.entries()) {
      if (key.startsWith('dateRange_')) {
        const rangeKey = key.replace('dateRange_', '');
        const [start, end] = value.split(',').map(str => new Date(str));
        state.filters.dateRanges.set(rangeKey, { start, end });
      }
    }
  }

  /**
   * Process search from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processSearchFromURL(params) {
    const searchQuery = params.get('search') || '';
    this.afs.state.setState('search.query', searchQuery);
    
    if (this.afs.options.get('searchInput')) {
      this.afs.options.get('searchInput').value = searchQuery;
    }
  }

  /**
   * Process sort from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processSortFromURL(params) {
    const sortParam = params.get('sort');
    if (sortParam) {
      const [key, direction] = sortParam.split(',');
      this.afs.state.setState('sort.current', { key, direction });
    }
  }

  /**
   * Process pagination from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processPaginationFromURL(params) {
    const page = parseInt(params.get('page')) || 1;
    const perPage = parseInt(params.get('perPage')) || 
                   this.afs.options.get('pagination.itemsPerPage');

    this.afs.state.setState('pagination', {
      currentPage: page,
      itemsPerPage: perPage
    });
  }

  /**
   * Check if parameter is a regular filter
   * @private
   * @param {string} param - Parameter name
   * @returns {boolean}
   */
  isRegularFilter(param) {
    const excludedParams = [
      'search', 'sort', 'page', 'perPage', 'filterMode', 'groupMode'
    ];
    return !excludedParams.includes(param) && 
           !param.startsWith('group_') && 
           !param.startsWith('groupOp_') && 
           !param.startsWith('range_') && 
           !param.startsWith('dateRange_');
  }

  /**
   * Clear URL parameters
   * @public
   */
  clearURL() {
    window.history.pushState({}, '', window.location.pathname);
    this.afs.state.reset();
    if (this.afs.filter) {
      this.afs.filter.clearAllFilters();
    }
  }

  /**
   * Get current URL parameters
   * @public
   * @returns {URLSearchParams}
   */
  getURLParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Check if URL has parameters
   * @public
   * @returns {boolean}
   */
  hasParams() {
    return window.location.search.length > 1;
  }

  /**
   * Get parameter value
   * @public
   * @param {string} param - Parameter name
   * @returns {string|null}
   */
  getParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  }
}