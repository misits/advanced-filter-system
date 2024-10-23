/**
 * @fileoverview Advanced Filter System for DOM elements
 * @version 1.0.0
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
    return function executedFunction(...args) {
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
    constructor(options = {}) {
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
            ...options,
        };

        // Initialize elements
        this.container = document.querySelector(this.options.containerSelector);
        this.items = document.querySelectorAll(this.options.itemSelector);
        this.filterButtons = document.querySelectorAll(
            this.options.filterButtonSelector,
        );
        this.searchInput = document.querySelector(
            this.options.searchInputSelector,
        );
        this.counter = document.querySelector(this.options.counterSelector);

        // Initialize state
        this.currentFilters = new Set(["*"]);
        this.currentSearch = "";
        this.visibleItems = new Set(this.items);

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
        this.filterButtons.forEach((button) => {
            button.addEventListener("click", () =>
                this.handleFilterClick(button),
            );
        });

        if (this.searchInput) {
            this.searchInput.addEventListener(
                "input",
                debounce((e) => {
                    this.search(e.target.value);
                }, this.options.debounceTime),
            );
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
        this.filterButtons.forEach((btn) =>
            btn.classList.remove(this.options.activeClass),
        );
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

            if (this.currentFilters.size === 0) {
                this.resetFilters();
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
    filter() {
        this.visibleItems.clear(); // Start with an empty set

        this.items.forEach((item) => {
            if (this.currentFilters.has("*")) {
                this.showItem(item);
                this.visibleItems.add(item); // Add visible item to the set
            } else {
                const itemCategories = new Set(
                    item.dataset.categories?.split(" ") || [],
                );
                const matchesFilter =
                    this.options.filterMode === "OR"
                        ? this.matchesAnyFilter(itemCategories)
                        : this.matchesAllFilters(itemCategories);

                if (matchesFilter) {
                    this.showItem(item);
                    this.visibleItems.add(item); // Add visible item to the set
                } else {
                    this.hideItem(item);
                }
            }
        });

        setTimeout(() => {
            this.updateCounter();
        }, this.options.animationDuration);
    }

    /**
     * Check if item matches any active filter (OR mode)
     * @private
     * @param {Set} itemCategories - Item's categories
     * @returns {boolean} Whether item matches any filter
     */
    matchesAnyFilter(itemCategories) {
        return [...this.currentFilters].some((filter) => {
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
        return [...this.currentFilters].every((filter) => {
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
        let matches = 0;

        this.items.forEach((item) => {
            const searchText = this.options.searchKeys
                .map((key) => item.dataset[key] || "")
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                this.currentSearch === "" ||
                searchText.includes(this.currentSearch);

            if (matchesSearch) {
                this.showItem(item);
                matches++;
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

                const comparison =
                    criterion.direction === "asc"
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);

                if (comparison !== 0) return comparison;
            }
            return 0;
        });

        items.forEach((item) => this.container.appendChild(item));
    }

    /**
     * Filter items by numeric range
     * @public
     * @param {string} key - Data attribute key
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     */
    addRangeFilter(key, min, max) {
        this.items.forEach((item) => {
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
     * Update URL with current filter state
     * @private
     */
    updateURL() {
        const params = new URLSearchParams();

        // Séparer les filtres par type
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

        // Ajouter chaque type de filtre à l'URL
        Object.entries(filtersByType).forEach(([type, values]) => {
            params.set(type, Array.from(values).join(","));
        });

        if (this.currentSearch) {
            params.set("search", this.currentSearch);
        }

        const newURL = `${window.location.pathname}${
            params.toString() ? "?" + params.toString() : ""
        }`;
        window.history.pushState({}, "", newURL);
    }

    /**
     * Load filter state from URL
     * @private
     */
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        this.currentFilters.clear();

        // Si aucun filtre n'est présent, utiliser '*'
        let hasFilters = false;

        // Parcourir tous les paramètres
        for (const [type, values] of params.entries()) {
            if (type !== "search") {
                hasFilters = true;
                values.split(",").forEach((value) => {
                    this.currentFilters.add(`${type}:${value}`);
                });
            }
        }

        if (!hasFilters) {
            this.currentFilters.add("*");
        }

        // Update active buttons
        this.filterButtons.forEach((button) => {
            const filterValue = button.dataset.filter;
            if (
                this.currentFilters.has(filterValue) ||
                (filterValue === "*" && this.currentFilters.has("*"))
            ) {
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

        return { total, visible };
    }

    /**
     * Set filter logic mode (alias for setFilterMode)
     * @public
     * @param {string} logic - New filter logic ('AND' or 'OR')
     */
    setLogic(logic) {
        if (typeof logic === 'boolean') {
            // Handle boolean input (true = AND, false = OR)
            this.options.filterMode = logic ? 'AND' : 'OR';
            this.filter();
            return;
        }

        const mode = logic.toUpperCase();
        if (['OR', 'AND'].includes(mode)) {
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
        return [...this.currentFilters]
            .filter((filter) => filter.startsWith(`${type}:`))
            .map((filter) => filter.split(":")[1]);
    }
}

export { AFS };
