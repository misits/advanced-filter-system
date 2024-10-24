(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.AFS = {}));
})(this, (function (exports) { 'use strict';

  /**
   * @fileoverview Advanced Filter System for DOM elements
   * @version 1.0.5
   *
   * A flexible and customizable filtering system that supports:
   * - Multiple filtering modes (OR/AND)
   * - Text search with debouncing
   * - Multiple sorting criteria
   * - Range filtering
   * - URL state management
   * - Animation and transitions
   * - Results counter
   */

  /**
   * Utility function for debouncing
   * @param {Function} func - Function to debounce
   * @param {number} wait - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  class AFS {
    /**
     * @typedef {Object} FilterOptions
     * @property {string} containerSelector - Main container selector
     * @property {string} itemSelector - Items to filter selector
     * @property {string} filterButtonSelector - Filter buttons selector
     * @property {string} [searchInputSelector] - Search input selector
     * @property {string} [counterSelector] - Results counter selector
     * @property {string} [activeClass='active'] - Active state class
     * @property {string} [hiddenClass='hidden'] - Hidden state class
     * @property {number} [animationDuration=300] - Animation duration in ms
     * @property {string} [filterMode='OR'] - Filter mode ('OR' or 'AND')
     * @property {string[]} [searchKeys=['title']] - Data attributes to search in
     * @property {number} [debounceTime=300] - Search debounce delay in ms
     */

    /**
     * @param {FilterOptions} options - Filter configuration options
     */
    constructor() {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.options = {
        containerSelector: ".filter-container",
        itemSelector: ".filter-item",
        filterButtonSelector: ".btn-filter",
        searchInputSelector: ".filter-search",
        counterSelector: ".filter-counter",
        activeClass: "active",
        hiddenClass: "hidden",
        animationDuration: 300,
        filterMode: "OR",
        searchKeys: ["title"],
        debounceTime: 300,
        ...options
      };

      // Initialize elements
      this.container = document.querySelector(this.options.containerSelector);
      this.items = document.querySelectorAll(this.options.itemSelector);
      this.filterButtons = document.querySelectorAll(this.options.filterButtonSelector);
      this.searchInput = document.querySelector(this.options.searchInputSelector);
      this.counter = document.querySelector(this.options.counterSelector);

      // Initialize state
      this.currentFilters = new Set(["*"]);
      this.currentSearch = "";
      this.visibleItems = new Set(this.items);
      this.filterGroups = new Map();
      this.groupMode = "OR"; // Default group mode

      this.init();
    }

    /**
     * Initialize the filter system
     * @private
     */
    init() {
      this.addStyles();
      this.bindEvents();
      this.loadFromURL();
      this.updateCounter();
    }

    /**
     * Add required styles to document
     * @private
     */
    addStyles() {
      const styles = `
            .${this.options.hiddenClass} {
                display: none !important;
            }

            ${this.options.itemSelector} {
                opacity: 1;
                transform: scale(1);
                transition: opacity ${this.options.animationDuration}ms ease-out,
                            transform ${this.options.animationDuration}ms ease-out;
            }

            ${this.options.filterButtonSelector} {
                opacity: 0.5;
                transition: opacity ${this.options.animationDuration}ms ease;
            }

            ${this.options.filterButtonSelector}.${this.options.activeClass} {
                opacity: 1;
            }
        `;
      const styleSheet = document.createElement("style");
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    /**
     * Bind all event listeners
     * @private
     */
    bindEvents() {
      this.filterButtons.forEach(button => {
        button.addEventListener("click", () => this.handleFilterClick(button));
      });
      if (this.searchInput) {
        this.searchInput.addEventListener("input", debounce(e => {
          this.search(e.target.value);
        }, this.options.debounceTime));
      }
      window.addEventListener("popstate", () => this.loadFromURL());
    }

    /**
     * Handle filter button clicks
     * @private
     * @param {HTMLElement} button - Clicked filter button
     */
    handleFilterClick(button) {
      const filterValue = button.dataset.filter;
      if (filterValue === "*") {
        this.resetFilters();
      } else {
        this.toggleFilter(filterValue, button);
      }
      this.filter();
      this.updateURL();
    }

    /**
     * Reset all filters to default state
     * @private
     */
    resetFilters() {
      this.filterButtons.forEach(btn => btn.classList.remove(this.options.activeClass));
      this.currentFilters.clear();
      this.currentFilters.add("*");
      this.filterButtons[0].classList.add(this.options.activeClass);
      this.resetCounter();
    }

    /**
     * Reset visible items counter
     * @private
     */
    resetCounter() {
      this.visibleItems = new Set(this.items);
      this.updateCounter();
    }

    /**
     * Toggle individual filter state
     * @private
     * @param {string} filterValue - Filter value to toggle
     * @param {HTMLElement} button - Filter button element
     */
    toggleFilter(filterValue, button) {
      this.currentFilters.delete("*");
      this.filterButtons[0].classList.remove(this.options.activeClass);
      if (button.classList.contains(this.options.activeClass)) {
        button.classList.remove(this.options.activeClass);
        this.currentFilters.delete(filterValue);

        // If no filters are selected, reset to default state and clear URL
        if (this.currentFilters.size === 0) {
          this.resetFilters();
          window.history.pushState({}, "", window.location.pathname);
          return;
        }
      } else {
        button.classList.add(this.options.activeClass);
        this.currentFilters.add(filterValue);
      }
    }

    /**
     * Apply current filters to items
     * @public
     */
    /**
     * Apply current filters to items
     * @public
     */
    filter() {
      // Store the original filter logic
      const standardFilter = () => {
        this.visibleItems.clear();
        this.items.forEach(item => {
          if (this.currentFilters.has("*")) {
            this.showItem(item);
            this.visibleItems.add(item);
          } else {
            const itemCategories = new Set(item.dataset.categories?.split(" ") || []);
            const matchesFilter = this.options.filterMode === "OR" ? this.matchesAnyFilter(itemCategories) : this.matchesAllFilters(itemCategories);
            if (matchesFilter) {
              this.showItem(item);
              this.visibleItems.add(item);
            } else {
              this.hideItem(item);
            }
          }
        });
      };

      // Check if we should use group filtering or standard filtering
      if (this.filterGroups.size === 0) {
        standardFilter();
      } else {
        this.visibleItems.clear();
        this.items.forEach(item => {
          if (this.currentFilters.has("*")) {
            this.showItem(item);
            this.visibleItems.add(item);
          } else {
            const itemCategories = new Set(item.dataset.categories?.split(" ") || []);
            const matchesGroups = this.matchesFilterGroups(itemCategories);
            if (matchesGroups) {
              this.showItem(item);
              this.visibleItems.add(item);
            } else {
              this.hideItem(item);
            }
          }
        });
      }
      setTimeout(() => {
        this.updateCounter();
      }, this.options.animationDuration);
    }

    /**
     * Add or update a filter group
     * @public
     * @param {string} groupId - Group identifier
     * @param {string[]} filters - Array of filter values
     * @param {string} [operator='OR'] - Operator within group ('AND' or 'OR')
     * @returns {boolean} Success status
     */
    addFilterGroup(groupId, filters) {
      let operator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "OR";
      try {
        // Validate inputs
        if (!groupId || !Array.isArray(filters)) {
          console.warn("Invalid group parameters");
          return false;
        }
        const validOperator = operator.toUpperCase();
        if (!["AND", "OR"].includes(validOperator)) {
          console.warn('Invalid operator. Using default "OR"');
          operator = "OR";
        }

        // Create or update group
        this.filterGroups.set(groupId, {
          filters: new Set(filters),
          operator: validOperator
        });

        // Only update if we have active groups
        if (this.filterGroups.size > 0) {
          this.updateFiltersFromGroups();
          this.filter();
          this.updateURL();
        }
        return true;
      } catch (error) {
        console.error("Error adding filter group:", error);
        return false;
      }
    }

    /**
     * Set how groups combine with each other
     * @public
     * @param {string} mode - Mode for combining groups ('AND' or 'OR')
     */
    setGroupMode(mode) {
      const validMode = mode.toUpperCase();
      if (["AND", "OR"].includes(validMode)) {
        this.groupMode = validMode;
        if (this.filterGroups.size > 0) {
          this.filter();
        }
      }
    }

    /**
     * Remove a filter group
     * @public
     * @param {string} groupId - Group identifier
     * @returns {boolean} Success status
     */
    removeFilterGroup(groupId) {
      if (this.filterGroups.has(groupId)) {
        this.filterGroups.delete(groupId);

        // If no groups left, revert to normal filtering
        if (this.filterGroups.size === 0) {
          this.resetFilters();
        } else {
          this.updateFiltersFromGroups();
        }
        this.filter();
        this.updateURL();
        return true;
      }
      return false;
    }

    /**
     * Update filters based on groups
     * @private
     */
    updateFiltersFromGroups() {
      // Only process if we have groups
      if (this.filterGroups.size === 0) return;

      // Clear current filters except '*'
      if (!this.currentFilters.has("*")) {
        this.currentFilters.clear();
      }

      // Combine all group filters
      for (const group of this.filterGroups.values()) {
        group.filters.forEach(filter => {
          if (filter !== "*") {
            this.currentFilters.add(filter);
          }
        });
      }
    }

    /**
     * Check if item matches any active filter (OR mode)
     * @private
     * @param {Set} itemCategories - Item's categories
     * @returns {boolean} Whether item matches any filter
     */
    matchesAnyFilter(itemCategories) {
      return [...this.currentFilters].some(filter => {
        const [type, value] = filter.split(":");
        return itemCategories.has(`${type}:${value}`);
      });
    }

    /**
     * Check if item matches all active filters (AND mode)
     * @private
     * @param {Set} itemCategories - Item's categories
     * @returns {boolean} Whether item matches all filters
     */
    matchesAllFilters(itemCategories) {
      return [...this.currentFilters].every(filter => {
        const [type, value] = filter.split(":");
        return itemCategories.has(`${type}:${value}`);
      });
    }

    /**
     * Show an item with animation
     * @private
     * @param {HTMLElement} item - Item to show
     */
    showItem(item) {
      this.visibleItems.add(item);
      item.classList.remove(this.options.hiddenClass);
      item.style.opacity = "0";
      item.style.transform = "scale(0.95)";
      item.offsetHeight;
      requestAnimationFrame(() => {
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      });
    }

    /**
     * Hide an item with animation
     * @private
     * @param {HTMLElement} item - Item to hide
     */
    hideItem(item) {
      item.style.opacity = "0";
      item.style.transform = "scale(0.95)";
      setTimeout(() => {
        if (item.style.opacity === "0") {
          item.classList.add(this.options.hiddenClass);
          this.visibleItems.delete(item);
        }
      }, this.options.animationDuration);
    }

    /**
     * Search items by text
     * @public
     * @param {string} query - Search query
     */
    search(query) {
      this.currentSearch = query.toLowerCase().trim();
      this.items.forEach(item => {
        const searchText = this.options.searchKeys.map(key => item.dataset[key] || "").join(" ").toLowerCase();
        const matchesSearch = this.currentSearch === "" || searchText.includes(this.currentSearch);
        if (matchesSearch) {
          this.showItem(item);
        } else {
          this.hideItem(item);
        }
      });
      this.updateURL();
      setTimeout(() => {
        this.updateCounter();
      }, this.options.animationDuration);
    }

    /**
     * Sort items by multiple criteria
     * @public
     * @param {Array<{key: string, direction: string}>} criteria - Sort criteria
     */
    sortMultiple(criteria) {
      const items = [...this.items];
      items.sort((a, b) => {
        for (const criterion of criteria) {
          const valueA = a.dataset[criterion.key];
          const valueB = b.dataset[criterion.key];
          const comparison = criterion.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
      items.forEach(item => this.container.appendChild(item));
    }

    /**
     * Filter items by numeric range
     * @public
     * @param {string} key - Data attribute key
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     */
    addRangeFilter(key, min, max) {
      this.items.forEach(item => {
        const value = parseFloat(item.dataset[key]);
        const inRange = value >= min && value <= max;
        if (inRange) {
          this.showItem(item);
        } else {
          this.hideItem(item);
        }
      });
      setTimeout(() => {
        this.updateCounter();
      }, this.options.animationDuration);
    }

    /**
     * Check if item matches filter groups
     * @private
     * @param {Set} itemCategories - Item's categories
     * @returns {boolean} Whether item matches the group filters
     */
    matchesFilterGroups(itemCategories) {
      const groupMatches = [...this.filterGroups.values()].map(group => {
        const groupFilters = [...group.filters];
        if (groupFilters.length === 0) return true;
        return group.operator === "OR" ? groupFilters.some(filter => itemCategories.has(filter)) : groupFilters.every(filter => itemCategories.has(filter));
      });
      return this.groupMode === "OR" ? groupMatches.some(matches => matches) : groupMatches.every(matches => matches);
    }

    /**
     * Update URL with current filter state
     * @private
     */
    updateURL() {
      // If only "*" filter is active or no filters are active, clear the URL
      if (this.currentFilters.size === 0 || this.currentFilters.size === 1 && this.currentFilters.has("*")) {
        window.history.pushState({}, "", window.location.pathname);
        return;
      }
      const params = new URLSearchParams(window.location.search);

      // Add groups to URL if they exist
      if (this.filterGroups.size > 0) {
        for (const [groupId, group] of this.filterGroups.entries()) {
          params.set(`group_${groupId}`, [...group.filters].join(","));
          params.set(`groupOp_${groupId}`, group.operator.toLowerCase());
        }
        params.set("groupMode", this.groupMode.toLowerCase());
      }

      // Separate filters by type
      const filtersByType = {};
      for (const filter of this.currentFilters) {
        if (filter !== "*") {
          const [type, value] = filter.split(":");
          if (!filtersByType[type]) {
            filtersByType[type] = new Set();
          }
          filtersByType[type].add(value);
        }
      }

      // Add each filter type to the URL
      Object.entries(filtersByType).forEach(_ref => {
        let [type, values] = _ref;
        params.set(type, Array.from(values).join(","));
      });
      if (this.currentSearch) {
        params.set("search", this.currentSearch);
      }
      const newURL = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
      window.history.pushState({}, "", newURL);
    }

    /**
     * Load filter state from URL
     * @private
     */
    loadFromURL() {
      const params = new URLSearchParams(window.location.search);

      // Load groups if they exist
      this.filterGroups.clear();
      for (const [key, value] of params.entries()) {
        if (key.startsWith("group_")) {
          const groupId = key.replace("group_", "");
          const operator = params.get(`groupOp_${groupId}`)?.toUpperCase() || "OR";
          const filters = value.split(",");
          this.addFilterGroup(groupId, filters, operator);
        }
      }

      // Set group mode if present
      const groupMode = params.get("groupMode")?.toUpperCase();
      if (groupMode && ["AND", "OR"].includes(groupMode)) {
        this.groupMode = groupMode;
      }
      this.currentFilters.clear();

      // Si aucun filtre n'est présent, utiliser '*'
      let hasFilters = false;

      // Parcourir tous les paramètres
      for (const [type, values] of params.entries()) {
        if (type !== "search") {
          hasFilters = true;
          values.split(",").forEach(value => {
            this.currentFilters.add(`${type}:${value}`);
          });
        }
      }
      if (!hasFilters) {
        this.currentFilters.add("*");
      }

      // Update active buttons
      this.filterButtons.forEach(button => {
        const filterValue = button.dataset.filter;
        if (this.currentFilters.has(filterValue) || filterValue === "*" && this.currentFilters.has("*")) {
          button.classList.add(this.options.activeClass);
        } else {
          button.classList.remove(this.options.activeClass);
        }
      });

      // Load search
      const search = params.get("search") || "";
      if (this.searchInput) {
        this.searchInput.value = search;
      }
      this.filter();
      if (search) {
        this.search(search);
      }
    }

    /**
     * Update results counter
     * @private
     * @returns {{total: number, visible: number}}
     */
    updateCounter() {
      const total = this.items.length;
      const visible = this.visibleItems.size;
      if (this.counter) {
        this.counter.textContent = `Showing ${visible} of ${total}`;
      }
      return {
        total,
        visible
      };
    }

    /**
     * Set animation options
     * @public
     * @param {Object} options - Animation options
     */
    setAnimationOptions() {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.options.animationDuration = options.duration || this.options.animationDuration;
      this.options.animationType = options.type || "ease-out";
      this.addStyles(); // Refresh styles with new options
    }

    /**
     * Event handling system
     */
    addEventSystem() {
      this.events = {};
      this.on = (eventName, callback) => {
        if (!this.events[eventName]) {
          this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
      };
      this.emit = (eventName, data) => {
        if (this.events[eventName]) {
          this.events[eventName].forEach(callback => callback(data));
        }
      };
    }

    /**
     * Add pagination
     * @public
     * @param {number} itemsPerPage - Number of items per page
     */
    setPagination(itemsPerPage) {
      this.pagination = {
        currentPage: 1,
        itemsPerPage: itemsPerPage,
        totalPages: Math.ceil(this.visibleItems.size / itemsPerPage)
      };
      this.updatePagination();
    }
    updatePagination() {
      const start = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;
      [...this.visibleItems].forEach((item, index) => {
        if (index >= start && index < end) {
          this.showItem(item);
        } else {
          this.hideItem(item);
        }
      });
    }

    /**
     * Enable analytics tracking
     * @public
     * @param {Function} callback - Analytics callback function
     */
    enableAnalytics(callback) {
      this.analyticsCallback = callback;
      this.on("filter", data => {
        this.analyticsCallback({
          type: "filter",
          filters: [...this.currentFilters],
          visibleItems: this.visibleItems.size,
          timestamp: new Date().toISOString()
        });
      });
    }

    /**
     * Sort with custom comparator
     * @public
     * @param {string} key - Data attribute key
     * @param {Function} comparator - Custom comparison function
     */
    sortWithComparator(key, comparator) {
      const items = [...this.items];
      items.sort((a, b) => {
        const valueA = a.dataset[key];
        const valueB = b.dataset[key];
        return comparator(valueA, valueB);
      });
      items.forEach(item => this.container.appendChild(item));
    }

    /**
     * Add responsive behavior
     * @public
     * @param {Object} breakpoints - Breakpoint configurations
     */
    setResponsiveOptions(breakpoints) {
      window.addEventListener("resize", debounce(() => {
        const width = window.innerWidth;
        for (const [breakpoint, options] of Object.entries(breakpoints)) {
          if (width <= parseInt(breakpoint)) {
            Object.assign(this.options, options);
            this.filter();
            break;
          }
        }
      }, 250));
    }

    /**
     * Enable keyboard navigation
     * @public
     */
    enableKeyboardNavigation() {
      document.addEventListener("keydown", e => {
        if (e.key === "Enter" && document.activeElement.classList.contains(this.options.filterButtonSelector.slice(1))) {
          document.activeElement.click();
        }
      });
    }

    /**
     * Export current filter state
     * @public
     * @returns {Object} Filter state
     */
    exportState() {
      return {
        filters: [...this.currentFilters],
        search: this.currentSearch,
        mode: this.options.filterMode,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * Import filter state
     * @public
     * @param {Object} state - Filter state to import
     */
    importState(state) {
      if (state.filters) {
        this.currentFilters = new Set(state.filters);
        this.currentSearch = state.search || "";
        this.options.filterMode = state.mode || "OR";
        this.filter();
        this.updateURL();
      }
    }

    /**
     * Save current filter state as preset
     * @public
     * @param {string} presetName - Name of the preset
     */
    savePreset(presetName) {
      const preset = {
        filters: [...this.currentFilters],
        search: this.currentSearch,
        mode: this.options.filterMode
      };
      localStorage.setItem(`afs_preset_${presetName}`, JSON.stringify(preset));
    }

    /**
     * Load filter preset
     * @public
     * @param {string} presetName - Name of the preset to load
     */
    loadPreset(presetName) {
      const preset = JSON.parse(localStorage.getItem(`afs_preset_${presetName}`));
      if (preset) {
        this.currentFilters = new Set(preset.filters);
        this.currentSearch = preset.search;
        this.options.filterMode = preset.mode;
        this.filter();
        this.updateURL();
      }
    }

    /**
     * Set filter logic mode (alias for setFilterMode)
     * @public
     * @param {string} logic - New filter logic ('AND' or 'OR')
     */
    setLogic(logic) {
      if (typeof logic === "boolean") {
        // Handle boolean input (true = AND, false = OR)
        this.options.filterMode = logic ? "AND" : "OR";
        this.filter();
        return;
      }
      const mode = logic.toUpperCase();
      if (["OR", "AND"].includes(mode)) {
        this.options.filterMode = mode;
        this.filter();
      }
    }

    /**
     * Change filter mode
     * @public
     * @param {string} mode - New filter mode ('OR' or 'AND')
     */
    setFilterMode(mode) {
      if (["OR", "AND"].includes(mode.toUpperCase())) {
        this.options.filterMode = mode.toUpperCase();
        this.filter();
      }
    }

    /**
     * Add filter by type and value
     * @public
     * @param {string} type - Filter type
     * @param {string} value - Filter value
     */
    addFilter(type, value) {
      this.currentFilters.add(`${type}:${value}`);
      this.filter();
      this.updateURL();
    }

    /**
     * Remove filter by type and value
     * @public
     * @param {string} type - Filter type
     */
    removeFilter(type, value) {
      this.currentFilters.delete(`${type}:${value}`);
      if (this.currentFilters.size === 0) {
        this.currentFilters.add("*");
      }
      this.filter();
      this.updateURL();
    }

    /**
     * Get active filters by type
     * @public
     * @param {string} type - Filter type
     */
    getActiveFiltersByType(type) {
      return [...this.currentFilters].filter(filter => filter.startsWith(`${type}:`)).map(filter => filter.split(":")[1]);
    }

    /**
     * Clear all filters, url and search
     * 
     * @public
     */
    clearAllFilters() {
      this.currentFilters.clear();
      this.currentFilters.add("*");
      this.filter();
      this.updateURL();

      // Uncheck all checkboxes if any with activeClass
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (checkbox.classList.contains(this.options.activeClass)) {
          checkbox.checked = false;
          checkbox.classList.remove(this.options.activeClass);
        }
      });

      // Clear active on buttons
      this.filterButtons.forEach(btn => {
        btn.classList.remove(this.options.activeClass);
      });
    }
  }

  exports.AFS = AFS;

}));
//# sourceMappingURL=AFS.js.map
