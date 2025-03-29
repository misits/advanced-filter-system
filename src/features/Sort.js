/**
 * @fileoverview Sort functionality for AFS
 */

export class Sort {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.sortButtons = new Map();
    this.setupSort();
  }

  /**
   * Setup sort functionality
   * @private
   */
  setupSort() {
    const sortSelector = this.afs.options.get("sortButtonSelector");
    if (!sortSelector) return;

    // Find and setup sort buttons
    const buttons = document.querySelectorAll(sortSelector);
    
    if (buttons.length === 0) {
      this.afs.logger.warn("No sort buttons found with selector:", sortSelector);
      return;
    }
    
    buttons.forEach((button) => {
      const key = button.dataset.sortKey;
      if (!key) {
        this.afs.logger.warn(
          "Sort button missing data-sort-key attribute:",
          button,
        );
        return;
      }

      this.sortButtons.set(button, {
        key,
        direction: button.dataset.sortDirection || "asc",
      });

      this.bindSortEvent(button);
    });

    this.afs.logger.debug("Sort functionality initialized");
  }

  /**
   * Bind sort event to button
   * @private
   * @param {HTMLElement} button - Sort button
   */
  bindSortEvent(button) {
    this.afs.logger.debug("Binding sort event to button:", button);

    button.addEventListener("click", () => {
      const sortData = this.sortButtons.get(button);
      if (!sortData) return;

      // Toggle direction
      sortData.direction = sortData.direction === "asc" ? "desc" : "asc";
      this.sortButtons.set(button, sortData);

      // Update button state
      this.updateSortButtonState(button, sortData);

      // Perform sort
      this.sort(sortData.key, sortData.direction);
    });
  }

  /**
   * Update sort button visual state
   * @private
   * @param {HTMLElement} button - Sort button
   * @param {Object} sortData - Sort data
   */
  updateSortButtonState(button, sortData) {
    // Remove active class from all buttons
    this.sortButtons.forEach((_, btn) => {
      btn.classList.remove(this.afs.options.get("activeSortClass"));
    });

    // Add active class to current button
    button.classList.add(this.afs.options.get("activeSortClass"));

    // Update direction indicator
    const indicator = button.querySelector(".sort-direction");
    if (indicator) {
      indicator.textContent = sortData.direction === "asc" ? "↑" : "↓";
    }
  }

  /**
   * Sort items
   * @public
   * @param {string} key - Sort key
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {boolean} Success status
   */
  sort(key, direction = "asc") {
    this.afs.logger.debug(`Sorting by ${key} in ${direction} order`);

    try {
      if (!key) {
        throw new Error("Sort key is required");
      }
      
      if (!["asc", "desc"].includes(direction.toLowerCase())) {
        this.afs.logger.warn(`Invalid sort direction: ${direction}, defaulting to "asc"`);
        direction = "asc";
      }

      // Update state
      this.afs.state.setState("sort.current", { key, direction });

      // Get all items as array
      const items = Array.from(this.afs.items);
      
      if (items.length === 0) {
        this.afs.logger.info("No items to sort");
        return true;
      }

      // Determine sort type
      const sortType = this.determineSortType(items[0], key);
      this.afs.logger.debug(`Determined sort type for key "${key}": ${sortType}`);

      // Sort items
      items.sort((a, b) => {
        try {
          const valueA = this.getSortValue(a, key, sortType);
          const valueB = this.getSortValue(b, key, sortType);
          return this.compareValues(valueA, valueB, direction);
        } catch (error) {
          this.afs.logger.error("Error during sort comparison:", error);
          return 0; // Keep original order for failed comparisons
        }
      });

      // Reorder DOM elements
      this.reorderItems(items);

      // Update URL and emit event
      this.afs.urlManager.updateURL();
      this.afs.emit("sort", { key, direction, sortType, itemCount: items.length });

      this.afs.logger.info(`Sorted ${items.length} items by ${key} ${direction} (${sortType})`);
      return true;
    } catch (error) {
      this.afs.logger.error("Sort error:", error);
      return false;
    }
  }

  /**
   * Determine sort type from item
   * @private
   * @param {HTMLElement} item - First item
   * @param {string} key - Sort key
   * @returns {string} Sort type
   */
  determineSortType(item, key) {
    // Guard against empty items array
    if (!item) {
      this.afs.logger.warn(`Cannot determine sort type: No items available for key ${key}`);
      return "string"; // Default to string sorting
    }

    // Check if dataset exists and has the key
    if (!item.dataset || !(key in item.dataset)) {
      this.afs.logger.warn(`Item missing dataset key: ${key}`, item);
      return "string";
    }

    const value = item.dataset[key];
    
    // Empty value check
    if (value === undefined || value === null || value === "") {
      return "string";
    }

    // Type detection with more robust checks
    if (!isNaN(parseFloat(value)) && isFinite(value)) return "number";
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      // Validate it's actually a valid date
      const date = new Date(value);
      return !isNaN(date.getTime()) ? "date" : "string";
    }

    return "string";
  }

  /**
   * Get sort value from item
   * @private
   * @param {HTMLElement} item - DOM element
   * @param {string} key - Sort key
   * @param {string} type - Sort type
   * @returns {any} Sort value
   */
  getSortValue(item, key, type) {
    // Handle undefined or null item
    if (!item) {
      this.afs.logger.warn("Undefined item in getSortValue");
      return null;
    }

    // Handle undefined dataset or key
    if (!item.dataset || !Object.prototype.hasOwnProperty.call(item.dataset, key)) {
      this.afs.logger.warn(`Missing data attribute: ${key} on item`, item);
      return type === "number" ? 0 : type === "date" ? 0 : "";
    }

    const value = item.dataset[key];
    
    // Handle empty values
    if (value === undefined || value === null || value === "") {
      return type === "number" ? 0 : type === "date" ? 0 : "";
    }

    switch (type) {
      case "number":
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
      case "date":
        const date = new Date(value).getTime();
        return isNaN(date) ? 0 : date;
      default:
        return String(value).toLowerCase();
    }
  }

  /**
   * Compare two values
   * @private
   * @param {any} a - First value
   * @param {any} b - Second value
   * @param {string} direction - Sort direction
   * @returns {number} Comparison result
   */
  compareValues(a, b, direction) {
    const modifier = direction === "asc" ? 1 : -1;

    if (a === b) return 0;
    if (a === undefined || a === null) return 1;
    if (b === undefined || b === null) return -1;

    return a > b ? modifier : -modifier;
  }

  /**
   * Reorder DOM elements
   * @private
   * @param {HTMLElement[]} items - Sorted items
   */
  reorderItems(items) {
    const containerSelector = this.afs.options.get("containerSelector");
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      this.afs.logger.error("Container not found:", containerSelector);
      return;
    }
    
    // Performance optimization: only move elements if needed
    // Use document position to determine if reordering is necessary
    let needsReordering = false;
    
    // Check if any items are out of order
    for (let i = 0; i < items.length - 1; i++) {
      if (!(items[i].compareDocumentPosition(items[i + 1]) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        needsReordering = true;
        break;
      }
    }
    
    if (!needsReordering) {
      this.afs.logger.debug("Items already in correct order, skipping DOM operations");
      return;
    }
    
    // Batch reordering with document fragment for better performance
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(item));
    container.appendChild(fragment);
    
    this.afs.logger.debug(`Reordered ${items.length} items`);
  }

  /**
   * Sort with multiple criteria
   * @public
   * @param {Array<{key: string, direction: string}>} criteria - Sort criteria
   * @returns {boolean} Success status
   */
  sortMultiple(criteria) {
    this.afs.logger.debug("Sorting by multiple criteria:", criteria);

    try {
      // Validate criteria
      if (!Array.isArray(criteria) || criteria.length === 0) {
        throw new Error("Sort criteria must be a non-empty array");
      }
      
      // Validate each criterion
      criteria.forEach((criterion, index) => {
        if (!criterion.key) {
          throw new Error(`Sort criterion at index ${index} missing key property`);
        }
        
        if (criterion.direction && !["asc", "desc"].includes(criterion.direction.toLowerCase())) {
          this.afs.logger.warn(`Invalid sort direction in criterion ${index}: ${criterion.direction}, defaulting to "asc"`);
          criterion.direction = "asc";
        }
      });

      const items = Array.from(this.afs.items);
      
      if (items.length === 0) {
        this.afs.logger.info("No items to sort");
        return true;
      }

      // Cache sort types for performance
      const sortTypes = {};
      criteria.forEach(criterion => {
        if (!sortTypes[criterion.key]) {
          sortTypes[criterion.key] = this.determineSortType(items[0], criterion.key);
        }
      });

      items.sort((a, b) => {
        for (const { key, direction = "asc" } of criteria) {
          try {
            const type = sortTypes[key] || "string";
            const valueA = this.getSortValue(a, key, type);
            const valueB = this.getSortValue(b, key, type);

            const comparison = this.compareValues(valueA, valueB, direction);
            if (comparison !== 0) return comparison;
          } catch (error) {
            this.afs.logger.error(`Error comparing values for key ${key}:`, error);
            // Continue to next criterion
          }
        }
        return 0;
      });

      this.reorderItems(items);

      // Update state with primary sort
      if (criteria.length > 0) {
        this.afs.state.setState("sort.current", criteria[0]);
      }

      this.afs.urlManager.updateURL();
      this.afs.emit("multiSort", { 
        criteria, 
        itemCount: items.length,
        sortTypes 
      });
      
      this.afs.logger.info(`Multi-sorted ${items.length} items with ${criteria.length} criteria`);
      return true;
    } catch (error) {
      this.afs.logger.error("Multiple sort error:", error);
      return false;
    }
  }

  /**
   * Sort with custom comparator
   * @public
   * @param {string} key - Sort key
   * @param {Function} comparator - Custom comparison function
   * @returns {boolean} Success status
   */
  sortWithComparator(key, comparator) {
    this.afs.logger.debug(`Sorting by ${key} with custom comparator`);

    try {
      // Validate parameters
      if (!key) {
        throw new Error("Sort key is required");
      }
      
      if (typeof comparator !== "function") {
        throw new Error("Comparator must be a function");
      }

      const items = Array.from(this.afs.items);
      
      if (items.length === 0) {
        this.afs.logger.info("No items to sort");
        return true;
      }

      items.sort((a, b) => {
        try {
          // Check if the items have the necessary data attribute
          if (!a.dataset || !b.dataset || !(key in a.dataset) || !(key in b.dataset)) {
            this.afs.logger.warn(`Missing data attribute ${key} in one or both items being compared`);
            return 0;
          }
          
          const valueA = a.dataset[key];
          const valueB = b.dataset[key];
          return comparator(valueA, valueB);
        } catch (error) {
          this.afs.logger.error("Error in custom comparator:", error);
          return 0; // Keep original order for failed comparisons
        }
      });

      this.reorderItems(items);
      
      // Don't update state with custom sort since it's not easily serializable
      
      this.afs.emit("customSort", { 
        key, 
        comparatorName: comparator.name || "anonymous", 
        itemCount: items.length 
      });
      
      this.afs.logger.info(`Custom sorted ${items.length} items by ${key}`);
      return true;
    } catch (error) {
      this.afs.logger.error("Custom sort error:", error);
      return false;
    }
  }

  /**
   * Shuffle items randomly
   * @public
   * @returns {boolean} Success status
   */
  shuffle() {
    this.afs.logger.debug("Shuffling items");

    try {
      const items = Array.from(this.afs.items);
      
      if (items.length === 0) {
        this.afs.logger.info("No items to shuffle");
        return true;
      }
      
      if (items.length === 1) {
        this.afs.logger.info("Only one item to shuffle, no change needed");
        return true;
      }

      this.afs.logger.debug(`Shuffling ${items.length} items`);

      // Fisher-Yates shuffle algorithm
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      this.reorderItems(items);

      // Clear current sort state
      this.afs.state.setState("sort.current", null);

      // Update UI
      this.sortButtons.forEach((_, button) => {
        button.classList.remove(this.afs.options.get("activeSortClass"));
        const indicator = button.querySelector(".sort-direction");
        if (indicator) indicator.textContent = "";
      });

      this.afs.urlManager.updateURL();
      this.afs.emit("shuffle", { itemCount: items.length });
      
      this.afs.logger.info(`Shuffled ${items.length} items`);
      return true;
    } catch (error) {
      this.afs.logger.error("Shuffle error:", error);
      return false;
    }
  }

  /**
   * Reset sort to default state
   * @public
   * @returns {boolean} Success status
   */
  reset() {
    this.afs.logger.debug("Resetting sort");

    try {
      // Clear sort state
      this.afs.state.setState("sort.current", null);

      // Reset UI
      this.sortButtons.forEach((_, button) => {
        button.classList.remove(this.afs.options.get("activeSortClass"));
        const indicator = button.querySelector(".sort-direction");
        if (indicator) indicator.textContent = "";
      });

      // Reset sort data
      let buttonCount = 0;
      this.sortButtons.forEach((data, button) => {
        data.direction = "asc";
        this.sortButtons.set(button, data);
        buttonCount++;
      });

      this.afs.urlManager.updateURL();
      this.afs.emit("sortReset", { buttonCount });
      
      this.afs.logger.info(`Sort reset: ${buttonCount} sort buttons reset to default state`);
      return true;
    } catch (error) {
      this.afs.logger.error("Sort reset error:", error);
      return false;
    }
  }

  /**
   * Get current sort state
   * @public
   * @returns {Object|null} Current sort state
   */
  getCurrentSort() {
    return this.afs.state.getState().sort.current;
  }

  /**
   * Add sort button dynamically
   * @public
   * @param {HTMLElement} button - Sort button element
   * @param {string} key - Sort key
   * @param {string} [direction='asc'] - Initial sort direction
   */
  addSortButton(button, key, direction = "asc") {
    if (!key) {
      this.afs.logger.warn("Sort key required for new sort button");
      return;
    }

    this.sortButtons.set(button, { key, direction });
    this.bindSortEvent(button);
    this.afs.logger.debug(`Added sort button for ${key}`);
  }

  /**
   * Remove sort button
   * @public
   * @param {HTMLElement} button - Sort button to remove
   */
  removeSortButton(button) {
    if (this.sortButtons.has(button)) {
      button.removeEventListener("click", this.bindSortEvent);
      this.sortButtons.delete(button);
      this.afs.logger.debug("Removed sort button");
    }
  }

  /**
   * Destroy sort functionality
   * @public
   */
  destroy() {
    this.sortButtons.forEach((_, button) => {
      this.removeSortButton(button);
    });
    this.sortButtons.clear();
    this.afs.logger.debug("Sort functionality destroyed");
  }
}
