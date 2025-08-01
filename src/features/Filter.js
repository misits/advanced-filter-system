/**
 * @fileoverview Filter functionality for AFS
 */

import { Animation } from "../styles/Animation.js";

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
    this.itemDisplayTypes = new Map(); // Store original display types
    this.exclusiveFilterTypes = new Set(); // Track filter types that should use exclusive toggle
    this.isScrolling = false;
    this.scrollTimeout = null;

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
          button
        );
        return;
      }

      this.filterButtons.set(button, filterValue);
      this.bindFilterEvent(button);
    });

    // Initialize filter dropdowns
    const filterDropdownSelector = this.afs.options.get(
      "filterDropdownSelector"
    );
    if (filterDropdownSelector) {
      document.querySelectorAll(filterDropdownSelector).forEach((dropdown) => {
        this.bindDropdownEvent(dropdown);
      });
    }

    // Store original display types for all items
    this.afs.items.forEach((item) => {
      const computedStyle = window.getComputedStyle(item);
      this.itemDisplayTypes.set(
        item,
        computedStyle.display === "none" ? "block" : computedStyle.display
      );
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
      `Filter logic set to: ${this.afs.options.get("filterMode")}`
    );
    this.applyFilters();
  }

  /**
   * Clear all filters and reset selects
   * @public
   */
  clearAllFilters() {
    this.afs.logger.debug("Clearing all filters and resetting selects");

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

    // Reset all select elements to their default values
    const filterDropdownSelector =
      this.afs.options.get("filterDropdownSelector") || ".afs-filter-dropdown";
    document.querySelectorAll(filterDropdownSelector).forEach((select) => {
      // Get the filter type from the select's data or ID
      const filterType =
        select.getAttribute("data-filter-type") ||
        select.id.replace("Filter", "").toLowerCase();

      // Find the "all" option for this filter type
      const allOption = Array.from(select.options).find((option) => {
        const value = option.value;
        return (
          value === "*" ||
          value === `${filterType}:all` ||
          value.endsWith(":all")
        );
      });

      if (allOption) {
        // Set value and dispatch change event
        select.value = allOption.value;

        // Create and dispatch change event
        const event = new Event("change", {
          bubbles: true,
          cancelable: true,
        });
        select.dispatchEvent(event);
      } else {
        // If no "all" option found, set to first option
        select.selectedIndex = 0;

        // Create and dispatch change event
        const event = new Event("change", {
          bubbles: true,
          cancelable: true,
        });
        select.dispatchEvent(event);
      }
    });

    // Clear sorting
    this.sortOrders.clear();

    // Apply changes and update UI
    this.applyFilters();
    this.afs.urlManager.updateURL();
    this.afs.emit("filtersCleared");

    this.afs.logger.debug("All filters cleared and selects reset");
  }

  /**
   * Bind filter event to dropdown
   * @private
   * @param {HTMLSelectElement} dropdown - Filter dropdown
   */
  bindDropdownEvent(dropdown) {
    this.afs.logger.debug("Binding filter event to dropdown:", dropdown);

    dropdown.addEventListener("change", () => {
      const selectedValue = dropdown.value;
      const [filterType] = selectedValue.split(":");

      // Only clear "*" if we're adding a specific filter
      if (selectedValue !== "*" && !selectedValue.endsWith(":all")) {
        this.activeFilters.delete("*");
      }

      // Remove existing filters of the same type
      this.activeFilters.forEach((existingFilter) => {
        if (existingFilter.startsWith(`${filterType}:`)) {
          this.activeFilters.delete(existingFilter);
        }
      });

      // Handle filter addition
      if (selectedValue === "*" || selectedValue.endsWith(":all")) {
        // If selecting 'all' for a type, just remove that type's filters
        // If no filters remain, add '*'
        if (this.activeFilters.size === 0) {
          this.activeFilters.add("*");
        }
      } else {
        // Add the new filter
        this.activeFilters.add(selectedValue);
      }

      // If no value is selected, set to first option
      if (!selectedValue && dropdown.options.length > 0) {
        dropdown.selectedIndex = 0;
        const firstValue = dropdown.options[0].value;
        this.activeFilters.add(firstValue);
      }

      this.applyFilters();
      this.afs.urlManager.updateURL();

      // Emit event
      this.afs.emit("filterChanged", {
        type: filterType,
        value: selectedValue || dropdown.options[0]?.value,
        activeFilters: Array.from(this.activeFilters),
      });
    });
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
    this.afs.items.forEach((item) => {
      const promise = new Promise((resolve) => {
        item.classList.remove(this.afs.options.get("hiddenClass"));

        requestAnimationFrame(() => {
          this.animation.applyShowAnimation(
            item,
            this.afs.options.get("animation.type")
          );
          // Resolve after animation duration
          setTimeout(
            resolve,
            this.afs.options.get("animation.duration") || 300
          );
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

    // Check if this is a radio button
    const isRadio =
      button.type === "radio" || button.getAttribute("type") === "radio";

    if (isRadio) {
      // For radio buttons, always activate the selected one and deactivate others in the same group
      const radioName = button.name || button.getAttribute("name");
      if (radioName) {
        // Deactivate other radio buttons in the same group
        document
          .querySelectorAll(`input[name="${radioName}"]`)
          .forEach((radio) => {
            radio.classList.remove(this.afs.options.get("activeClass"));
            const radioValue = this.filterButtons.get(radio);
            if (radioValue) {
              this.activeFilters.delete(radioValue);
            }
          });
      }

      // Activate the selected radio button
      button.classList.add(this.afs.options.get("activeClass"));
      this.activeFilters.add(filterValue);
    } else {
      // For checkboxes/buttons, handle exclusive toggle for same category
      const filterMode = this.afs.options.get("filterMode") || "OR";
      
      // Extract filter type/category from the filter value (e.g., "category:demo" -> "category")
      const [filterType] = filterValue.split(":");
      
      // Check if this filter type should use exclusive toggle
      const isExclusiveType = this.exclusiveFilterTypes.has(filterType);
      
      // Apply exclusive toggle if:
      // 1. Filter mode is OR globally, OR
      // 2. This specific filter type is set as exclusive
      if ((filterMode === "OR" || isExclusiveType) && filterType && filterValue.includes(":")) {
        // Find and deactivate other buttons with the same filter type
        this.filterButtons.forEach((value, btn) => {
          if (value !== filterValue && value.startsWith(`${filterType}:`)) {
            btn.classList.remove(this.afs.options.get("activeClass"));
            this.activeFilters.delete(value);
          }
        });
      }
      
      // Toggle the current button state
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
    this.afs.items.forEach((item) => {
      if (this.activeFilters.has("*") || this.itemMatchesFilters(item)) {
        visibleItems.add(item);
      }
    });

    // Update state before animations
    this.afs.state.setState("items.visible", visibleItems);

    // Special handling for all items visible case (no filters or "*" filter)
    const showingAllItems =
      this.activeFilters.has("*") || this.activeFilters.size === 0;

    // Track animation promises
    const animationPromises = [];

    // Apply animations
    this.afs.items.forEach((item) => {
      const promise = new Promise((resolve) => {
        if (visibleItems.has(item)) {
          // Show item
          item.classList.remove(this.afs.options.get("hiddenClass"));
          item.style.display = this.getItemDisplayType(item);

          requestAnimationFrame(() => {
            this.animation.applyShowAnimation(
              item,
              this.afs.options.get("animation.type")
            );
            setTimeout(
              resolve,
              parseFloat(this.afs.options.get("animation.duration")) || 300
            );
          });
        } else {
          // Hide item
          item.classList.add(this.afs.options.get("hiddenClass"));
          item.style.display = "none"; // Ensure item is hidden immediately
          requestAnimationFrame(() => {
            this.animation.applyHideAnimation(
              item,
              this.afs.options.get("animation.type")
            );
            setTimeout(
              resolve,
              parseFloat(this.afs.options.get("animation.duration")) || 300
            );
          });
        }
      });
      animationPromises.push(promise);
    });

    // Handle completion
    Promise.all(animationPromises).then(() => {
      // Ensure visible items remain visible and hidden items stay hidden
      this.afs.items.forEach((item) => {
        if (visibleItems.has(item)) {
          this.showItem(item);
          item.style.display = this.getItemDisplayType(item);
          item.style.opacity = "1";
        } else {
          item.style.display = "none";
          item.classList.add(this.afs.options.get("hiddenClass"));
        }
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
    // Show all items if only "*" is active
    if (this.activeFilters.has("*")) {
      return true;
    }

    // Get item categories
    const itemCategories = new Set(item.dataset.categories?.split(" ") || []);

    // Get current filter mode
    const filterMode = this.afs.options.get("filterMode") || "OR";

    // Use appropriate matching method based on filter mode
    return filterMode === "AND"
      ? this.itemMatchesAllFilters(itemCategories)
      : this.itemMatchesAnyFilter(itemCategories);
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
            itemCategories.has(filter)
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
      [...nowVisible].filter((item) => !previouslyVisible.has(item))
    );
    const removed = new Set(
      [...previouslyVisible].filter((item) => !nowVisible.has(item))
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

    // Extract filter type (e.g., 'date', 'canton')
    const [filterType] = filter.split(":");

    // Remove any existing filter of the same type
    this.activeFilters.forEach((existingFilter) => {
      if (existingFilter.startsWith(`${filterType}:`)) {
        this.activeFilters.delete(existingFilter);
      }
    });

    // Remove the all filter if it exists
    this.activeFilters.delete("*");

    // Add the new filter
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

    // Emit a custom event for filter removal
    this.afs.emit("filterRemoved", { filter, activeFilters: Array.from(this.activeFilters) });

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
   * Set a filter type to always use exclusive toggle (OR logic)
   * @public
   * @param {string|string[]} types - Filter type(s) to set as exclusive (e.g., 'category' or ['category', 'brand'])
   * @param {boolean} exclusive - Whether to set as exclusive (true) or remove exclusive behavior (false)
   */
  setFilterTypeExclusive(types, exclusive = true) {
    const typeArray = Array.isArray(types) ? types : [types];
    
    typeArray.forEach(type => {
      if (exclusive) {
        this.exclusiveFilterTypes.add(type);
        this.afs.logger.debug(`Set filter type '${type}' as exclusive`);
      } else {
        this.exclusiveFilterTypes.delete(type);
        this.afs.logger.debug(`Removed exclusive behavior from filter type '${type}'`);
      }
    });
    
    // Re-apply filters to ensure consistency
    this.applyFilters();
  }

  /**
   * Toggle a filter with exclusive behavior for its type (OR logic)
   * This will deactivate other filters of the same type regardless of global filter mode
   * @public
   * @param {string} filterValue - Filter value to toggle (e.g., 'category:tech')
   */
  toggleFilterExclusive(filterValue) {
    this.afs.logger.debug(`Toggling filter exclusively: ${filterValue}`);
    
    // Extract filter type from the filter value
    const [filterType] = filterValue.split(":");
    
    if (!filterType || !filterValue.includes(":")) {
      this.afs.logger.warn("Filter value must be in format 'type:value'");
      return;
    }
    
    // Remove "all" filter
    this.activeFilters.delete("*");
    const allButton = this.findAllButton();
    if (allButton) {
      allButton.classList.remove(this.afs.options.get("activeClass"));
    }
    
    // Find the button for this filter
    let targetButton = null;
    this.filterButtons.forEach((value, button) => {
      if (value === filterValue) {
        targetButton = button;
      }
    });
    
    if (!targetButton) {
      this.afs.logger.warn(`No button found for filter: ${filterValue}`);
      return;
    }
    
    // Check if this filter is currently active
    const isCurrentlyActive = this.activeFilters.has(filterValue);
    
    // Deactivate all filters of the same type
    this.filterButtons.forEach((value, btn) => {
      if (value.startsWith(`${filterType}:`)) {
        btn.classList.remove(this.afs.options.get("activeClass"));
        this.activeFilters.delete(value);
      }
    });
    
    // If the filter wasn't active, activate it
    if (!isCurrentlyActive) {
      targetButton.classList.add(this.afs.options.get("activeClass"));
      this.activeFilters.add(filterValue);
    } else {
      // If no filters remain active, reset to "all"
      if (this.activeFilters.size === 0) {
        this.resetFilters();
        return;
      }
    }
    
    this.applyFilters();
    this.afs.urlManager.updateURL();
    
    // Emit event
    this.afs.emit("filterToggledExclusive", {
      filter: filterValue,
      type: filterType,
      activeFilters: Array.from(this.activeFilters),
    });
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
    const checkboxes = document.querySelectorAll(
      `${this.afs.options.get("filterButtonSelector")}[type="checkbox"]`
    );
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

  /**
   * Get the original display type for an item
   * @private
   * @param {HTMLElement} item - DOM element
   * @returns {string} Original display type or 'block' if not stored
   */
  getItemDisplayType(item) {
    return this.itemDisplayTypes.get(item) || "block";
  }

  /**
   * Show an item with its original display value
   * @private
   * @param {HTMLElement} item - DOM element to show
   */
  showItem(item) {
    // Remove hidden class
    item.classList.remove(this.afs.options.get("hiddenClass"));
    
    // Get the original display type and restore it
    const originalDisplay = this.getItemDisplayType(item);
    
    // Only set display if it was previously hidden
    if (item.style.display === 'none') {
      // If we have a stored original display type, use it
      // Otherwise, remove the inline style to let CSS take over
      if (originalDisplay && originalDisplay !== 'none') {
        item.style.display = originalDisplay;
      } else {
        item.style.display = '';
      }
    }
    
    // Reset other hiding properties
    item.style.opacity = "1";
    item.style.visibility = "visible";
    item.style.filter = "none";
    item.style.transform = "";
  }
}
