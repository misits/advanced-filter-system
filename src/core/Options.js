/**
 * @fileoverview Configuration management for AFS
 */

export class Options {
  /**
   * @typedef {Object} AFSOptions
   * @property {string} containerSelector - Main container selector
   * @property {string} itemSelector - Items to filter selector
   * @property {string} filterButtonSelector - Filter buttons selector
   * @property {string} searchInputSelector - Search input selector
   * @property {string} counterSelector - Results counter selector
   * @property {string} activeClass - Active state class
   * @property {string} hiddenClass - Hidden state class
   * @property {number} animationDuration - Animation duration in ms
   * @property {string} filterMode - Filter mode ('OR' or 'AND')
   * @property {string[]} searchKeys - Data attributes to search in
   * @property {number} debounceTime - Search debounce delay in ms
   * @property {boolean} debug - Enable debug mode
   * @property {string} logLevel - Log level
   * @property {string} dateFormat - Date format
   * @property {Object} counter - Counter-related options
   * @property {Object} styles - Style-related options
   */

  /**
   * @type {AFSOptions}
   */
  static defaults = {
    // Selectors
    containerSelector: ".afs-filter-container",
    itemSelector: ".afs-filter-item",
    filterButtonSelector: ".afs-btn-filter",
    searchInputSelector: ".afs-filter-search",
    counterSelector: ".afs-filter-counter",

    // Classes
    activeClass: "active",
    hiddenClass: "hidden",

    // Filtering
    filterMode: "OR",
    searchKeys: ["title"],
    debounceTime: 300,

    // Debug
    debug: false,
    logLevel: "info",

    // Date handling
    dateFormat: "YYYY-MM-DD",

    counter: {
      template: "Showing {visible} of {total}",
      showFiltered: true,
      filteredTemplate: "({filtered} filtered)",
      noResultsTemplate: "No items found",
      formatter: (num) => num.toLocaleString(),
    },

    // Styles
    styles: {
      slider: {
        // Add new UI options
        ui: {
          showHistogram: false,
          bins: 10, // Number of bins for histogram
          track: {
            radius: "0", // Button radius
            background: "#e5e7eb", // Track color
          },
          thumb: {
            radius: "50%", // Button radius
            size: "16px", // Button size
            background: "#000", // Button color
          },
          histogram: {
            background: "#e5e7eb", // Histogram background
            bar: {
              background: "#000", // Bar color
            },
          },
        },
      },
      pagination: {
        ui: {
          button: {
            background: "transparent",
            border: "1px solid #000",
            borderRadius: "4px",
            padding: "8px 12px",
            color: "#000",
            active: {
              background: "#000",
              color: "#fff",
            },
            hover: {
              background: "#000",
              color: "#fff",
            },
          },
        },
      },
      colors: {
        primary: "#000",
        background: "#e5e7eb",
        text: "#000",
      },
    },

    // Slider
    slider: {
      containerClass: "afs-range-slider",
      trackClass: "afs-range-track",
      thumbClass: "afs-range-thumb",
      valueClass: "afs-range-value",
      selectedClass: "afs-range-selected",
    },

    // Pagination
    pagination: {
      enabled: false,
      itemsPerPage: 10,
      container: ".afs-pagination-container",
      pageButtonClass: "afs-page-button",
      activePageClass: "afs-page-active",
      containerClass: "afs-pagination",
      scrollToTop: false,
      scrollOffset: 50,
      scrollBehavior: "smooth", // or 'auto' for instant scroll
    },

    // Animation
    animation: {
      type: "fade",
      duration: 300,
      easing: "ease-out",
      inClass: "afs-animation-enter",
      outClass: "afs-animation-leave",
    },
  };

  constructor(userOptions = {}) {
    this.options = this.mergeOptions(Options.defaults, userOptions);
    this.initializeStyles();
    this.validate();
  }

  /**
   * Initialize styles with defaults
   * @private
   */
  initializeStyles() {
    const defaultStyles = Options.defaults.styles;
    const currentStyles = this.options.styles || {};

    this.options.styles = this.mergeOptions(defaultStyles, currentStyles);

    // Ensure colors object exists and has all required properties
    this.options.styles.colors = {
      ...defaultStyles.colors,
      ...(currentStyles.colors || {}),
    };
  }

  /**
   * Deep merge options
   * @private
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged options
   */
  mergeOptions(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] !== null &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        // If the key doesn't exist in target or isn't an object, create/override it
        if (!target[key] || typeof target[key] !== "object") {
          result[key] = {};
        }
        // Recursively merge nested objects
        result[key] = this.mergeOptions(result[key], source[key]);
      } else if (source[key] !== undefined) {
        // Only override if the source value is defined
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Validate options
   * @private
   * @throws {Error} If options are invalid
   */
  validate() {
    // Required selectors
    const requiredSelectors = ["containerSelector", "itemSelector"];
    for (const selector of requiredSelectors) {
      if (typeof this.options[selector] !== "string") {
        throw new Error(`${selector} must be a string`);
      }
    }

    // Animation duration
    if (
      typeof this.options.animation.duration !== "number" ||
      this.options.animation.duration < 0
    ) {
      throw new Error("animationDuration must be a positive number");
    }

    // Filter mode
    if (!["OR", "AND"].includes(this.options.filterMode.toUpperCase())) {
      throw new Error('filterMode must be either "OR" or "AND"');
    }

    // Search keys
    if (
      !Array.isArray(this.options.searchKeys) ||
      this.options.searchKeys.length === 0
    ) {
      throw new Error("searchKeys must be a non-empty array");
    }

    // Counter validation
    if (this.options.counter) {
      if (typeof this.options.counter.template !== "string") {
        throw new Error("counter.template must be a string");
      }
      if (typeof this.options.counter.showFiltered !== "boolean") {
        this.options.counter.showFiltered = true; // Set default
      }
      if (typeof this.options.counter.formatter !== "function") {
        this.options.counter.formatter = (num) => num.toLocaleString(); // Set default
      }
    } else {
      this.options.counter = { ...Options.defaults.counter }; // Set defaults if missing
    }
  }

  /**
   * Get option value
   * @param {string} path - Dot notation path to option
   * @returns {any} Option value
   */
  get(path) {
    return path.split(".").reduce((obj, key) => obj?.[key], this.options);
  }

  /**
   * Set option value
   * @param {string} path - Dot notation path to option
   * @param {any} value - New value
   */
  set(path, value) {
    const parts = path.split(".");
    const last = parts.pop();
    const target = parts.reduce((obj, key) => {
      if (!(key in obj)) obj[key] = {};
      return obj[key];
    }, this.options);

    target[last] = value;
    this.validate();
  }

  /**
   * Update multiple options
   * @param {Object} updates - Options to update
   */
  update(updates) {
    this.options = this.mergeOptions(this.options, updates);
    this.validate();
  }

  /**
   * Reset options to defaults
   */
  reset() {
    this.options = { ...Options.defaults };
  }

  /**
   * Export options
   * @returns {Object} Current options
   */
  export() {
    return { ...this.options };
  }
}
