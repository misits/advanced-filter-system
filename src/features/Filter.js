/**
 * @fileoverview Filter functionality for AFS
 */

import { Animation } from '../styles/Animation.js';

export class Filter {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.animation = new Animation(afs);
    this.filterButtons = new Map();
    this.activeFilters = new Set(["*"]);
    this.currentFilters = new Set(["*"]);
    this.filterGroups = new Map();
    this.sortOrders = new Map();
    this.setupFilters();
  }

  /**
   * Setup filters
   * @private
   */
  setupFilters() {
    this.afs.logger.debug("Setting up filters");
    const filterSelector = this.afs.options.get("filterButtonSelector");
    if (!filterSelector) return;

    // Initialize filter buttons
    document.querySelectorAll(filterSelector).forEach((button) => {
      const filterValue = button.dataset.filter;
      if (!filterValue) {
        this.afs.logger.warn(
          "Filter button missing data-filter attribute:",
          button,
        );
        return;
      }

      this.filterButtons.set(button, filterValue);
      this.bindFilterEvent(button);
    });

    this.afs.logger.debug("Filters initialized");
  }

  /**
   * Set filter logic mode
   * @public
   * @param {string|boolean} logic - 'AND'/'OR' or true/false (true = AND, false = OR)
   */
  setLogic(logic) {
    if (typeof logic === "boolean") {
      // Handle boolean input (true = AND, false = OR)
      this.afs.options.set("filterMode", logic ? "AND" : "OR");
    } else {
      const mode = logic.toUpperCase();
      if (["OR", "AND"].includes(mode)) {
        this.afs.options.set("filterMode", mode);
      } else {
        this.afs.logger.warn(`Invalid filter mode: ${logic}`);
        return;
      }
    }

    this.afs.logger.debug(
      `Filter logic set to: ${this.afs.options.get("filterMode")}`,
    );
    this.applyFilters();
  }

  /**
   * Clear all filters
   * @public
   */
  clearAllFilters() {
    this.afs.logger.debug("Clearing all filters");

    // Reset filters
    this.activeFilters.clear();
    this.activeFilters.add("*");

    // Reset filter buttons
    this.filterButtons.forEach((_, button) => {
      button.classList.remove(this.afs.options.get("activeClass"));
    });

    // Reset filter groups
    this.filterGroups.clear();

    // Find and activate "all" button if exists
    const allButton = this.findAllButton();
    if (allButton) {
      allButton.classList.add(this.afs.options.get("activeClass"));
    }

    // Clear sorting
    this.sortOrders.clear();

    // Apply changes and update UI
    this.applyFilters();
    this.afs.urlManager.updateURL();
    this.afs.emit("filtersCleared");
  }

  /**
   * Bind filter event to button
   * @private
   * @param {HTMLElement} button - Filter button
   */
  bindFilterEvent(button) {
    this.afs.logger.debug("Binding filter event to button:", button);

    button.addEventListener("click", () => {
      const filterValue = this.filterButtons.get(button);

      if (!filterValue) return;

      if (filterValue === "*") {
        this.resetFilters();
      } else {
        this.toggleFilter(filterValue, button);
      }

      // Update the URL after filter change
      this.afs.urlManager.updateURL();
    });
  }

  /**
   * Reset filters to default state
   * @public
   */
  resetFilters() {
    this.afs.logger.debug("Resetting filters");
  
    // Clear existing filters
    this.activeFilters.clear();
    
    // Reset button states
    this.filterButtons.forEach((_, button) => {
      button.classList.remove(this.afs.options.get("activeClass"));
    });
  
    // Add "*" filter and activate "all" button
    this.activeFilters.add("*");
    const allButton = this.findAllButton();
    if (allButton) {
      allButton.classList.add(this.afs.options.get("activeClass"));
    }
  
    // Clear filter groups
    this.filterGroups.clear();
  
    // Create a promise to track animations
    const animationPromises = [];
  
    // Show all items with animation
    this.afs.items.forEach(item => {
      const promise = new Promise(resolve => {
        item.classList.remove(this.afs.options.get('hiddenClass'));
        item.style.display = 'block'; // Ensure item is visible
        
        requestAnimationFrame(() => {
          this.animation.applyShowAnimation(item, this.afs.options.get("animation.type"));
          // Resolve after animation duration
          setTimeout(resolve, this.afs.options.get("animation.duration") || 300);
        });
      });
      animationPromises.push(promise);
    });
  
    // Update state after all items are visible
    const visibleItems = new Set(this.afs.items);
    this.afs.state.setState("items.visible", visibleItems);
  
    // Wait for all animations to complete
    Promise.all(animationPromises).then(() => {
      // Update counter
      this.afs.updateCounter();
      
      // Update URL
      this.afs.urlManager.updateURL();
  
      // Emit event
      this.afs.emit("filtersReset");
    });
  }

  /**
   * Find "all" filter button
   * @private
   * @returns {HTMLElement|null} All button
   */
  findAllButton() {
    for (const [button, value] of this.filterButtons.entries()) {
      if (value === "*") return button;
    }

    return null;
  }

  handleFilterClick(button) {
    const filterValue = button.dataset.filter;
    this.afs.logger.debug("Filter clicked:", filterValue);

    if (filterValue === "*") {
      this.resetFilters();
    } else {
      this.toggleFilter(filterValue, button);
    }

    this.filter();

    // Call updateURL to reflect the new filter state in the URL
    this.updateURL();
  }

  /**
   * Toggle filter state
   * @private
   * @param {string} filterValue - Filter value
   * @param {HTMLElement} button - Filter button
   */
  toggleFilter(filterValue, button) {
    // Remove "all" filter
    this.activeFilters.delete("*");
    const allButton = this.findAllButton();
    if (allButton) {
      allButton.classList.remove(this.afs.options.get("activeClass"));
    }

    // Toggle filter
    if (button.classList.contains(this.afs.options.get("activeClass"))) {
      button.classList.remove(this.afs.options.get("activeClass"));
      this.activeFilters.delete(filterValue);

      // Reset to "all" if no filters active
      if (this.activeFilters.size === 0) {
        this.resetFilters();
        return;
      }
    } else {
      button.classList.add(this.afs.options.get("activeClass"));
      this.activeFilters.add(filterValue);
    }

    this.applyFilters();

    // Emit event
    this.afs.emit("filterToggled", {
      filter: filterValue,
      activeFilters: Array.from(this.activeFilters),
    });

    this.afs.logger.debug("Filter toggled:", filterValue);
  }

 /**
 * Apply current filters
 * @public
 */
 applyFilters() {
    const activeFilters = Array.from(this.activeFilters);
    this.afs.logger.debug("Active filters:", activeFilters);

    const previouslyVisible = new Set(this.afs.state.getState().items.visible);
    const visibleItems = new Set();

    // First determine visibility
    this.afs.items.forEach(item => {
        if (this.activeFilters.has("*") || this.itemMatchesFilters(item)) {
            visibleItems.add(item);
        }
    });

    // Update state before animations
    this.afs.state.setState("items.visible", visibleItems);

    // Track animation promises
    const animationPromises = [];

    // Apply animations
    this.afs.items.forEach(item => {
        const promise = new Promise(resolve => {
            if (visibleItems.has(item)) {
                // Show item
                item.classList.remove(this.afs.options.get('hiddenClass'));
                requestAnimationFrame(() => {
                    this.animation.applyShowAnimation(item, this.afs.options.get("animation.type"));
                    setTimeout(resolve, parseFloat(this.afs.options.get("animation.duration")) || 300);
                });
            } else {
                // Hide item
                requestAnimationFrame(() => {
                    this.animation.applyHideAnimation(item, this.afs.options.get("animation.type"));
                    setTimeout(resolve, parseFloat(this.afs.options.get("animation.duration")) || 300);
                });
            }
        });
        animationPromises.push(promise);
    });

    // Handle completion
    Promise.all(animationPromises).then(() => {
        // Ensure visible items remain visible
        visibleItems.forEach(item => {
            item.style.display = 'block';
            item.style.opacity = '1';
        });

        // Update UI
        this.afs.updateCounter();
        this.afs.urlManager.updateURL();

        this.afs.emit("filtersApplied", {
            activeFilters,
            visibleItems: visibleItems.size,
        });
    });

    // Emit visibility change events
    this.emitFilterEvents(previouslyVisible, visibleItems);
}

  /**
   * Check if item matches current filters
   * @private
   * @param {HTMLElement} item - DOM element
   * @returns {boolean} Whether item matches filters
   */
  itemMatchesFilters(item) {
    // Show all items if "*" is active
    if (this.activeFilters.has("*")) {
      return true;
    }
  
    // Regular filter matching
    const itemCategories = new Set(item.dataset.categories?.split(" ") || []);
  
    // If using filter groups
    if (this.filterGroups.size > 0) {
      return this.itemMatchesFilterGroups(itemCategories);
    }
  
    // Regular filtering
    return this.afs.options.get("filterMode") === "OR"
      ? this.itemMatchesAnyFilter(itemCategories)
      : this.itemMatchesAllFilters(itemCategories);
  }

  /**
   * Check if item matches any active filter (OR mode)
   * @private
   * @param {Set} itemCategories - Item's categories
   * @returns {boolean} Whether item matches any filter
   */
  itemMatchesAnyFilter(itemCategories) {
    return Array.from(this.activeFilters).some((filter) => {
      if (filter === "*") return true;
      return itemCategories.has(filter);
    });
  }

  /**
   * Check if item matches all active filters (AND mode)
   * @private
   * @param {Set} itemCategories - Item's categories
   * @returns {boolean} Whether item matches all filters
   */
  itemMatchesAllFilters(itemCategories) {
    return Array.from(this.activeFilters).every((filter) => {
      if (filter === "*") return true;
      return itemCategories.has(filter);
    });
  }

  /**
   * Check if item matches filter groups
   * @private
   * @param {Set} itemCategories - Item's categories
   * @returns {boolean} Whether item matches groups
   */
  itemMatchesFilterGroups(itemCategories) {
    const groupMatches = Array.from(this.filterGroups.values()).map((group) => {
      if (group.filters.size === 0) return true;

      return group.operator === "OR"
        ? Array.from(group.filters).some((filter) => itemCategories.has(filter))
        : Array.from(group.filters).every((filter) =>
            itemCategories.has(filter),
          );
    });

    return this.afs.options.get("groupMode") === "OR"
      ? groupMatches.some((matches) => matches)
      : groupMatches.every((matches) => matches);
  }

  /**
   * Emit filter-related events
   * @private
   * @param {Set} previouslyVisible - Previously visible items
   * @param {Set} nowVisible - Currently visible items
   */
  emitFilterEvents(previouslyVisible, nowVisible) {
    // Determine added and removed items
    const added = new Set(
      [...nowVisible].filter((item) => !previouslyVisible.has(item)),
    );
    const removed = new Set(
      [...previouslyVisible].filter((item) => !nowVisible.has(item)),
    );

    // Emit filter event
    this.afs.emit("filter", {
      activeFilters: Array.from(this.activeFilters),
      visibleItems: nowVisible.size,
      added: added.size,
      removed: removed.size,
    });

    // Emit specific events for added/removed items
    if (added.size > 0) {
      this.afs.emit("itemsShown", { items: added });
    }
    if (removed.size > 0) {
      this.afs.emit("itemsHidden", { items: removed });
    }
  }

  /**
   * Add or update a filter group
   * @public
   * @param {string} groupId - Group identifier
   * @param {string[]} filters - Array of filter values
   * @param {string} [operator='OR'] - Operator within group
   */
  addFilterGroup(groupId, filters, operator = "OR") {
    this.afs.logger.debug(`Adding filter group: ${groupId}`);

    if (!Array.isArray(filters)) {
      this.afs.logger.error("Filters must be an array");
      return;
    }

    const validOperator = operator.toUpperCase();
    if (!["AND", "OR"].includes(validOperator)) {
      this.afs.logger.warn(`Invalid operator: ${operator}, defaulting to OR`);
      operator = "OR";
    }

    this.filterGroups.set(groupId, {
      filters: new Set(filters),
      operator: validOperator,
    });

    this.applyFilters();
  }

  /**
   * Remove a filter group
   * @public
   * @param {string} groupId - Group identifier
   */
  removeFilterGroup(groupId) {
    if (this.filterGroups.delete(groupId)) {
      this.afs.logger.debug(`Removed filter group: ${groupId}`);

      if (this.filterGroups.size === 0) {
        this.resetFilters();
      } else {
        this.applyFilters();
      }
    }
  }

  /**
   * Set filter group mode
   * @public
   * @param {string} mode - Mode for combining groups
   */
  setGroupMode(mode) {
    const validMode = mode.toUpperCase();
    if (["AND", "OR"].includes(validMode)) {
      this.afs.options.set("groupMode", validMode);
      this.afs.logger.debug(`Set group mode to: ${validMode}`);
      this.applyFilters();
    } else {
      this.afs.logger.warn(`Invalid group mode: ${mode}`);
    }
  }

  /**
   * Add filter manually
   * @public
   * @param {string} filter - Filter value
   */
  addFilter(filter) {
    this.afs.logger.debug(`Adding filter: ${filter}`);

    if (filter === "*") {
      this.resetFilters();
      return;
    }

    this.activeFilters.delete("*");
    this.activeFilters.add(filter);

    // Update button states
    this.filterButtons.forEach((value, button) => {
      if (value === filter) {
        button.classList.add(this.afs.options.get("activeClass"));
      } else if (value === "*") {
        button.classList.remove(this.afs.options.get("activeClass"));
      }
    });

    this.applyFilters();
  }

  /**
   * Remove filter manually
   * @public
   * @param {string} filter - Filter value
   */
  removeFilter(filter) {
    this.afs.logger.debug(`Removing filter: ${filter}`);

    this.activeFilters.delete(filter);

    // Update button states
    this.filterButtons.forEach((value, button) => {
      if (value === filter) {
        button.classList.remove(this.afs.options.get("activeClass"));
      }
    });

    // Reset to all if no filters active
    if (this.activeFilters.size === 0) {
      this.resetFilters();
    } else {
      this.applyFilters();
    }
  }

  /**
   * Set filter mode
   * @public
   * @param {string} mode - Filter mode ('AND' or 'OR')
   */
  setFilterMode(mode) {
    this.afs.logger.debug(`Setting filter mode to: ${mode}`);

    const validMode = mode.toUpperCase();
    if (["AND", "OR"].includes(validMode)) {
      this.afs.options.set("filterMode", validMode);
      this.afs.logger.debug(`Set filter mode to: ${validMode}`);
      this.applyFilters();
    } else {
      this.afs.logger.warn(`Invalid filter mode: ${mode}`);
    }
  }

  /**
   * Get active filters
   * @public
   * @returns {Set} Active filters
   */
  getActiveFilters() {
    return new Set(this.activeFilters);
  }

  /**
   * Get filter groups
   * @public
   * @returns {Map} Filter groups
   */
  getFilterGroups() {
    return new Map(this.filterGroups);
  }

  /**
   * Add filter button dynamically
   * @public
   * @param {HTMLElement} button - Button element
   * @param {string} filter - Filter value
   */
  addFilterButton(button, filter) {
    if (!filter) {
      this.afs.logger.warn("Filter value required for new filter button");
      return;
    }

    this.filterButtons.set(button, filter);
    this.bindFilterEvent(button);
    this.afs.logger.debug(`Added filter button for: ${filter}`);
  }

  /**
   * Remove filter button
   * @public
   * @param {HTMLElement} button - Button to remove
   */
  removeFilter(filter) {
    this.afs.logger.debug(`Removing filter: ${filter}`);

    this.activeFilters.delete(filter);

    // Update button states
    this.filterButtons.forEach((value, button) => {
      if (value === filter) {
        button.classList.remove(this.afs.options.get("activeClass"));
      }
    });

    // Reset to all if no filters active
    if (this.activeFilters.size === 0) {
      this.resetFilters();
    } else {
      this.applyFilters();
    }
  }

  /**
   * Sort items with automatic order detection
   * @public
   * @param {string} key - The data attribute key to sort by
   */
  sortWithOrder(key) {
    this.afs.logger.debug(`Sorting by ${key}`);

    try {
      const items = Array.from(this.afs.items);

      // Toggle sort order for the key
      const currentOrder = this.sortOrders.get(key) || "asc";
      const newOrder = currentOrder === "asc" ? "desc" : "asc";
      this.sortOrders.set(key, newOrder);

      // Determine sort type from first item
      const sortType = this.determineSortType(items[0], key);

      // Sort items
      items.sort((a, b) => {
        const valueA = this.getSortValue(a, key, sortType);
        const valueB = this.getSortValue(b, key, sortType);

        return this.compareValues(valueA, valueB, newOrder);
      });

      // Reorder DOM elements
      this.reorderItems(items);

      // Emit event
      this.afs.emit("sort", { key, order: newOrder });

      this.afs.logger.info(`Sorted items by ${key} in ${newOrder} order`);

      return newOrder; // Return the new order for UI updates
    } catch (error) {
      this.afs.logger.error("Sort error:", error);
      return null;
    }
  }

  /**
   * Shuffle items randomly
   * @public
   */
  shuffle() {
    this.afs.logger.debug("Shuffling items");

    try {
      const items = Array.from(this.afs.items);

      // Fisher-Yates shuffle algorithm
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      // Use the existing reorderItems method to update the DOM
      this.reorderItems(items);

      // Clear any existing sort orders as we've shuffled
      this.sortOrders.clear();

      this.afs.emit("shuffled", {
        itemCount: items.length,
      });

      this.afs.logger.debug("Items shuffled successfully");
    } catch (error) {
      this.afs.logger.error("Shuffle error:", error);
    }
  }

  /**
   * Determine sort type from item value
   * @private
   * @param {HTMLElement} item - DOM element
   * @param {string} key - Sort key
   * @returns {string} Sort type ('number', 'date', or 'string')
   */
  determineSortType(item, key) {
    this.afs.logger.debug(`Determining sort type for ${key}`);

    const value = item.dataset[key];

    if (!value) return "string";
    if (!isNaN(value)) return "number";
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";

    return "string";
  }

  /**
   * Get sort value from item
   * @private
   * @param {HTMLElement} item - DOM element
   * @param {string} key - Sort key
   * @param {string} type - Sort type
   * @returns {any} Parsed value for sorting
   */
  getSortValue(item, key, type) {
    const value = item.dataset[key];

    switch (type) {
      case "number":
        return parseFloat(value) || 0;
      case "date":
        return new Date(value).getTime() || 0;
      default:
        return (value || "").toLowerCase();
    }
  }

  /**
   * Compare two values for sorting
   * @private
   * @param {any} a - First value
   * @param {any} b - Second value
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {number} Comparison result
   */
  compareValues(a, b, order) {
    // Handle null/undefined values
    if (a === null || a === undefined) return order === "asc" ? 1 : -1;
    if (b === null || b === undefined) return order === "asc" ? -1 : 1;

    // Compare values
    const comparison = a < b ? -1 : a > b ? 1 : 0;
    return order === "asc" ? comparison : -comparison;
  }

  /**
   * Reorder DOM elements
   * @private
   * @param {HTMLElement[]} items - Sorted items
   */
  reorderItems(items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(item));
    this.afs.container.appendChild(fragment);
  }

  /**
   * Get current sort order for key
   * @public
   * @param {string} key - Sort key
   * @returns {string} Current sort order ('asc' or 'desc')
   */
  getCurrentSortOrder(key) {
    return this.sortOrders.get(key) || "asc";
  }

  /**
   * Clear all sort orders
   * @public
   */
  clearSortOrders() {
    this.afs.logger.debug("Clearing all sort orders");

    this.sortOrders.clear();
    this.afs.emit("sortCleared");
  }

  /**
   * Clear all filters, url and search
   * @public
   */
  clearAllFilters() {
    this.afs.logger.debug("Clearing all filters and search");

    // Reset filters
    this.activeFilters.clear();
    this.activeFilters.add("*");

    // Update filter buttons
    this.filterButtons.forEach((_, button) => {
      button.classList.remove(this.afs.options.get("activeClass"));
    });

    // Find and activate "all" button if exists
    const allButton = this.findAllButton();
    if (allButton) {
      allButton.classList.add(this.afs.options.get("activeClass"));
    }

    // Clear checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (checkbox.classList.contains(this.afs.options.get("activeClass"))) {
        checkbox.checked = false;
        checkbox.classList.remove(this.afs.options.get("activeClass"));
      }
    });

    // Clear search
    if (this.afs.search) {
      this.afs.search.setValue("");
    }

    // Clear filter groups and sort orders
    this.filterGroups.clear();
    this.sortOrders.clear();

    // Apply changes and ensure counter is updated
    this.applyFilters();
    
    // Update URL if URLManager exists
    if (this.afs.urlManager) {
      this.afs.urlManager.updateURL();
    }

    // Emit event
    this.afs.emit("filtersCleared");

    this.afs.logger.info("All filters cleared");
  }

  /**
   * Refresh the view
   * @public
   */
  refresh() {
    this.afs.logger.debug("Refreshing view");

    this.applyFilters();
    this.afs.updateCounter();
  }

  removeFilterButton(button) {
    this.filterButtons.delete(button);
    button.removeEventListener("click", this.handleFilterClick);
  }

  /**
   * Destroy instance
   * @public
   */
  destroy() {
    this.filterButtons.forEach((_, button) => {
      this.removeFilterButton(button);
    });
    this.filterButtons.clear();
    this.activeFilters.clear();
    this.filterGroups.clear();
    this.afs.logger.debug("Filter functionality destroyed");
  }
}
