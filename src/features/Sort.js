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
    document.querySelectorAll(sortSelector).forEach((button) => {
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
   */
  sort(key, direction = "asc") {
    this.afs.logger.debug(`Sorting by ${key} in ${direction} order`);

    try {
      // Update state
      this.afs.state.setState("sort.current", { key, direction });

      // Get all items as array
      const items = Array.from(this.afs.items);

      // Determine sort type
      const sortType = this.determineSortType(items[0], key);

      // Sort items
      items.sort((a, b) => {
        const valueA = this.getSortValue(a, key, sortType);
        const valueB = this.getSortValue(b, key, sortType);

        return this.compareValues(valueA, valueB, direction);
      });

      // Reorder DOM elements
      this.reorderItems(items);

      // Update URL and emit event
      this.afs.urlManager.updateURL();
      this.afs.emit("sort", { key, direction });

      this.afs.logger.info(`Sorted items by ${key} ${direction}`);
    } catch (error) {
      this.afs.logger.error("Sort error:", error);
    }
  }

  /**
   * Determine sort type from first item
   * @private
   * @param {HTMLElement} item - First item
   * @param {string} key - Sort key
   * @returns {string} Sort type
   */
  determineSortType(item, key) {
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
   * @returns {any} Sort value
   */
  getSortValue(item, key, type) {
    const value = item.dataset[key];

    switch (type) {
      case "number":
        return parseFloat(value);
      case "date":
        return new Date(value).getTime();
      default:
        return value.toLowerCase();
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
    const container = this.afs.options.get("container");
    const fragment = document.createDocumentFragment();

    items.forEach((item) => fragment.appendChild(item));
    container.appendChild(fragment);
  }
  /**
   * Sort with multiple criteria
   * @public
   * @param {Array<{key: string, direction: string}>} criteria - Sort criteria
   */
  sortMultiple(criteria) {
    this.afs.logger.debug("Sorting by multiple criteria:", criteria);

    try {
      const items = Array.from(this.afs.items);

      items.sort((a, b) => {
        for (const { key, direction } of criteria) {
          const type = this.determineSortType(items[0], key);
          const valueA = this.getSortValue(a, key, type);
          const valueB = this.getSortValue(b, key, type);

          const comparison = this.compareValues(valueA, valueB, direction);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });

      this.reorderItems(items);

      // Update state with primary sort
      if (criteria.length > 0) {
        this.afs.state.setState("sort.current", criteria[0]);
      }

      this.afs.urlManager.updateURL();
      this.afs.emit("multiSort", { criteria });
    } catch (error) {
      this.afs.logger.error("Multiple sort error:", error);
    }
  }

  /**
   * Sort with custom comparator
   * @public
   * @param {string} key - Sort key
   * @param {Function} comparator - Custom comparison function
   */
  sortWithComparator(key, comparator) {
    this.afs.logger.debug(`Sorting by ${key} with custom comparator`);

    try {
      const items = Array.from(this.afs.items);

      items.sort((a, b) => {
        const valueA = a.dataset[key];
        const valueB = b.dataset[key];
        return comparator(valueA, valueB);
      });

      this.reorderItems(items);
      this.afs.emit("customSort", { key, comparator });
    } catch (error) {
      this.afs.logger.error("Custom sort error:", error);
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
      this.afs.emit("shuffle");
    } catch (error) {
      this.afs.logger.error("Shuffle error:", error);
    }
  }

  /**
   * Reset sort to default state
   * @public
   */
  reset() {
    this.afs.logger.debug("Resetting sort");

    // Clear sort state
    this.afs.state.setState("sort.current", null);

    // Reset UI
    this.sortButtons.forEach((_, button) => {
      button.classList.remove(this.afs.options.get("activeSortClass"));
      const indicator = button.querySelector(".sort-direction");
      if (indicator) indicator.textContent = "";
    });

    // Reset sort data
    this.sortButtons.forEach((data, button) => {
      data.direction = "asc";
      this.sortButtons.set(button, data);
    });

    this.afs.urlManager.updateURL();
    this.afs.emit("sortReset");
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
