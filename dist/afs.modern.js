/**
 * @fileoverview Logging system for AFS
 */

class Logger {
  constructor(debug = false, logLevel = 'info') {
    this.enabled = debug;
    this.level = logLevel;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Internal log method
   * @private
   */
  _log(level, ...args) {
    // Always log errors regardless of debug mode
    if (level === 'error' || this.enabled) {
      const currentLevelValue = this.levels[this.level];
      const messageLevel = this.levels[level];
      if (messageLevel <= currentLevelValue) {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[AFS ${level.toUpperCase()}]`;

        // Ensure console methods exist
        const consoleMethod = console[level] || console.log;
        consoleMethod.apply(console, [prefix, timestamp, ...args]);
      }
    }
  }

  /**
   * Log error message
   * @public
   */
  error(...args) {
    // Errors always get logged
    this._log('error', ...args);
  }

  /**
   * Log warning message
   * @public
   */
  warn(...args) {
    this._log('warn', ...args);
  }

  /**
   * Log info message
   * @public
   */
  info(...args) {
    this._log('info', ...args);
  }

  /**
   * Log debug message
   * @public
   */
  debug(...args) {
    this._log('debug', ...args);
  }

  /**
   * Enable or disable debug mode
   * @public
   */
  setDebugMode(enabled, level = 'info') {
    const previousState = this.enabled;
    this.enabled = Boolean(enabled);
    if (this.levels.hasOwnProperty(level)) {
      this.level = level;
    }

    // Log state change if either previous or new state is enabled
    if (this.enabled || previousState) {
      this._log('info', `Debug mode ${this.enabled ? 'enabled' : 'disabled'} with level: ${this.level}`);
    }
  }

  /**
   * Get current debug state
   * @public
   * @returns {Object} Current logger state
   */
  getState() {
    return {
      enabled: this.enabled,
      level: this.level
    };
  }
}

/**
 * @fileoverview Configuration management for AFS
 */

class Options {
  /**
   * @typedef {Object} AFSOptions
   * @property {string} containerSelector - Main container selector
   * @property {string} itemSelector - Items to filter selector
   * @property {string} filterButtonSelector - Filter buttons selector
   * @property {string} filterDropdownSelector - Filter dropdown selector
   * @property {string} searchInputSelector - Search input selector
   * @property {string} counterSelector - Results counter selector
   * @property {string} sortButtonSelector - Sort buttons selector
   * @property {string} activeClass - Active state class
   * @property {string} hiddenClass - Hidden state class
   * @property {string} activeSortClass - Active sort button class
   * @property {string} transitionClass - Transition animation class
   * @property {number} animationDuration - Animation duration in ms
   * @property {string} filterMode - Filter mode ('OR' or 'AND')
   * @property {string} groupMode - Group filter mode ('OR' or 'AND')
   * @property {string[]} searchKeys - Data attributes to search in
   * @property {number} debounceTime - Search debounce delay in ms
   * @property {boolean} debug - Enable debug mode
   * @property {string} logLevel - Log level
   * @property {string} dateFormat - Date format
   * @property {Object} counter - Counter-related options
   * @property {Object} styles - Style-related options
   * @property {boolean} responsive - Enable responsive mode
   * @property {boolean} preserveState - Preserve state between sessions
   * @property {number} stateExpiry - State expiry time in milliseconds
   * @property {boolean} observeDOM - Observe DOM changes
   */

  /**
   * @type {AFSOptions}
   */
  static defaults = {
    // Selectors
    containerSelector: ".afs-filter-container",
    itemSelector: ".afs-filter-item",
    filterButtonSelector: ".afs-btn-filter",
    filterDropdownSelector: ".afs-filter-dropdown",
    searchInputSelector: ".afs-filter-search",
    counterSelector: ".afs-filter-counter",
    sortButtonSelector: ".afs-btn-sort",
    // Classes
    activeClass: "active",
    hiddenClass: "hidden",
    activeSortClass: "sort-active",
    transitionClass: "afs-transition",
    // Filtering
    filterMode: "OR",
    groupMode: "AND",
    searchKeys: ["title"],
    debounceTime: 300,
    // Debug
    debug: false,
    logLevel: "info",
    // Lifecycle and state
    responsive: true,
    preserveState: false,
    stateExpiry: 86400000,
    // 24 hours in milliseconds
    observeDOM: false,
    // Date handling
    dateFormat: "YYYY-MM-DD",
    counter: {
      template: "Showing {visible} of {total}",
      showFiltered: true,
      filteredTemplate: "({filtered} filtered)",
      noResultsTemplate: "No items found",
      formatter: num => num.toLocaleString()
    },
    // Styles
    styles: {
      slider: {
        // Add new UI options
        ui: {
          showHistogram: false,
          bins: 10,
          // Number of bins for histogram
          track: {
            radius: "0",
            // Button radius
            background: "#e5e7eb" // Track color
          },
          selected: {
            background: "#000" // Selected color
          },
          thumb: {
            radius: "50%",
            // Button radius
            size: "16px",
            // Button size
            background: "#000" // Button color
          },
          histogram: {
            background: "#e5e7eb",
            // Histogram background
            bar: {
              background: "#000" // Bar color
            }
          }
        }
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
              color: "#fff"
            },
            hover: {
              background: "#000",
              color: "#fff"
            }
          }
        }
      },
      colors: {
        primary: "#000",
        background: "#e5e7eb",
        text: "#000",
        textHover: "#fff"
      }
    },
    // Slider
    slider: {
      containerClass: "afs-range-slider",
      trackClass: "afs-range-track",
      thumbClass: "afs-range-thumb",
      valueClass: "afs-range-value",
      selectedClass: "afs-range-selected"
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
      scrollBehavior: "smooth" // or 'auto' for instant scroll
    },
    // Animation
    animation: {
      type: "fade",
      duration: 300,
      easing: "ease-out",
      inClass: "afs-animation-enter",
      outClass: "afs-animation-leave"
    }
  };

  /**
   * Create Options instance
   * @param {Object} userOptions - User-provided options to override defaults
   * @throws {Error} If required options are missing or invalid
   */
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
      ...(currentStyles.colors || {})
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
    const result = {
      ...target
    };
    for (const key in source) {
      if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])) {
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
    if (typeof this.options.animation?.duration !== "number" || this.options.animation?.duration < 0) {
      throw new Error("animation.duration must be a positive number");
    }

    // Filter mode
    if (!["OR", "AND"].includes(this.options.filterMode.toUpperCase())) {
      throw new Error('filterMode must be either "OR" or "AND"');
    }

    // Group mode
    if (!["OR", "AND"].includes(this.options.groupMode.toUpperCase())) {
      throw new Error('groupMode must be either "OR" or "AND"');
    }

    // Search keys
    if (!Array.isArray(this.options.searchKeys) || this.options.searchKeys.length === 0) {
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
        this.options.counter.formatter = num => num.toLocaleString(); // Set default
      }
    } else {
      this.options.counter = {
        ...Options.defaults.counter
      }; // Set defaults if missing
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
    this.options = {
      ...Options.defaults
    };
  }

  /**
   * Export options
   * @returns {Object} Current options
   */
  export() {
    return {
      ...this.options
    };
  }
}

/**
 * @fileoverview State management for AFS
 */

class State {
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
      search: {
        ...this.state.search
      },
      sort: {
        ...this.state.sort
      },
      pagination: {
        ...this.state.pagination
      }
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
      this.state.search = {
        ...importedState.search
      };
    }
    if (importedState.sort) {
      this.state.sort = {
        ...importedState.sort
      };
    }
    if (importedState.pagination) {
      this.state.pagination = {
        ...importedState.pagination
      };
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

/**
 * @fileoverview Style management for AFS
 */

class StyleManager {
  /**
   * @param {import('../core/Options').Options} options - Options instance
   */
  constructor(options) {
    this.options = options;
    this.styleElement = null;
  }

  /**
   * Create base styles with option colors
   * @private
   * @returns {string} CSS styles
   */
  createBaseStyles() {
    const hiddenClass = this.options.get("hiddenClass") || "hidden";
    const itemSelector = this.options.get("itemSelector") || ".afs-filter-item";
    const filterButtonSelector = this.options.get("filterButtonSelector") || ".afs-btn-filter";
    const activeClass = this.options.get("activeClass") || "active";
    const animationDuration = this.options.get("animation.duration") || "300ms";
    const animationEasing = this.options.get("animation.easing") || "ease-out";
    const filterDropdownSelector = this.options.get("filterDropdownSelector") || ".afs-filter-dropdown";

    // Get colors from options
    const primaryColor = this.options.get("styles.colors.primary") || "#000";
    const backgroundColor = this.options.get("styles.colors.background") || "#e5e7eb";
    const textColor = this.options.get("styles.colors.text") || "#000";
    const textHoverColor = this.options.get("styles.colors.textHover") || "#fff";

    // Get button and dropdown styles from options
    const buttonStyles = this.options.get("styles.button") || {};
    const dropdownStyles = this.options.get("styles.dropdown") || {};
    const checkboxStyles = this.options.get("styles.checkbox") || {};
    const radioStyles = this.options.get("styles.radio") || {};

    // Common button and dropdown properties
    const buttonPadding = buttonStyles.padding || "4px 8px";
    const dropdownPadding = dropdownStyles.padding || "4px 32px 4px 8px";
    const buttonBorder = buttonStyles.border || `1px solid ${backgroundColor}`;
    const dropdownBorder = dropdownStyles.border || `1px solid ${backgroundColor}`;
    const buttonBorderRadius = buttonStyles.borderRadius || "4px";
    const dropdownBorderRadius = dropdownStyles.borderRadius || "4px";
    const buttonFontSize = buttonStyles.fontSize || "14px";
    const dropdownFontSize = dropdownStyles.fontSize || "14px";
    const buttonFontFamily = buttonStyles.fontFamily || "inherit";
    const dropdownFontFamily = dropdownStyles.fontFamily || "inherit";
    const buttonFontWeight = buttonStyles.fontWeight || "normal";
    const dropdownFontWeight = dropdownStyles.fontWeight || "normal";
    const buttonLineHeight = buttonStyles.lineHeight || "1.5";
    const dropdownLineHeight = dropdownStyles.lineHeight || "1.5";
    const buttonLetterSpacing = buttonStyles.letterSpacing || "normal";
    const dropdownLetterSpacing = dropdownStyles.letterSpacing || "normal";
    const buttonTextTransform = buttonStyles.textTransform || "none";
    const dropdownTextTransform = dropdownStyles.textTransform || "none";
    const buttonBoxShadow = buttonStyles.boxShadow || "none";
    const dropdownBoxShadow = dropdownStyles.boxShadow || "none";
    const buttonBackgroundColor = buttonStyles.background || "transparent";
    const dropdownBackgroundColor = dropdownStyles.background || "transparent";
    const buttonTextColor = buttonStyles.color || textColor;
    const dropdownTextColor = dropdownStyles.color || textColor;

    // Common checkbox styles
    const checkboxBorder = checkboxStyles.border || `1px solid ${backgroundColor}`;
    const checkboxBorderRadius = checkboxStyles.borderRadius || "4px";
    const checkboxBackgroundColor = checkboxStyles.background || "transparent";
    const checkboxTextColor = checkboxStyles.color || textColor;
    const checkboxPadding = checkboxStyles.padding || "8px";
    const checkboxHeight = checkboxStyles.height || "20px";
    const checkboxWidth = checkboxStyles.width || "20px";
    const checkboxActiveBorder = checkboxStyles.activeBorder || "none";

    // Common radio styles
    const radioBorder = radioStyles.border || `1px solid ${backgroundColor}`;
    const radioBorderRadius = radioStyles.borderRadius || "50%";
    const radioBackgroundColor = radioStyles.background || "transparent";
    const radioTextColor = radioStyles.color || textColor;
    const radioPadding = radioStyles.padding || "8px";
    const radioHeight = radioStyles.height || "20px";
    const radioWidth = radioStyles.width || "20px";
    const radioActiveBorder = radioStyles.activeBorder || "none";

    // Create rgba version of primary color for focus shadow
    const rgbValues = primaryColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    const rgbaColor = rgbValues ? `rgba(${parseInt(rgbValues[1], 16)}, ${parseInt(rgbValues[2], 16)}, ${parseInt(rgbValues[3], 16)}, 0.2)` : "rgba(0, 0, 0, 0.2)";

    // Create SVG arrow with dynamic color
    const arrowColor = encodeURIComponent(textColor);
    const arrowSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${arrowColor}' d='M6 8L1 3h10z'/%3E%3C/svg%3E`;
    return `
    /* Hidden state */
    .${hiddenClass} {
      display: none !important;
    }

    /* Filterable items */
    ${itemSelector} {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
      transition: opacity ${animationDuration} ${animationEasing},
                  transform ${animationDuration} ${animationEasing},
                  filter ${animationDuration} ${animationEasing};
    }

    ${itemSelector}.${hiddenClass} {
      opacity: 0;
      transform: scale(0.95);
      filter: blur(5px);
    }

    /* Common styles for both buttons and dropdowns */
    ${filterButtonSelector} {
      appearance: none;
      -webkit-appearance: none;
      padding: ${buttonPadding};
      border: ${buttonBorder};
      border-radius: ${buttonBorderRadius};
      font-size: ${buttonFontSize};
      font-family: ${buttonFontFamily};
      font-weight: ${buttonFontWeight};
      letter-spacing: ${buttonLetterSpacing};
      text-transform: ${buttonTextTransform};
      background-color: ${buttonBackgroundColor};
      color: ${buttonTextColor};
      cursor: pointer;
      transition: all ${animationDuration} ${animationEasing};
      line-height: ${buttonLineHeight};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      margin: 0;
      box-shadow: ${buttonBoxShadow};
    }

    ${filterDropdownSelector} {
      appearance: none;
      -webkit-appearance: none;
      padding: ${dropdownPadding};
      border: ${dropdownBorder};
      border-radius: ${dropdownBorderRadius};
      font-size: ${dropdownFontSize};
      font-family: ${dropdownFontFamily};
      font-weight: ${dropdownFontWeight};
      letter-spacing: ${dropdownLetterSpacing};
      text-transform: ${dropdownTextTransform};
      background-color: ${dropdownBackgroundColor};
      color: ${dropdownTextColor};
      cursor: pointer;
      transition: all ${animationDuration} ${animationEasing};
      line-height: ${dropdownLineHeight};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      margin: 0;
      box-shadow: ${dropdownBoxShadow};
    }

    /* Checkbox styles */
    ${filterButtonSelector}[type="checkbox"] {
      position: relative;
      appearance: none;
      -webkit-appearance: none;
      padding: ${checkboxPadding};
      background-color: ${checkboxBackgroundColor};
      color: ${checkboxTextColor};
      border: ${checkboxBorder};
      border-radius: ${checkboxBorderRadius};
      height: ${checkboxHeight};
      width: ${checkboxWidth};
      cursor: pointer;
      transition: all ${animationDuration} ${animationEasing};
    }

    ${filterButtonSelector}[type="checkbox"]:hover:before {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      border-radius: ${checkboxBorderRadius};
      border: ${checkboxActiveBorder};
    }
      
    ${filterButtonSelector}.${activeClass}[type="checkbox"]:before {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      border-radius: ${checkboxBorderRadius};
      border: ${checkboxActiveBorder};
    }

    /* Radio button styles */
    ${filterButtonSelector}[type="radio"] {
      position: relative;
      appearance: none;
      -webkit-appearance: none;
      padding: ${radioPadding};
      background-color: ${radioBackgroundColor};
      color: ${radioTextColor};
      border: ${radioBorder};
      border-radius: ${radioBorderRadius};
      height: ${radioHeight};
      width: ${radioWidth};
      cursor: pointer;
      transition: all ${animationDuration} ${animationEasing};
    }

    ${filterButtonSelector}[type="radio"]:hover:before {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      border-radius: ${radioBorderRadius};
      border: ${radioActiveBorder};
    }
      
    ${filterButtonSelector}.${activeClass}[type="radio"]:before {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      border-radius: ${radioBorderRadius};
      border: ${radioActiveBorder};
    }

    /* Hover state */
    ${filterButtonSelector}:hover,{
      border-color: ${primaryColor};
      background-color: ${primaryColor};
      color: ${textHoverColor};
      box-shadow: ${buttonStyles.hover?.boxShadow || dropdownStyles.hover?.boxShadow || "none"};
    }

    /* Focus state */
    ${filterButtonSelector}:focus,
    ${filterDropdownSelector}:focus {
      outline: none;
      border-color: ${primaryColor};
      box-shadow: 0 0 0 2px ${rgbaColor};
    }

    /* Active state */
    ${filterButtonSelector}.${activeClass} {
      background-color: ${primaryColor};
      border-color: ${primaryColor};
      color: ${textHoverColor};
      box-shadow: ${buttonStyles.active?.boxShadow || "none"};
    }

    /* Disabled state */
    ${filterButtonSelector}:disabled,
    ${filterDropdownSelector}:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: ${backgroundColor};
    }

    /* Dropdown specific styles */
    ${filterDropdownSelector} {
      padding: ${dropdownPadding};
      position: relative;
      background-image: url("${arrowSvg}");
      background-repeat: no-repeat;
      background-position: right 12px center;
      text-align: left;
    }

    /* Mobile optimization */
    @media (max-width: 768px) {
      ${filterButtonSelector},
      ${filterDropdownSelector} {
        width: 100%;
        justify-content: flex-start;
      }
    }
  `;
  }

  /**
   * Add global transition styles
   * @private
   */
  addTransitionStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .afs-transition {
          transition: opacity 300ms ease-in-out,
                      transform 300ms ease-in-out,
                      filter 300ms ease-in-out !important;
      }
      .afs-hidden {
          opacity: 0;
          pointer-events: none;
      }
  `;
    document.head.appendChild(style);
  }

  /**
   * Create range slider styles
   * @private
   * @returns {string} CSS styles
   */
  createRangeStyles() {
    const styles = this.options.get("styles");
    const sliderOptions = this.options.get("slider") || {};
    const sliderStyles = styles.slider;
    const colors = styles.colors;
    const containerClass = sliderOptions.containerClass || "afs-range-slider";
    const trackClass = sliderOptions.trackClass || "afs-range-track";
    const thumbClass = sliderOptions.thumbClass || "afs-range-thumb";
    const valueClass = sliderOptions.valueClass || "afs-range-value";
    const selectedClass = sliderOptions.selectedClass || "afs-range-selected";
    return `
    /* Range Slider Styles */
    .${containerClass} {
      position: relative;
      width: auto;
      height: 40px;
      margin: 10px 0;
      padding: 0 8px;
    }

    .${trackClass} {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      height: 4px;
      background: ${sliderStyles.ui.track.background || colors.background};
      border-radius: ${sliderStyles.ui.track.radius || "0"};
    }

    .${thumbClass} {
      position: absolute;
      top: 50%;
      width: ${sliderStyles.ui.thumb.size || "16px"};
      height: ${sliderStyles.ui.thumb.size || "16px"};
      background: ${sliderStyles.ui.thumb.background || colors.primary};
      border-radius: ${sliderStyles.ui.thumb.radius || "50%"};
      transform: translate(-50%, -50%);
      cursor: pointer;
      z-index: 2;
    }

    .${valueClass} {
      position: absolute;
      top: -20px;
      transform: translateX(-50%);
      font-size: 10px;
      color: ${colors.text};
    }

    .${selectedClass} {
      position: absolute;
      height: 4px;
      background: ${sliderStyles.ui.selected.background || colors.primary};
      top: 50%;
      transform: translateY(-50%);
    }

    /* Histogram Styles */
    .afs-histogram {
      position: absolute;
      bottom: 22px;
      left: 8px;
      right: 8px;
      height: 20px;
      display: flex;
      align-items: flex-end;
      gap: 1px;
      opacity: 0.5;
    }

    .afs-histogram-bar {
      flex: 1;
      background-color: ${sliderStyles.ui.histogram.background || colors.background};
      min-height: 4px;
      transition: background-color 0.2s ease;
    }

    .afs-histogram-bar.active {
      background-color: ${sliderStyles.ui.histogram.bar.background || colors.primary};
    }
  `;
  }

  /**
   * Create date filter styles
   * @private
   * @returns {string} CSS styles
   */
  createDateStyles() {
    const colors = this.options.get("styles").colors;
    return `
    .afs-date-range-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 10px 0;
    }

    .afs-date-input-wrapper {
      flex: 1;
    }

    .afs-date-input-wrapper label {
      display: block;
      font-size: 0.875rem;
      color: ${colors.text};
      margin-bottom: 0.5rem;
    }

    .afs-date-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid ${colors.background};
      border-radius: 0.25rem;
      font-size: 0.875rem;
      color: ${colors.text};
      transition: border-color 0.2s ease;
    }

    .afs-date-input:focus {
      outline: none;
      border-color: ${colors.primary};
    }
  `;
  }

  /**
   * Create date filter styles
   * @private
   * @returns {string} CSS styles
   */
  createInputRangeStyles() {
    const colors = this.options.get("styles").colors;
    return `
        .afs-input-range-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin: 10px 0;
        }

        .afs-input-wrapper {
            flex: 1;
        }

        .afs-input-label {
            display: block;
            font-size: 0.875rem;
            color: ${colors.text};
            margin-bottom: 0.5rem;
        }

        .afs-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid ${colors.background};
            border-radius: 0.25rem;
            font-size: 0.875rem;
            color: ${colors.text};
            transition: border-color 0.2s ease;
        }

        .afs-input:focus {
            outline: none;
            border-color: ${colors.primary};
        }
    `;
  }

  /**
   * Apply all styles
   * @public
   */
  applyStyles() {
    try {
      const styles = `
      
      /* Global transition styles */
      ${this.addTransitionStyles()}

      /* Base styles */
      ${this.createBaseStyles()}

      /* Range slider styles */
      ${this.createRangeStyles()}

      /* Date filter styles */
      ${this.createDateStyles()}

      /* Pagination styles */
      ${this.createPaginationStyles()}

      /* Search styles */
      ${this.createSearchStyles()}

      /* Input range styles */
      ${this.createInputRangeStyles()}
    `;
      if (this.styleElement) {
        this.styleElement.textContent = styles;
      } else {
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = styles;
        document.head.appendChild(this.styleElement);
      }
    } catch (error) {
      console.error("Error applying styles:", error);
      const fallbackStyles = this.createBaseStyles();
      if (this.styleElement) {
        this.styleElement.textContent = fallbackStyles;
      } else {
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = fallbackStyles;
        document.head.appendChild(this.styleElement);
      }
    }
  }

  /**
   * Create pagination styles
   * @private
   * @returns {string} CSS styles
   */
  createPaginationStyles() {
    const styles = this.options.get("styles");
    const paginationOptions = this.options.get("pagination") || {};
    const colors = this.options.get("styles").colors;
    const containerClass = paginationOptions.containerClass || "afs-pagination";
    const buttonClass = paginationOptions.pageButtonClass || "afs-page-button";
    const activeClass = paginationOptions.activePageClass || "afs-page-active";
    const paginationStyles = styles.pagination;
    return `
      .${containerClass} {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
      }

      .${buttonClass} {
        padding: ${paginationStyles.ui.button.padding || "8px 12px"};
        border: ${paginationStyles.ui.button.border || "1px solid " + colors.primary};
        border-radius: ${paginationStyles.ui.button.borderRadius || "4px"};
        cursor: pointer;
        transition: all 200ms ease-out;
        background: ${paginationStyles.ui.button.background || "transparent"};
        color: ${paginationStyles.ui.button.color || colors.primary};
      }

      .${buttonClass}:hover {
        background: ${paginationStyles.ui.button.hover.background || colors.primary};
        color: ${paginationStyles.ui.button.hover.color || "white"};
      }

      .${buttonClass}.${activeClass} {
        background: ${paginationStyles.ui.button.active.background || colors.primary};
        color: ${paginationStyles.ui.button.active.color || "white"};
      }

      .${buttonClass}:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  /**
   * Create search styles
   * @private
   * @returns {string} CSS styles
   */
  createSearchStyles() {
    const searchClass = this.options.get("searchInputClass") || "afs-search";
    const colors = this.options.get("styles").colors;
    return `
      .${searchClass} {
        padding: 8px;
        border: 1px solid ${colors.background};
        border-radius: 4px;
        width: 100%;
        max-width: 300px;
        transition: border-color 200ms ease-out;
      }

      .${searchClass}:focus {
        outline: none;
        border-color: ${colors.primary};
      }
    `;
  }

  /**
   * Update styles
   * @public
   * @param {Object} newOptions - New style options
   */
  updateStyles(newOptions) {
    this.options = newOptions;
    this.applyStyles();
  }

  /**
   * Remove styles
   * @public
   */
  removeStyles() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}

/**
 * @fileoverview Event handling system for AFS
 */

class EventEmitter {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName).add(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback) {
    const onceWrapper = (...args) => {
      this.off(eventName, onceWrapper);
      callback.apply(this, args);
    };
    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, new Map());
    }
    this.onceEvents.get(eventName).set(callback, onceWrapper);
    return this.on(eventName, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   */
  off(eventName, callback) {
    // Remove from regular events
    if (this.events.has(eventName)) {
      this.events.get(eventName).delete(callback);

      // Cleanup if no more listeners
      if (this.events.get(eventName).size === 0) {
        this.events.delete(eventName);
      }
    }

    // Remove from once events
    if (this.onceEvents.has(eventName)) {
      const onceWrapper = this.onceEvents.get(eventName).get(callback);
      if (onceWrapper) {
        this.events.get(eventName)?.delete(onceWrapper);
        this.onceEvents.get(eventName).delete(callback);
      }

      // Cleanup if no more once listeners
      if (this.onceEvents.get(eventName).size === 0) {
        this.onceEvents.delete(eventName);
      }
    }
  }

  /**
   * Emit an event
   * @param {string} eventName - Name of the event
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(eventName, ...args) {
    if (this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => {
        try {
          callback.apply(this, args);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   * @param {string} [eventName] - Optional event name to clear specific event
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
      this.onceEvents.delete(eventName);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    return (this.events.get(eventName)?.size || 0) + (this.onceEvents.get(eventName)?.size || 0);
  }
}

/**
 * @fileoverview Animation management for AFS
 */

class Animation {
  constructor(afs) {
    this.afs = afs;
    this.options = this.afs.options;
    this.animations = {
      fade: {
        in: {
          opacity: 1,
          transform: "scale(1)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "scale(0.95)",
          transitionTimingFunction: "ease-out"
        }
      },
      slide: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in-out"
        },
        out: {
          opacity: 0,
          transform: "translateY(20px)",
          transitionTimingFunction: "ease-in-out"
        }
      },
      scale: {
        in: {
          opacity: 1,
          transform: "scale(1)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "scale(0.8)",
          transitionTimingFunction: "ease-out"
        }
      },
      rotate: {
        in: {
          opacity: 1,
          transform: "rotate(0deg) scale(1)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "rotate(90deg) scale(0.9)",
          transitionTimingFunction: "ease-out"
        }
      },
      flip: {
        in: {
          opacity: 1,
          transform: "rotateY(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "rotateY(180deg)",
          transitionTimingFunction: "ease-out"
        }
      },
      zoom: {
        in: {
          opacity: 1,
          transform: "scale(1.2)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "scale(0.8)",
          transitionTimingFunction: "ease-out"
        }
      },
      bounce: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          animation: "bounce 1s cubic-bezier(0.68, -0.55, 0.27, 1.55)"
        },
        out: {
          opacity: 0,
          transform: "translateY(-20px)",
          animation: "bounceOut 1s ease-out"
        }
      },
      blur: {
        in: {
          opacity: 1,
          filter: "blur(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          filter: "blur(5px)",
          transitionTimingFunction: "ease-out"
        }
      },
      skew: {
        in: {
          opacity: 1,
          transform: "skew(0deg)",
          transitionTimingFunction: "ease-in-out"
        },
        out: {
          opacity: 0,
          transform: "skew(10deg)",
          transitionTimingFunction: "ease-in-out"
        }
      },
      slideInLeft: {
        in: {
          opacity: 1,
          transform: "translateX(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "translateX(-100%)",
          transitionTimingFunction: "ease-out"
        }
      },
      slideInRight: {
        in: {
          opacity: 1,
          transform: "translateX(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "translateX(100%)",
          transitionTimingFunction: "ease-out"
        }
      },
      fadeInUp: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "translateY(10px)",
          transitionTimingFunction: "ease-out"
        }
      },
      fadeInDown: {
        in: {
          opacity: 1,
          transform: "translateY(0)",
          transitionTimingFunction: "ease-in"
        },
        out: {
          opacity: 0,
          transform: "translateY(-10px)",
          transitionTimingFunction: "ease-out"
        }
      },
      bounceIn: {
        in: {
          opacity: 1,
          transform: "scale(1.05)",
          transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
        },
        out: {
          opacity: 0,
          transform: "scale(0.9)",
          transitionTimingFunction: "ease-out"
        }
      }
    };
  }

  /**
   * Apply show animation
   * @param {HTMLElement} item - Item to animate
   * @param {string} animationType - Type of animation
   */
  applyShowAnimation(item, animationType = "fade") {
    const animation = this.animations[animationType]?.in || this.animations.fade.in;

    // Ensure item has transition class
    item.classList.add("afs-transition");

    // Set initial state
    item.style.display = this.afs.filter.getItemDisplayType(item);
    item.style.visibility = "visible";

    // Special handling for mobile - immediately remove any blur
    if (window.innerWidth <= 768) {
      item.style.filter = "none";
    }

    // Add animation properties
    requestAnimationFrame(() => {
      Object.assign(item.style, {
        opacity: "0",
        transform: "scale(0.95)",
        display: this.afs.filter.getItemDisplayType(item)
      });

      // Apply final state
      requestAnimationFrame(() => {
        Object.assign(item.style, animation);
      });
    });

    // Ensure cleanup after animation completes
    const duration = this.afs.options.get("animation.duration") || 300;
    setTimeout(() => {
      // Special handling for mobile - explicitly clean up all transition styles
      if (window.innerWidth <= 768) {
        item.style.transform = "";
        item.style.opacity = "1";
        item.style.filter = "none";
        item.style.transition = "";
      } else if (this.afs.state.getState().items.visible.has(item)) {
        // Only clean up if item is still meant to be visible
        Object.assign(item.style, {
          transform: "",
          opacity: "1",
          filter: "none",
          display: this.afs.filter.getItemDisplayType(item)
        });
      }
    }, duration + 50); // Add a small buffer for animation completion
  }

  /**
   * Apply hide animation
   * @param {HTMLElement} item - Item to animate
   * @param {string} animationType - Type of animation
   */
  applyHideAnimation(item, animationType = "fade") {
    const animation = this.animations[animationType]?.out || this.animations.fade.out;

    // Ensure item has transition class
    item.classList.add("afs-transition");

    // Set initial state
    item.style.display = this.afs.filter.getItemDisplayType(item);
    item.style.visibility = "visible";

    // Add animation properties
    requestAnimationFrame(() => {
      Object.assign(item.style, animation);
    });

    // Ensure final state after animation
    const duration = this.afs.options.get("animation.duration") || 300;
    setTimeout(() => {
      if (!this.afs.state.getState().items.visible.has(item)) {
        item.style.display = "none";
        item.style.visibility = "hidden";
        item.style.opacity = "0";
        item.style.transform = "";
        item.style.filter = "none";
        item.style.transition = "";
      }
    }, duration + 50);
  }

  /**
   * Update animation settings
   * @param {Object} options - Animation options
   */
  updateOptions(options) {
    const duration = options.duration || 300;
    const timing = options.timing || "ease-in-out";
    const style = document.querySelector(".afs-transition");
    if (style) {
      style.textContent = `
              .afs-transition {
                  transition: opacity ${duration}ms ${timing},
                              transform ${duration}ms ${timing},
                              filter ${duration}ms ${timing} !important;
              }
          `;
    }
  }

  /**
   * Set animation type
   * @param {string} animationType - Animation type to set
   */
  setAnimation(animationType) {
    if (this.animations[animationType]) {
      this.afs.options.set("animation.type", animationType);
    }
  }
}

/**
 * @fileoverview Filter functionality for AFS
 */

class Filter {
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
    document.querySelectorAll(filterSelector).forEach(button => {
      const filterValue = button.dataset.filter;
      if (!filterValue) {
        this.afs.logger.warn("Filter button missing data-filter attribute:", button);
        return;
      }
      this.filterButtons.set(button, filterValue);
      this.bindFilterEvent(button);
    });

    // Initialize filter dropdowns
    const filterDropdownSelector = this.afs.options.get("filterDropdownSelector");
    if (filterDropdownSelector) {
      document.querySelectorAll(filterDropdownSelector).forEach(dropdown => {
        this.bindDropdownEvent(dropdown);
      });
    }

    // Store original display types for all items
    this.afs.items.forEach(item => {
      const computedStyle = window.getComputedStyle(item);
      this.itemDisplayTypes.set(item, computedStyle.display === "none" ? "block" : computedStyle.display);
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
    this.afs.logger.debug(`Filter logic set to: ${this.afs.options.get("filterMode")}`);
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
    const filterDropdownSelector = this.afs.options.get("filterDropdownSelector") || ".afs-filter-dropdown";
    document.querySelectorAll(filterDropdownSelector).forEach(select => {
      // Get the filter type from the select's data or ID
      const filterType = select.getAttribute("data-filter-type") || select.id.replace("Filter", "").toLowerCase();

      // Find the "all" option for this filter type
      const allOption = Array.from(select.options).find(option => {
        const value = option.value;
        return value === "*" || value === `${filterType}:all` || value.endsWith(":all");
      });
      if (allOption) {
        // Set value and dispatch change event
        select.value = allOption.value;

        // Create and dispatch change event
        const event = new Event("change", {
          bubbles: true,
          cancelable: true
        });
        select.dispatchEvent(event);
      } else {
        // If no "all" option found, set to first option
        select.selectedIndex = 0;

        // Create and dispatch change event
        const event = new Event("change", {
          bubbles: true,
          cancelable: true
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
      this.activeFilters.forEach(existingFilter => {
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
        activeFilters: Array.from(this.activeFilters)
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
    this.afs.items.forEach(item => {
      const promise = new Promise(resolve => {
        item.classList.remove(this.afs.options.get("hiddenClass"));
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

    // Check if this is a radio button
    const isRadio = button.type === "radio" || button.getAttribute("type") === "radio";
    if (isRadio) {
      // For radio buttons, always activate the selected one and deactivate others in the same group
      const radioName = button.name || button.getAttribute("name");
      if (radioName) {
        // Deactivate other radio buttons in the same group
        document.querySelectorAll(`input[name="${radioName}"]`).forEach(radio => {
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
      activeFilters: Array.from(this.activeFilters)
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

    // Special handling for all items visible case (no filters or "*" filter)
    this.activeFilters.has("*") || this.activeFilters.size === 0;

    // Track animation promises
    const animationPromises = [];

    // Apply animations
    this.afs.items.forEach(item => {
      const promise = new Promise(resolve => {
        if (visibleItems.has(item)) {
          // Show item
          item.classList.remove(this.afs.options.get("hiddenClass"));
          item.style.display = this.getItemDisplayType(item);
          requestAnimationFrame(() => {
            this.animation.applyShowAnimation(item, this.afs.options.get("animation.type"));
            setTimeout(resolve, parseFloat(this.afs.options.get("animation.duration")) || 300);
          });
        } else {
          // Hide item
          item.classList.add(this.afs.options.get("hiddenClass"));
          item.style.display = "none"; // Ensure item is hidden immediately
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
      // Ensure visible items remain visible and hidden items stay hidden
      this.afs.items.forEach(item => {
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
        visibleItems: visibleItems.size
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
    return filterMode === "AND" ? this.itemMatchesAllFilters(itemCategories) : this.itemMatchesAnyFilter(itemCategories);
  }

  /**
   * Check if item matches any active filter (OR mode)
   * @private
   * @param {Set} itemCategories - Item's categories
   * @returns {boolean} Whether item matches any filter
   */
  itemMatchesAnyFilter(itemCategories) {
    return Array.from(this.activeFilters).some(filter => {
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
    return Array.from(this.activeFilters).every(filter => {
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
    const groupMatches = Array.from(this.filterGroups.values()).map(group => {
      if (group.filters.size === 0) return true;
      return group.operator === "OR" ? Array.from(group.filters).some(filter => itemCategories.has(filter)) : Array.from(group.filters).every(filter => itemCategories.has(filter));
    });
    return this.afs.options.get("groupMode") === "OR" ? groupMatches.some(matches => matches) : groupMatches.every(matches => matches);
  }

  /**
   * Emit filter-related events
   * @private
   * @param {Set} previouslyVisible - Previously visible items
   * @param {Set} nowVisible - Currently visible items
   */
  emitFilterEvents(previouslyVisible, nowVisible) {
    // Determine added and removed items
    const added = new Set([...nowVisible].filter(item => !previouslyVisible.has(item)));
    const removed = new Set([...previouslyVisible].filter(item => !nowVisible.has(item)));

    // Emit filter event
    this.afs.emit("filter", {
      activeFilters: Array.from(this.activeFilters),
      visibleItems: nowVisible.size,
      added: added.size,
      removed: removed.size
    });

    // Emit specific events for added/removed items
    if (added.size > 0) {
      this.afs.emit("itemsShown", {
        items: added
      });
    }
    if (removed.size > 0) {
      this.afs.emit("itemsHidden", {
        items: removed
      });
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
      operator: validOperator
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
    this.activeFilters.forEach(existingFilter => {
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
    this.afs.emit("filterRemoved", {
      filter,
      activeFilters: Array.from(this.activeFilters)
    });

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
      activeFilters: Array.from(this.activeFilters)
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
      this.afs.emit("sort", {
        key,
        order: newOrder
      });
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
        itemCount: items.length
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
    items.forEach(item => fragment.appendChild(item));
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
    const checkboxes = document.querySelectorAll(`${this.afs.options.get("filterButtonSelector")}[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
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

/**
 * @fileoverview Utility functions for AFS
 */

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} [immediate=false] - Execute immediately
 * @returns {Function} Debounced function
 */
const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * @fileoverview Input range filter implementation for AFS
 */

class InputRangeFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeRanges = new Map();
  }

  /**
   * @typedef {Object} InputRangeOptions
   * @property {string} key - Data attribute key
   * @property {HTMLElement} container - Container element
   * @property {number} [min] - Minimum value
   * @property {number} [max] - Maximum value
   * @property {number} [step] - Step value
   * @property {string} [label] - Label for the input range
   */

  /**
   * Add input range filter
   * @param {InputRangeOptions} options - Input range options
   */
  addInputRange({
    key,
    container,
    min,
    max,
    step = 1,
    label = ''
  }) {
    this.afs.logger.debug(`Adding input range for ${key}`);
    if (!container) {
      this.afs.logger.error('Container element required for input range');
      return;
    }

    // Calculate min/max if not provided
    const values = this.calculateMinMax(key);
    min = min ?? values.min;
    max = max ?? values.max;

    // Create input elements
    const elements = this.createInputElements(label);
    const state = this.initializeState(min, max, step);

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeRanges.set(key, {
      state,
      elements
    });

    // Initial update
    this.updateInputUI(key);
    this.afs.logger.info(`Input range added for ${key}`);
  }

  /**
   * Calculate min and max values from items
   * @private
   */
  calculateMinMax(key) {
    try {
      const values = Array.from(this.afs.items).map(item => {
        if (!item || !item.dataset || !item.dataset[key]) {
          return null;
        }
        const value = parseFloat(item.dataset[key]);
        return isNaN(value) ? null : value;
      }).filter(value => value !== null);
      if (values.length === 0) {
        return {
          min: 0,
          max: 100
        };
      }
      return {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    } catch (error) {
      this.afs.logger.error('Error calculating range:', error);
      return {
        min: 0,
        max: 100
      };
    }
  }

  /**
   * Create input elements
   * @private
   */
  /**
  * Create input elements
  * @private
  */
  createInputElements(label) {
    const container = document.createElement('div');
    container.className = 'afs-input-range-container';
    if (label) {
      const labelElement = document.createElement('div');
      labelElement.className = 'afs-input-range-label';
      labelElement.textContent = label;
      container.appendChild(labelElement);
    }

    // Min input wrapper
    const minWrapper = document.createElement('div');
    minWrapper.className = 'afs-input-wrapper';
    const minLabel = document.createElement('label');
    minLabel.textContent = 'Min';
    minLabel.className = 'afs-input-label';
    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'afs-input min';
    minWrapper.appendChild(minLabel);
    minWrapper.appendChild(minInput);

    // Max input wrapper
    const maxWrapper = document.createElement('div');
    maxWrapper.className = 'afs-input-wrapper';
    const maxLabel = document.createElement('label');
    maxLabel.textContent = 'Max';
    maxLabel.className = 'afs-input-label';
    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'afs-input max';
    maxWrapper.appendChild(maxLabel);
    maxWrapper.appendChild(maxInput);
    container.appendChild(minWrapper);
    container.appendChild(maxWrapper);
    return {
      container,
      minInput,
      maxInput
    };
  }

  /**
   * Initialize input range state
   * @private
   */
  initializeState(min, max, step) {
    return {
      min,
      max,
      step,
      currentMin: min,
      currentMax: max
    };
  }

  /**
   * Append elements to container
   * @private
   */
  appendElements(container, elements) {
    container.appendChild(elements.container);
  }

  /**
   * Setup event handlers
   * @private
   */
  setupEventHandlers(elements, state, key) {
    const {
      minInput,
      maxInput
    } = elements;
    const handleInputChange = debounce(() => {
      const minValue = parseFloat(minInput.value);
      const maxValue = parseFloat(maxInput.value);
      if (!isNaN(minValue) && !isNaN(maxValue)) {
        state.currentMin = Math.max(state.min, Math.min(maxValue, minValue));
        state.currentMax = Math.min(state.max, Math.max(minValue, maxValue));
        this.updateInputUI(key);
        this.applyFilter(key);
      }
    }, 300);
    minInput.addEventListener('input', handleInputChange);
    maxInput.addEventListener('input', handleInputChange);
  }

  /**
   * Update input UI
   * @private
   */
  updateInputUI(key) {
    try {
      const {
        state,
        elements
      } = this.activeRanges.get(key);
      const {
        minInput,
        maxInput
      } = elements;

      // Set constraints
      minInput.min = state.min;
      minInput.max = state.max;
      minInput.step = state.step;
      maxInput.min = state.min;
      maxInput.max = state.max;
      maxInput.step = state.step;

      // Set current values
      minInput.value = state.currentMin;
      maxInput.value = state.currentMax;
    } catch (error) {
      this.afs.logger.error('Error updating input UI:', error);
    }
  }

  /**
   * Apply filter
   * @private
   */
  applyFilter(key) {
    this.afs.logger.info(`Applying input filter for ${key}`);
    const {
      state
    } = this.activeRanges.get(key);
    this.afs.items.forEach(item => {
      try {
        if (!item || !item.dataset || !item.dataset[key]) {
          this.afs.hideItem(item);
          return;
        }
        const itemValue = parseFloat(item.dataset[key]);
        if (isNaN(itemValue)) {
          this.afs.hideItem(item);
          return;
        }
        if (itemValue >= state.currentMin && itemValue <= state.currentMax) {
          this.afs.showItem(item);
        } else {
          this.afs.hideItem(item);
        }
      } catch (error) {
        this.afs.logger.error('Error filtering item:', error);
        this.afs.hideItem(item);
      }
    });
    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit('inputRangeFilter', {
      key,
      min: state.currentMin,
      max: state.currentMax
    });
  }

  /**
   * Get current range values
   * @param {string} key - Range key
   * @returns {Object} Current range values
   */
  getRange(key) {
    const range = this.activeRanges.get(key);
    if (!range) return null;
    return {
      min: range.state.currentMin,
      max: range.state.currentMax
    };
  }

  /**
   * Set range values
   * @param {string} key - Range key
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  setRange(key, min, max) {
    const range = this.activeRanges.get(key);
    if (!range) return;
    range.state.currentMin = min;
    range.state.currentMax = max;
    this.updateInputUI(key);
    this.applyFilter(key);
  }

  /**
   * Remove input range
   * @param {string} key - Range key
   */
  removeInputRange(key) {
    const range = this.activeRanges.get(key);
    if (!range) return;
    range.elements.container.remove();
    this.activeRanges.delete(key);
    this.afs.logger.info(`Input range removed for ${key}`);
  }
}

/**
 * @fileoverview Search functionality for AFS
 */

class Search {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.searchInput = null;
    this.searchKeys = ['title']; // Default search keys
    this.minSearchLength = 2;
    this.highlightClass = 'afs-highlight';
    this.setupSearch();
  }

  /**
   * Setup search functionality
   * @private
   */
  setupSearch() {
    const searchSelector = this.afs.options.get('searchInputSelector');
    if (!searchSelector) return;
    this.searchInput = document.querySelector(searchSelector);
    if (!this.searchInput) {
      this.afs.logger.warn(`Search input not found: ${searchSelector}`);
      return;
    }

    // Configure search
    this.searchKeys = this.afs.options.get('searchKeys') || this.searchKeys;
    this.minSearchLength = this.afs.options.get('minSearchLength') || this.minSearchLength;

    // Bind events
    this.bindSearchEvents();
    this.afs.logger.debug('Search functionality initialized');
  }

  /**
   * Bind search events
   * @private
   */
  bindSearchEvents() {
    if (!this.searchInput) return;

    // Create debounced search function
    const debouncedSearch = debounce(e => {
      this.search(e.target.value);
    }, this.afs.options.get('debounceTime') || 300);

    // Bind input event
    this.searchInput.addEventListener('input', debouncedSearch);

    // Bind clear event
    this.searchInput.addEventListener('search', e => {
      if (!e.target.value) {
        this.clearSearch();
      }
    });

    // Handle Enter key
    this.searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.search(e.target.value);
      }
    });
  }

  /**
   * Perform search
   * @public
   * @param {string} query - Search query
   */
  search(query) {
    this.afs.logger.debug('Performing search:', query);
    const normalizedQuery = this.normalizeQuery(query);

    // Update state
    this.afs.state.setState('search.query', normalizedQuery);
    let matches = 0;

    // Special case for empty query
    if (!normalizedQuery) {
      this.clearSearch();
      return;
    }

    // Skip if query is too short
    if (normalizedQuery.length < this.minSearchLength) {
      this.afs.logger.debug('Search query too short');
      return;
    }
    try {
      // Create search regex
      const regex = this.createSearchRegex(normalizedQuery);

      // Track animation promises
      const animationPromises = [];

      // Search through items
      this.afs.items.forEach(item => {
        const searchText = this.getItemSearchText(item);
        const matchesSearch = regex.test(searchText);
        const promise = new Promise(resolve => {
          if (matchesSearch) {
            this.afs.showItem(item);
            this.highlightMatches(item, regex);
            matches++;
          } else {
            this.afs.hideItem(item);
            this.removeHighlights(item);
          }
          // Resolve after animation duration
          setTimeout(resolve, this.afs.options.get('animation.duration') || 300);
        });
        animationPromises.push(promise);
      });

      // Wait for all animations to complete
      Promise.all(animationPromises).then(() => {
        // Ensure hidden items are properly hidden with display: none
        this.afs.items.forEach(item => {
          const visibleItems = this.afs.state.getState().items.visible;
          if (!visibleItems.has(item)) {
            item.style.display = 'none';
          } else {
            item.style.display = '';
            item.style.opacity = '1';
          }
        });

        // Update URL and emit event
        this.afs.urlManager.updateURL();
        this.afs.emit('search', {
          query: normalizedQuery,
          matches,
          total: this.afs.items.length
        });

        // Update counter
        this.afs.updateCounter();
        this.afs.logger.info(`Search complete. Found ${matches} matches`);
      });
    } catch (error) {
      this.afs.logger.error('Search error:', error);
    }
  }

  /**
   * Normalize search query
   * @private
   * @param {string} query - Raw search query
   * @returns {string} Normalized query
   */
  normalizeQuery(query) {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Create search regex
   * @private
   * @param {string} query - Normalized search query
   * @returns {RegExp} Search regex
   */
  createSearchRegex(query) {
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Split into words
    const words = escapedQuery.split(' ').filter(Boolean);

    // Create regex pattern that matches parts of words
    // Using lookaheads to ensure all words are present somewhere in the string
    const pattern = words.map(word => `(?=.*${word})`).join('');
    return new RegExp(pattern, 'i');
  }

  /**
   * Get searchable text from item
   * @private
   * @param {HTMLElement} item - DOM element
   * @returns {string} Searchable text
   */
  getItemSearchText(item) {
    return this.searchKeys.map(key => item.dataset[key] || '').join(' ').toLowerCase();
  }

  /**
   * Highlight search matches
   * @private
   * @param {HTMLElement} item - DOM element
   * @param {RegExp} regex - Search regex
   */
  highlightMatches(item, regex) {
    if (!this.afs.options.get('highlightMatches')) return;
    this.searchKeys.forEach(key => {
      const target = item.querySelector(`[data-search-key="${key}"]`);
      if (!target) return;
      const text = target.textContent;
      const words = this.afs.state.getState().search.query.split(' ');
      let highlightedText = text;
      words.forEach(word => {
        if (!word) return;
        // Match parts of words using more flexible pattern (no word boundary)
        const wordRegex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedText = highlightedText.replace(wordRegex, `<span class="${this.highlightClass}">$1</span>`);
      });
      target.innerHTML = highlightedText;
    });
  }

  /**
   * Remove highlights
   * @private
   * @param {HTMLElement} item - DOM element
   */
  removeHighlights(item) {
    if (!this.afs.options.get('highlightMatches')) return;
    this.searchKeys.forEach(key => {
      const target = item.querySelector(`[data-search-key="${key}"]`);
      if (!target) return;
      const highlights = target.querySelectorAll(`.${this.highlightClass}`);
      highlights.forEach(highlight => {
        const text = highlight.textContent;
        highlight.replaceWith(text);
      });
    });
  }

  /**
   * Clear search
   * @public
   */
  clearSearch() {
    this.afs.logger.debug('Clearing search');

    // Clear input
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    // Clear state
    this.afs.state.setState('search.query', '');

    // Track animation promises
    const animationPromises = [];

    // Show all items with animation
    this.afs.items.forEach(item => {
      const promise = new Promise(resolve => {
        this.afs.showItem(item);
        this.removeHighlights(item);
        // Resolve after animation duration
        setTimeout(resolve, this.afs.options.get('animation.duration') || 300);
      });
      animationPromises.push(promise);
    });

    // Wait for all animations to complete
    Promise.all(animationPromises).then(() => {
      // Ensure all items are visible
      this.afs.items.forEach(item => {
        item.style.display = '';
        item.style.opacity = '1';
      });

      // Update URL and emit event
      this.afs.urlManager.updateURL();
      this.afs.emit('searchCleared');

      // Update counter
      this.afs.updateCounter();
    });
  }

  /**
   * Set search value
   * @public
   * @param {string} value - Search value
   */
  setValue(value) {
    if (this.searchInput) {
      this.searchInput.value = value;
    }
    this.search(value);
  }

  /**
   * Get current search value
   * @public
   * @returns {string} Current search value
   */
  getValue() {
    return this.afs.state.getState().search.query;
  }

  /**
   * Update search configuration
   * @public
   * @param {Object} config - Search configuration
   */
  updateConfig({
    searchKeys,
    minSearchLength,
    highlightClass,
    debounceTime
  } = {}) {
    if (searchKeys) this.searchKeys = searchKeys;
    if (minSearchLength) this.minSearchLength = minSearchLength;
    if (highlightClass) this.highlightClass = highlightClass;
    if (debounceTime) {
      this.bindSearchEvents(); // Rebind with new debounce time
    }
  }

  /**
   * Destroy search functionality
   * @public
   */
  destroy() {
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.debouncedSearch);
      this.searchInput.removeEventListener('search', this.handleClear);
      this.searchInput.removeEventListener('keypress', this.handleEnter);
    }
    this.clearSearch();
  }
}

/**
 * @fileoverview Sort functionality for AFS
 */

class Sort {
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
    buttons.forEach(button => {
      const key = button.dataset.sortKey;
      if (!key) {
        this.afs.logger.warn("Sort button missing data-sort-key attribute:", button);
        return;
      }
      this.sortButtons.set(button, {
        key,
        direction: button.dataset.sortDirection || "asc"
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
      this.afs.state.setState("sort.current", {
        key,
        direction
      });

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
      this.afs.emit("sort", {
        key,
        direction,
        sortType,
        itemCount: items.length
      });
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
        for (const {
          key,
          direction = "asc"
        } of criteria) {
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
      this.afs.emit("shuffle", {
        itemCount: items.length
      });
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
      this.afs.emit("sortReset", {
        buttonCount
      });
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
    this.sortButtons.set(button, {
      key,
      direction
    });
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

/**
 * @fileoverview Pagination functionality for AFS
 */
class Pagination {
  /**
   * @param {import('../AFS').AFS} afs - Main AFS instance
   */
  constructor(afs) {
    this.afs = afs;
    this.container = null;
    this.animation = new Animation(afs);
    this.options = this.afs.options.get("pagination");
    this.setupPagination();
  }

  /**
   * Setup pagination
   * @private
   */
  setupPagination() {
    this.afs.logger.debug("Setting up pagination");
    if (!this.afs.options.get("pagination.enabled")) {
      // Make sure we initialize the state even if pagination is disabled
      this.afs.state.setState("pagination", {
        currentPage: 1,
        itemsPerPage: this.options.itemsPerPage || 10,
        totalPages: 1
      });
      return;
    }
    this.container = document.createElement("div");
    this.container.className = this.options.containerClass;
    const itemsContainer = document.querySelector(this.afs.options.get("pagination.container"));
    if (!itemsContainer) {
      this.afs.logger.error("Items container not found.");
      return;
    }
    itemsContainer.appendChild(this.container);

    // Initialize pagination state with defaults
    this.afs.state.setState("pagination", {
      currentPage: 1,
      itemsPerPage: this.options.itemsPerPage,
      totalPages: 0
    });
    this.bindEvents();
    this.update();
    this.afs.logger.debug("Pagination initialized");
  }

  /**
   * Bind pagination events
   * @private
   */
  bindEvents() {
    // Only bind events if pagination is enabled
    if (!this.afs.options.get("pagination.enabled") || !this.container) return;
    this.afs.on("filter", () => this.update());
    this.afs.on("search", () => this.update());
    this.afs.on("sort", () => this.update());
    this.container.addEventListener("click", e => {
      const button = e.target.closest("button");
      if (!button) return;
      const page = button.dataset.page;
      if (page) {
        this.goToPage(parseInt(page, 10));
      }
    });
  }

  /**
   * Update pagination
   * @public
   */
  update() {
    // If pagination is not enabled, make all items visible and return
    if (!this.afs.options.get("pagination.enabled")) {
      this.showAllItems();
      return;
    }
    const visibleItems = Array.from(this.afs.state.getState().items.visible);
    const itemsPerPage = this.afs.state.getState().pagination.itemsPerPage;
    const totalPages = Math.max(1, Math.ceil(visibleItems.length / itemsPerPage));

    // Update state
    const currentState = this.afs.state.getState().pagination;
    let currentPage = currentState.currentPage;

    // Adjust current page if it's beyond the total pages
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    // Update pagination state
    this.afs.state.setState("pagination", {
      ...currentState,
      currentPage,
      totalPages
    });

    // Update visibility before rendering pagination controls
    this.updateVisibility(visibleItems);

    // Only render pagination if container exists
    if (this.container) {
      this.renderPagination();
    }
    this.afs.urlManager.updateURL();
    this.afs.emit("pagination", {
      currentPage,
      totalPages,
      itemsPerPage,
      visibleItems: visibleItems.length
    });
  }

  /**
   * Update items visibility based on current page
   * @private
   */
  updateVisibility(visibleItems) {
    // If pagination is not enabled, show all items
    if (!this.afs.options.get("pagination.enabled")) {
      this.showAllItems();
      return;
    }
    const {
      currentPage,
      itemsPerPage
    } = this.afs.state.getState().pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // First hide all items
    this.afs.items.forEach(item => {
      item.style.display = "none";
      item.classList.add(this.afs.options.get("hiddenClass"));
    });

    // Then show only the items for the current page
    const itemsToShow = visibleItems.slice(startIndex, endIndex);

    // Ensure we're not trying to display non-existent items
    if (itemsToShow.length === 0 && visibleItems.length > 0) {
      // If we have no items to show but we do have visible items,
      // we're probably on an invalid page - go to page 1
      this.goToPage(1);
      return;
    }

    // Show items with animation
    requestAnimationFrame(() => {
      itemsToShow.forEach(item => {
        // Remove hidden class and restore display
        item.style.display = "";
        item.classList.remove(this.afs.options.get("hiddenClass"));

        // Apply show animation in the next frame
        requestAnimationFrame(() => {
          this.animation.applyShowAnimation(item, this.options.animationType || "fade");
        });
      });
    });
  }

  /**
   * Render pagination controls
   * @private
   */
  renderPagination() {
    // Safety check: don't render if container doesn't exist or pagination is disabled
    if (!this.container || !this.afs.options.get("pagination.enabled")) {
      return;
    }
    const {
      currentPage,
      totalPages
    } = this.afs.state.getState().pagination;
    this.container.innerHTML = "";
    if (totalPages <= 1) {
      this.container.style.display = "none";
      return;
    }
    this.container.style.display = "flex";
    const controls = this.createPaginationControls(currentPage, totalPages);
    this.container.appendChild(controls);
  }

  /**
   * Create pagination controls
   * @private
   * @param {number} currentPage - Current page
   * @param {number} totalPages - Total pages
   * @returns {DocumentFragment} Pagination controls
   */
  createPaginationControls(currentPage, totalPages) {
    const fragment = document.createDocumentFragment();
    if (this.options.showPrevNext) {
      const prevButton = this.createPageButton("‹", currentPage - 1, {
        disabled: currentPage === 1,
        class: "afs-pagination-prev"
      });
      fragment.appendChild(prevButton);
    }
    fragment.appendChild(this.createPageButton("1", 1, {
      active: currentPage === 1
    }));
    const range = this.calculatePageRange(currentPage, totalPages);
    if (range.start > 2) fragment.appendChild(this.createEllipsis());
    for (let i = range.start; i <= range.end; i++) {
      if (i === 1 || i === totalPages) continue;
      fragment.appendChild(this.createPageButton(i.toString(), i, {
        active: currentPage === i
      }));
    }
    if (range.end < totalPages - 1) fragment.appendChild(this.createEllipsis());
    if (totalPages > 1) fragment.appendChild(this.createPageButton(totalPages.toString(), totalPages, {
      active: currentPage === totalPages
    }));
    if (this.options.showPrevNext) {
      const nextButton = this.createPageButton("›", currentPage + 1, {
        disabled: currentPage === totalPages,
        class: "afs-pagination-next"
      });
      fragment.appendChild(nextButton);
    }
    return fragment;
  }

  /**
   * Create page button
   * @private
   */
  createPageButton(text, page, {
    active = false,
    disabled = false,
    class: className = ""
  } = {}) {
    const button = document.createElement("button");
    button.textContent = text;
    button.dataset.page = page;
    button.classList.add(this.options.pageButtonClass || "afs-page-button");
    if (className) button.classList.add(className);
    if (active) button.classList.add(this.options.activePageClass || "afs-page-active");
    if (disabled) button.disabled = true;
    return button;
  }
  createEllipsis() {
    const span = document.createElement("span");
    span.textContent = "...";
    span.classList.add("afs-pagination-ellipsis");
    return span;
  }
  calculatePageRange(currentPage, totalPages) {
    const maxButtons = this.options.maxButtons || 7;
    const sideButtons = Math.floor((maxButtons - 3) / 2);
    let start = Math.max(2, currentPage - sideButtons);
    let end = Math.min(totalPages - 1, start + maxButtons - 3);
    if (end - start < maxButtons - 3) start = Math.max(2, end - (maxButtons - 3));
    return {
      start,
      end
    };
  }

  /**
   * Go to specific page
   * @public
   */
  goToPage(page) {
    const state = this.afs.state.getState().pagination;
    const targetPage = Math.max(1, Math.min(page, state.totalPages));
    if (targetPage === state.currentPage) return;

    // Update state
    this.afs.state.setState("pagination.currentPage", targetPage);

    // Update visibility and controls
    this.update();

    // Scroll to top if enabled
    if (this.options.scrollToTop && window.innerWidth > 768) {
      //fixed this part where condition to disable scrollTop on mobile is that the innerWidth > 768
      setTimeout(() => this.scrollToTop(), 100);
    }

    // Emit page change event
    this.afs.emit("pageChanged", {
      previousPage: state.currentPage,
      currentPage: targetPage,
      totalPages: state.totalPages
    });
  }
  scrollToTop() {
    const container = document.querySelector(this.afs.options.get("pagination.container"));
    if (!container) {
      this.afs.logger.warn("Scroll container not found.");
      return;
    }
    window.scrollTo({
      top: container.offsetTop - this.options.scrollOffset,
      behavior: "smooth"
    });
  }

  /**
   * Set pagination mode
   * @public
   */
  setPaginationMode(enabled) {
    this.afs.logger.debug(`Setting pagination mode to: ${enabled}`);

    // Update options
    this.afs.options.set("pagination.enabled", enabled);
    if (enabled) {
      // Enable pagination
      this.setupPagination();
    } else {
      // Disable pagination and show all items
      this.container.remove();
      this.showAllItems();
    }

    // Emit event
    this.afs.emit("paginationModeChanged", {
      enabled
    });
  }

  /**
   * Show all items (for infinite scroll mode or when pagination is disabled)
   * @private
   */
  showAllItems() {
    try {
      const visibleItems = Array.from(this.afs.state.getState().items.visible);

      // Check if we're on a mobile device
      const isMobile = window.innerWidth <= 768;
      requestAnimationFrame(() => {
        visibleItems.forEach(item => {
          item.style.display = "";
          item.classList.remove(this.afs.options.get("hiddenClass"));

          // For mobile, skip animation to improve performance and prevent blur issues
          if (isMobile) {
            item.style.opacity = "1";
            item.style.transform = "";
            item.style.filter = "none";
          } else {
            requestAnimationFrame(() => {
              this.animation.applyShowAnimation(item, this.options?.animationType || "fade");
            });
          }
        });

        // Extra cleanup for mobile devices to ensure no blur filters remain
        if (isMobile) {
          setTimeout(() => {
            visibleItems.forEach(item => {
              item.style.opacity = "1";
              item.style.transform = "";
              item.style.filter = "none";
            });
          }, 50);
        }
      });
    } catch (error) {
      this.afs.logger.error("Error in showAllItems:", error);
      // Fallback: make sure items are visible even if there's an error
      this.afs.items.forEach(item => {
        if (this.afs.state.getState().items.visible.has(item)) {
          item.style.display = "";
          item.classList.remove(this.afs.options.get("hiddenClass"));
          item.style.opacity = "1";
          item.style.filter = "none";
        }
      });
    }
  }
}

/**
 * @fileoverview URL state management for AFS
 */

class URLManager {
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
    const state = this.afs.state.getState(); // Get current state of filters

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
    this.pushState(params); // Push the new URL state to the browser
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
    if (filters.current.size === 0 || filters.current.size === 1 && filters.current.has('*')) {
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
      const {
        currentMin,
        currentMax
      } = range;
      if (currentMin !== range.min || currentMax !== range.max) {
        params.set(`range_${key}`, `${currentMin},${currentMax}`);
      }
    });

    // Handle date ranges
    state.filters.dateRanges.forEach((range, key) => {
      const {
        start,
        end
      } = range;
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
      const {
        key,
        direction
      } = state.sort.current;
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
    const {
      currentPage,
      itemsPerPage
    } = state.pagination;
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
      const filterParams = Array.from(params.entries()).filter(([key]) => this.isRegularFilter(key));
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
      this.afs.emit('urlStateLoaded', {
        params: Object.fromEntries(params)
      });
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
        state.filters.ranges.set(rangeKey, {
          currentMin: min,
          currentMax: max
        });
      }
    }

    // Process date ranges
    for (const [key, value] of params.entries()) {
      if (key.startsWith('dateRange_')) {
        const rangeKey = key.replace('dateRange_', '');
        const [start, end] = value.split(',').map(str => new Date(str));
        state.filters.dateRanges.set(rangeKey, {
          start,
          end
        });
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
      this.afs.state.setState('sort.current', {
        key,
        direction
      });
    }
  }

  /**
   * Process pagination from URL parameters
   * @private
   * @param {URLSearchParams} params
   */
  processPaginationFromURL(params) {
    const page = parseInt(params.get('page')) || 1;
    const perPage = parseInt(params.get('perPage')) || this.afs.options.get('pagination.itemsPerPage');
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
    const excludedParams = ['search', 'sort', 'page', 'perPage', 'filterMode', 'groupMode'];
    return !excludedParams.includes(param) && !param.startsWith('group_') && !param.startsWith('groupOp_') && !param.startsWith('range_') && !param.startsWith('dateRange_');
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

/**
 * @fileoverview Range filter implementation for AFS
 */

class RangeFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeRanges = new Map();
    this.options = this.afs.options.get("slider");
    if (!this.afs.styleManager) {
      this.afs.styleManager = new StyleManager(this.afs.options);
    }

    // Apply styles immediately
    this.afs.styleManager.applyStyles();
  }

  /**
   * @typedef {Object} RangeOptions
   * @property {string} key - Data attribute key
   * @property {string} type - Type of range ('number' or 'date')
   * @property {HTMLElement} container - Container element
   * @property {number|string} [min] - Minimum value
   * @property {number|string} [max] - Maximum value
   * @property {number} [step] - Step value
   */

  /**
   * Add range slider
   * @param {RangeOptions} options - Range slider options
   */
  addRangeSlider({
    key,
    type,
    container,
    min,
    max,
    step = 1,
    ui
  }) {
    this.afs.logger.debug(`Adding range slider for ${key}`);
    if (!container) {
      this.afs.logger.error("Container element required for range slider");
      return;
    }

    // Calculate min/max if not provided
    const values = this.calculateMinMax(key, type);
    min = min ?? values.min;
    max = max ?? values.max;

    // Get global UI options and merge with slider-specific options
    const globalUiOptions = this.afs.options.get("styles.slider.ui") || {
      showHistogram: false,
      bins: 10
    };
    const sliderUiOptions = {
      ...globalUiOptions,
      ...ui // Override with slider-specific options if provided
    };

    // Only calculate histogram data if enabled
    const histogramData = sliderUiOptions.showHistogram ? this.calculateHistogramData(key, sliderUiOptions.bins) : {
      counts: [],
      binEdges: [],
      max: 0
    };

    // Create slider elements
    const elements = this.createSliderElements(histogramData, sliderUiOptions);
    const state = this.initializeState(min, max, step, type);

    // Store histogram data and UI options in state
    state.ui = sliderUiOptions;
    if (sliderUiOptions.showHistogram) {
      state.histogram = histogramData;
    }

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeRanges.set(key, {
      state,
      elements
    });

    // Initial update
    this.updateSliderUI(key);

    // Setup histogram highlight updates only if enabled
    if (sliderUiOptions.showHistogram) {
      this.setupHistogramHighlight(elements, state, histogramData.binEdges);
    }
    this.afs.logger.info(`Range slider added for ${key}`);
  }
  /**
   * Calculate min and max values from items
   * @private
   */
  calculateMinMax(key, type) {
    const values = Array.from(this.afs.items).map(item => {
      const value = item.dataset[key];
      return type === "date" ? new Date(value).getTime() : parseFloat(value);
    }).filter(value => !isNaN(value));
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * Create slider DOM elements
   * @private
   * @param {Object} histogramData - Histogram data
   * @param {Object} sliderUiOptions - UI options for this slider
   */
  createSliderElements(histogramData, sliderUiOptions) {
    const styles = this.afs.options.get("styles") || this.afs.styleManager.defaultStyles;
    const colors = styles.colors || this.afs.styleManager.defaultStyles.colors;
    const sliderOptions = this.afs.options.get("slider") || {};
    const container = document.createElement("div");
    container.className = "afs-range-container";
    const slider = document.createElement("div");
    slider.className = sliderOptions.containerClass;
    const track = document.createElement("div");
    track.className = sliderOptions.trackClass;

    // Only add histogram if enabled in the slider-specific options
    if (sliderUiOptions?.showHistogram && histogramData?.counts?.length > 0) {
      const histogram = this.createHistogramBars(histogramData, colors);
      slider.appendChild(histogram);
    }
    const selectedRange = document.createElement("div");
    selectedRange.className = sliderOptions.selectedClass;
    const minThumb = document.createElement("div");
    minThumb.className = sliderOptions.thumbClass;
    const maxThumb = document.createElement("div");
    maxThumb.className = sliderOptions.thumbClass;
    const minValue = document.createElement("div");
    minValue.className = sliderOptions.valueClass;
    const maxValue = document.createElement("div");
    maxValue.className = sliderOptions.valueClass;

    // Build the slider
    slider.appendChild(track);
    slider.appendChild(selectedRange);
    slider.appendChild(minThumb);
    slider.appendChild(maxThumb);
    slider.appendChild(minValue);
    slider.appendChild(maxValue);
    container.appendChild(slider);
    return {
      container,
      slider,
      track,
      selectedRange,
      minThumb,
      maxThumb,
      minValue,
      maxValue
    };
  }

  // Add helper method for creating histogram
  createHistogram(data, colors) {
    const histogram = document.createElement("div");
    histogram.className = "afs-histogram";

    // Create histogram bars
    data.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "afs-histogram-bar";
      bar.style.height = `${value}%`;
      bar.style.backgroundColor = colors.histogram;
      histogram.appendChild(bar);
    });
    return histogram;
  }

  /**
   * Calculate histogram data from items
   * @private
   * @param {string} key - Data attribute key (e.g., 'price')
   * @param {number} [bins=10] - Number of bins for histogram
   * @returns {Object} Histogram data and metadata
   */
  calculateHistogramData(key, bins = 10) {
    try {
      const values = Array.from(this.afs.items).map(item => parseFloat(item.dataset[key])).filter(value => !isNaN(value));
      if (values.length === 0) {
        return {
          counts: [],
          binEdges: [],
          max: 0
        };
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / bins;
      const counts = new Array(bins).fill(0);
      const binEdges = new Array(bins + 1);

      // Calculate bin edges
      for (let i = 0; i <= bins; i++) {
        binEdges[i] = min + i * binWidth;
      }

      // Count values in each bin
      values.forEach(value => {
        if (value === max) {
          counts[counts.length - 1]++;
          return;
        }
        const binIndex = Math.floor((value - min) / binWidth);
        counts[binIndex]++;
      });

      // Normalize heights to be more subtle
      const maxCount = Math.max(...counts);
      const normalizedCounts = counts.map(count => Math.max(20, Math.round(count / maxCount * 100)) // Minimum height of 20%
      );
      return {
        counts: normalizedCounts,
        binEdges,
        max: maxCount,
        min,
        max
      };
    } catch (error) {
      this.afs.logger.error("Error calculating histogram:", error);
      return {
        counts: [],
        binEdges: [],
        max: 0
      };
    }
  }

  /**
   * Setup histogram highlight on range changes
   * @private
   */
  setupHistogramHighlight(elements, state, binEdges) {
    const bars = elements.slider.querySelectorAll(".afs-histogram-bar");
    const updateHistogram = () => {
      const minVal = state.currentMin;
      const maxVal = state.currentMax;
      bars.forEach((bar, index) => {
        const binStart = binEdges[index];
        const binEnd = binEdges[index + 1];

        // Highlight bars within the selected range
        if (binStart >= minVal && binEnd <= maxVal) {
          bar.classList.add("active");
        } else {
          bar.classList.remove("active");
        }
      });
    };

    // Update histogram on range changes using AFS instance
    this.afs.on("rangeFilter", () => updateHistogram());

    // Initial update
    updateHistogram();
  }

  /**
   * Create histogram bars
   * @private
   */
  createHistogramBars(histogramData, colors) {
    const {
      counts
    } = histogramData;
    const histogram = document.createElement("div");
    histogram.className = "afs-histogram";
    counts.forEach(height => {
      const bar = document.createElement("div");
      bar.className = "afs-histogram-bar";
      bar.style.height = `${height}%`;
      histogram.appendChild(bar);
    });
    return histogram;
  }

  /**
   * Initialize slider state
   * @private
   */
  initializeState(min, max, step, type) {
    return {
      min,
      max,
      currentMin: min,
      currentMax: max,
      step,
      type,
      isDragging: false
    };
  }

  /**
   * Append elements to container
   * @private
   */
  appendElements(container, elements) {
    const {
      slider,
      track,
      selectedRange,
      minThumb,
      maxThumb,
      minValue,
      maxValue
    } = elements;
    slider.appendChild(track);
    slider.appendChild(selectedRange);
    slider.appendChild(minThumb);
    slider.appendChild(maxThumb);
    slider.appendChild(minValue);
    slider.appendChild(maxValue);
    container.appendChild(slider);
  }

  /**
   * Setup event handlers for slider
   * @private
   */
  setupEventHandlers(elements, state, key) {
    const {
      minThumb,
      maxThumb
    } = elements;
    const handleStart = isMin => e => {
      e.preventDefault(); // Prevent scrolling while dragging on mobile
      state.isDragging = true;

      // Get the correct event coordinates whether mouse or touch
      const getEventXY = event => {
        return event.touches ? event.touches[0] : event;
      };
      const moveHandler = moveEvent => {
        const evt = getEventXY(moveEvent);
        this.createMoveHandler(elements, state, key, isMin)(evt);
      };
      const stopHandler = () => {
        state.isDragging = false;

        // Remove both mouse and touch event listeners
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', stopHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', stopHandler);
        window.removeEventListener('touchcancel', stopHandler);
        this.applyFilter(key);
      };

      // Add both mouse and touch event listeners
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', stopHandler);
      window.addEventListener('touchmove', moveHandler, {
        passive: false
      });
      window.addEventListener('touchend', stopHandler);
      window.addEventListener('touchcancel', stopHandler);
    };

    // Add both mouse and touch event listeners to thumbs
    minThumb.addEventListener('mousedown', handleStart(true));
    minThumb.addEventListener('touchstart', handleStart(true), {
      passive: false
    });
    maxThumb.addEventListener('mousedown', handleStart(false));
    maxThumb.addEventListener('touchstart', handleStart(false), {
      passive: false
    });
  }

  /**
   * Update slider UI
   * @private
   */
  updateSliderUI(key) {
    const {
      state,
      elements
    } = this.activeRanges.get(key);
    const {
      minThumb,
      maxThumb,
      selectedRange,
      minValue,
      maxValue
    } = elements;

    // Calculate positions with padding consideration
    const range = state.max - state.min;
    const minPos = (state.currentMin - state.min) / range * 100;
    const maxPos = (state.currentMax - state.min) / range * 100;

    // Ensure thumbs stay within bounds
    const clampedMinPos = Math.max(0, Math.min(minPos, 100));
    const clampedMaxPos = Math.max(0, Math.min(maxPos, 100));

    // Position thumbs
    minThumb.style.left = `${clampedMinPos}%`;
    maxThumb.style.left = `${clampedMaxPos}%`;

    // Position selected range
    selectedRange.style.left = `${clampedMinPos}%`;
    selectedRange.style.width = `${clampedMaxPos - clampedMinPos}%`;

    // Format values
    const formatValue = state.type === "date" ? value => new Date(value).toLocaleDateString() : value => value.toFixed(2);

    // Update value labels
    minValue.textContent = formatValue(state.currentMin);
    maxValue.textContent = formatValue(state.currentMax);

    // Position value labels considering bounds
    minValue.style.left = `${clampedMinPos}%`;
    maxValue.style.left = `${clampedMaxPos}%`;

    // Handle edge cases for value label positioning
    if (clampedMinPos < 5) {
      minValue.style.transform = "translateX(0)";
    } else if (clampedMinPos > 95) {
      minValue.style.transform = "translateX(-100%)";
    } else {
      minValue.style.transform = "translateX(-50%)";
    }
    if (clampedMaxPos < 5) {
      maxValue.style.transform = "translateX(0)";
    } else if (clampedMaxPos > 95) {
      maxValue.style.transform = "translateX(-100%)";
    } else {
      maxValue.style.transform = "translateX(-50%)";
    }
  }

  // Also update the createMoveHandler to respect the padding
  createMoveHandler(elements, state, key, isMin) {
    this.afs.logger.debug(`Creating move handler for ${key}`);
    const {
      track
    } = elements;
    const PADDING = 5;
    return debounce(e => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = track.getBoundingClientRect();
      const totalWidth = rect.width;
      const paddingPixels = PADDING / 100 * totalWidth;

      // Calculate percent with padding consideration
      const rawPercent = (clientX - rect.left - paddingPixels) / (totalWidth - 2 * paddingPixels);
      const percent = Math.min(Math.max(0, rawPercent), 1);

      // Calculate value considering the full range
      const value = state.min + (state.max - state.min) * percent;
      const stepped = Math.round(value / state.step) * state.step;
      if (isMin) {
        state.currentMin = Math.min(stepped, state.currentMax);
      } else {
        state.currentMax = Math.max(stepped, state.currentMin);
      }
      this.updateSliderUI(key);
    }, 16); // ~60fps
  }

  /**
   * Apply range filter
   * @private
   */
  applyFilter(key) {
    this.afs.logger.debug(`Applying range filter for ${key}`);
    const {
      state
    } = this.activeRanges.get(key);
    this.afs.items.forEach(item => {
      const value = state.type === "date" ? new Date(item.dataset[key]).getTime() : parseFloat(item.dataset[key]);
      if (value >= state.currentMin && value <= state.currentMax) {
        this.afs.showItem(item);
      } else {
        this.afs.hideItem(item);
      }
    });
    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit("rangeFilter", {
      key,
      min: state.currentMin,
      max: state.currentMax
    });
  }

  /**
   * Get current range values
   * @param {string} key - Range key
   * @returns {Object} Current range values
   */
  getRangeValues(key) {
    const range = this.activeRanges.get(key);
    if (!range) return null;
    return {
      min: range.state.currentMin,
      max: range.state.currentMax,
      type: range.state.type
    };
  }

  /**
   * Set range values
   * @param {string} key - Range key
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  setRangeValues(key, min, max) {
    const range = this.activeRanges.get(key);
    if (!range) return;
    range.state.currentMin = min;
    range.state.currentMax = max;
    this.updateSliderUI(key);
    this.applyFilter(key);
  }

  /**
   * Remove range slider
   * @param {string} key - Range key
   */
  removeRangeSlider(key) {
    const range = this.activeRanges.get(key);
    if (!range) return;
    range.elements.slider.remove();
    this.activeRanges.delete(key);
    this.afs.logger.info(`Range slider removed for ${key}`);
  }
}

/**
 * @fileoverview Date filter implementation for AFS
 */

class DateFilter {
  constructor(afs) {
    this.afs = afs;
    this.activeDateRanges = new Map();
    this.defaultFormat = this.afs.options.get('dateFormat') || 'YYYY-MM-DD';
  }

  /**
   * @typedef {Object} DateRangeOptions
   * @property {string} key - Data attribute key
   * @property {HTMLElement} container - Container element
   * @property {Date} [minDate] - Minimum date
   * @property {Date} [maxDate] - Maximum date
   * @property {string} [format] - Date format (default: YYYY-MM-DD)
   */

  /**
   * Add date range filter
   * @param {DateRangeOptions} options - Date range options
   */
  addDateRange({
    key,
    container,
    minDate,
    maxDate,
    format = this.defaultFormat
  }) {
    this.afs.logger.debug(`Adding date range for ${key}`);
    if (!container) {
      this.afs.logger.error('Container element required for date range');
      return;
    }

    // Calculate min/max dates if not provided
    const dates = this.calculateMinMaxDates(key);
    minDate = minDate ?? dates.min;
    maxDate = maxDate ?? dates.max;

    // Create date picker elements
    const elements = this.createDateElements();
    const state = this.initializeState(minDate, maxDate, format);

    // Add elements to container
    this.appendElements(container, elements);

    // Setup event handlers
    this.setupEventHandlers(elements, state, key);

    // Store state
    this.activeDateRanges.set(key, {
      state,
      elements
    });

    // Initial update
    this.updateDateUI(key);
    this.afs.logger.info(`Date range added for ${key}`);
  }

  /**
   * Calculate min and max dates from items
   * @private
   */
  calculateMinMaxDates(key) {
    try {
      const validDates = Array.from(this.afs.items).map(item => {
        if (!item || !item.dataset || !item.dataset[key]) {
          return null;
        }
        const date = new Date(item.dataset[key]);
        return isNaN(date.getTime()) ? null : date;
      }).filter(date => date !== null);
      if (validDates.length === 0) {
        // Return default date range if no valid dates found
        const today = new Date();
        return {
          min: new Date(today.getFullYear(), 0, 1),
          // January 1st of current year
          max: new Date(today.getFullYear(), 11, 31) // December 31st of current year
        };
      }
      return {
        min: new Date(Math.min(...validDates)),
        max: new Date(Math.max(...validDates))
      };
    } catch (error) {
      this.afs.logger.error('Error calculating date range:', error);
      // Return default date range on error
      const today = new Date();
      return {
        min: new Date(today.getFullYear(), 0, 1),
        max: new Date(today.getFullYear(), 11, 31)
      };
    }
  }

  /**
   * Create date picker elements
   * @private
   */
  createDateElements() {
    this.afs.logger.debug('Creating date picker elements');
    const container = document.createElement('div');
    container.className = 'afs-date-range-container';
    const startContainer = document.createElement('div');
    startContainer.className = 'afs-date-input-wrapper';
    const startLabel = document.createElement('label');
    startLabel.textContent = 'Start Date';
    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'afs-date-input start-date';
    const endContainer = document.createElement('div');
    endContainer.className = 'afs-date-input-wrapper';
    const endLabel = document.createElement('label');
    endLabel.textContent = 'End Date';
    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'afs-date-input end-date';
    startContainer.appendChild(startLabel);
    startContainer.appendChild(startInput);
    endContainer.appendChild(endLabel);
    endContainer.appendChild(endInput);
    container.appendChild(startContainer);
    container.appendChild(endContainer);
    return {
      container,
      startInput,
      endInput
    };
  }

  /**
   * Initialize date filter state
   * @private
   */
  initializeState(minDate, maxDate, format) {
    return {
      minDate,
      maxDate,
      currentStartDate: minDate,
      currentEndDate: maxDate,
      format
    };
  }

  /**
   * Append elements to container
   * @private
   */
  appendElements(container, elements) {
    container.appendChild(elements.container);
  }

  /**
   * Setup event handlers
   * @private
   */
  setupEventHandlers(elements, state, key) {
    this.afs.logger.debug(`Setting up event handlers for date range ${key}`);
    const {
      startInput,
      endInput
    } = elements;
    const handleDateChange = debounce(() => {
      const startDate = new Date(startInput.value);
      const endDate = new Date(endInput.value);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        state.currentStartDate = startDate;
        state.currentEndDate = endDate;
        this.applyDateFilter(key);
      }
    }, 300);
    startInput.addEventListener('change', handleDateChange);
    endInput.addEventListener('change', handleDateChange);
  }

  /**
   * Update date picker UI
   * @private
   */
  updateDateUI(key) {
    try {
      const {
        state,
        elements
      } = this.activeDateRanges.get(key);
      const {
        startInput,
        endInput
      } = elements;

      // Format dates for input
      const formatDate = date => {
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) {
            throw new Error('Invalid date');
          }
          return d.toISOString().split('T')[0];
        } catch (error) {
          this.afs.logger.error('Error formatting date:', error);
          return '';
        }
      };

      // Set min/max constraints
      startInput.min = formatDate(state.minDate);
      startInput.max = formatDate(state.maxDate);
      endInput.min = formatDate(state.minDate);
      endInput.max = formatDate(state.maxDate);

      // Set current values
      startInput.value = formatDate(state.currentStartDate);
      endInput.value = formatDate(state.currentEndDate);
    } catch (error) {
      this.afs.logger.error('Error updating date UI:', error);
    }
  }

  /**
   * Apply date filter
   * @private
   */
  applyDateFilter(key) {
    this.afs.logger.info(`Applying date filter for ${key}`);
    const {
      state
    } = this.activeDateRanges.get(key);
    this.afs.items.forEach(item => {
      try {
        // Check if item and dataset exist
        if (!item || !item.dataset || !item.dataset[key]) {
          this.afs.hideItem(item);
          return;
        }
        const itemDate = new Date(item.dataset[key]);

        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          this.afs.hideItem(item);
          return;
        }

        // Set time to midnight for consistent comparison
        const startDate = new Date(state.currentStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(state.currentEndDate);
        endDate.setHours(23, 59, 59, 999);
        const compareDate = new Date(itemDate);
        compareDate.setHours(0, 0, 0, 0);
        if (compareDate >= startDate && compareDate <= endDate) {
          this.afs.showItem(item);
        } else {
          this.afs.hideItem(item);
        }
      } catch (error) {
        this.afs.logger.error('Error filtering item by date:', error);
        this.afs.hideItem(item);
      }
    });
    this.afs.updateCounter();
    this.afs.urlManager.updateURL();
    this.afs.emit('dateFilter', {
      key,
      startDate: state.currentStartDate,
      endDate: state.currentEndDate
    });
  }

  /**
   * Get current date range
   * @param {string} key - Date range key
   * @returns {Object} Current date range
   */
  getDateRange(key) {
    const range = this.activeDateRanges.get(key);
    if (!range) return null;
    return {
      startDate: range.state.currentStartDate,
      endDate: range.state.currentEndDate
    };
  }

  /**
   * Set date range
   * @param {string} key - Date range key
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  setDateRange(key, startDate, endDate) {
    const range = this.activeDateRanges.get(key);
    if (!range) return;
    range.state.currentStartDate = startDate;
    range.state.currentEndDate = endDate;
    this.updateDateUI(key);
    this.applyDateFilter(key);
  }

  /**
   * Remove date range
   * @param {string} key - Date range key
   */
  removeDateRange(key) {
    const range = this.activeDateRanges.get(key);
    if (!range) return;
    range.elements.container.remove();
    this.activeDateRanges.delete(key);
    this.afs.logger.info(`Date range removed for ${key}`);
  }
}

/**
 * @fileoverview Advanced Filter System - Main Class
 */

// Version
const VERSION = "1.4.1";
class AFS extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super();
    this.initializeCore(options);
  }

  /**
   * Initialize core components
   * @private
   */
  initializeCore(options) {
    try {
      this.options = new Options(options);

      // Setup logger with options
      const debug = this.options.get("debug");
      const logLevel = this.options.get("logLevel");
      this.logger = new Logger(debug, logLevel);
      this.logger.debug("Logger initialized with debug:", debug, "level:", logLevel);
      this.state = new State();
      this.styleManager = new StyleManager(this.options);
      this.initializeDOM();
      this.initializeFeatures();
      this.setupLifecycle();
    } catch (error) {
      console.error("AFS initialization error:", error);
      throw error;
    }
  }

  /**
   * Initialize DOM elements
   * @private
   */
  initializeDOM() {
    this.logger.debug("Initializing DOM elements");
    this.container = document.querySelector(this.options.get("containerSelector"));
    if (!this.container) {
      throw new Error(`Container not found: ${this.options.get("containerSelector")}`);
    }
    this.items = this.container.querySelectorAll(this.options.get("itemSelector"));
    if (this.items.length === 0) {
      this.logger.warn("No items found in container");
    }
    this.state.setState("items.total", this.items.length);
    this.state.setState("items.visible", new Set(this.items));
  }

  /**
   * Initialize features
   * @private
   */
  initializeFeatures() {
    this.logger.debug("Initializing features");

    // Initialize all features first
    this.filter = new Filter(this);
    this.search = new Search(this);
    this.sort = new Sort(this);
    this.rangeFilter = new RangeFilter(this);
    this.urlManager = new URLManager(this);
    this.dateFilter = new DateFilter(this);
    this.pagination = new Pagination(this);
    this.inputRangeFilter = new InputRangeFilter(this);

    // Apply styles
    this.styleManager.applyStyles();

    // Initialize URL state after all features are ready
    this.urlManager.initialize();
  }

  /**
   * Setup lifecycle events
   * @private
   */
  setupLifecycle() {
    if (this.options.get("responsive")) {
      window.addEventListener("resize", this.handleResize.bind(this));
    }
    if (this.options.get("preserveState")) {
      document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
    }
    if (this.options.get("observeDOM")) {
      this.setupMutationObserver();
    }
    this.emit("initialized", {
      itemCount: this.items.length,
      options: this.options.export()
    });
  }

  // Item Management Methods
  /**
   * Show item with animation
   * @public
   * @param {HTMLElement} item - Item to show
   */
  showItem(item) {
    // Update state first
    const visibleItems = this.state.getState().items.visible;
    visibleItems.add(item);
    this.state.setState("items.visible", visibleItems);

    // Remove hidden class but keep opacity 0 initially
    item.classList.remove(this.options.get("hiddenClass"));

    // Set initial animation state
    item.style.opacity = "0";
    item.style.transform = "scale(0.95)";
    item.style.display = ""; // Ensure item is not display: none

    // Add transition class if not present
    const transitionClass = this.options.get("transitionClass");
    if (!item.classList.contains(transitionClass)) {
      item.classList.add(transitionClass);
    }

    // Start animation in next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Double RAF for reliable animation
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      });
    });

    // Clean up after animation
    const duration = this.options.get("animation.duration") || 300;
    setTimeout(() => {
      // Only clean up if item is still meant to be visible
      if (visibleItems.has(item)) {
        item.style.transform = "";
        item.style.opacity = "";
      }
    }, duration);
  }

  /**
   * Hide item with animation
   * @public
   * @param {HTMLElement} item - Item to hide
   */
  hideItem(item) {
    // Update state first
    const visibleItems = this.state.getState().items.visible;
    visibleItems.delete(item);
    this.state.setState("items.visible", visibleItems);

    // Add transition class if not present
    const transitionClass = this.options.get("transitionClass");
    if (!item.classList.contains(transitionClass)) {
      item.classList.add(transitionClass);
    }

    // Start hide animation
    requestAnimationFrame(() => {
      item.style.opacity = "0";
      item.style.transform = "scale(0.95)";
    });

    // Add hidden class and clean up after animation
    const duration = this.options.get("animation.duration") || 300;
    setTimeout(() => {
      // Only hide if the item is still meant to be hidden
      if (!visibleItems.has(item)) {
        item.classList.add(this.options.get("hiddenClass"));
        // Clean up styles
        item.style.transform = "";
        item.style.opacity = "";
      }
    }, duration);
  }

  /**
   * Add new items
   * @public
   */
  addItems(newItems) {
    const items = Array.isArray(newItems) ? newItems : [newItems];
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      fragment.appendChild(item);
      this.state.getState().items.visible.add(item);
    });
    this.container.appendChild(fragment);
    this.items = this.container.querySelectorAll(this.options.get("itemSelector"));
    this.filter.applyFilters();
  }

  /**
   * Remove items
   * @public
   */
  removeItems(itemsToRemove) {
    const items = Array.isArray(itemsToRemove) ? itemsToRemove : [itemsToRemove];
    const visibleItems = this.state.getState().items.visible;
    items.forEach(item => {
      visibleItems.delete(item);
      item.remove();
    });
    this.items = this.container.querySelectorAll(this.options.get("itemSelector"));
    this.updateCounter();
  }

  // State Management Methods
  /**
   * Save current state
   * @public
   */
  saveState() {
    if (!this.options.get("preserveState")) return;
    const state = {
      filters: Array.from(this.filter.getActiveFilters()),
      search: this.search.getValue(),
      sort: this.sort.getCurrentSort(),
      pagination: this.pagination.getPageInfo(),
      timestamp: Date.now()
    };
    sessionStorage.setItem("afs_state", JSON.stringify(state));
    this.logger.debug("State saved");
  }

  /**
   * Restore saved state
   * @public
   */
  restoreState() {
    if (!this.options.get("preserveState")) return;
    try {
      const saved = sessionStorage.getItem("afs_state");
      if (!saved) return;
      const state = JSON.parse(saved);
      if (Date.now() - state.timestamp > this.options.get("stateExpiry")) {
        localStorage.removeItem("afs_state");
        return;
      }
      this.setState(state);
      this.logger.debug("State restored");
    } catch (error) {
      this.logger.error("Error restoring state:", error);
    }
  }

  /**
   * Get current state
   * @public
   */
  getState() {
    return this.state.export();
  }

  /**
   * Set new state
   * @public
   */
  setState(newState) {
    this.state.import(newState);
    this.refresh();
  }

  // Update Methods
  /**
   * Update counter display
   * @public
   */
  updateCounter() {
    // Get counter element
    const counterElement = document.querySelector(this.options.get("counterSelector"));
    if (!counterElement) return;
    try {
      // Get count values
      const total = this.items.length;
      const visible = this.state.getState().items.visible.size;
      const filtered = total - visible;

      // Get counter options with defaults
      const counterOpts = this.options.get("counter") || Options.defaults.counter;
      const template = counterOpts.template || "Showing {visible} of {total}";
      const formatter = counterOpts.formatter || (num => num.toLocaleString());

      // Format numbers
      const formattedVisible = formatter(visible);
      const formattedTotal = formatter(total);
      const formattedFiltered = formatter(filtered);

      // Build counter text
      let counterText = template.replace("{visible}", formattedVisible).replace("{total}", formattedTotal).replace("{filtered}", formattedFiltered);

      // Add filtered count if enabled
      if (filtered > 0 && counterOpts.showFiltered) {
        const filteredTemplate = counterOpts.filteredTemplate || "({filtered} filtered)";
        counterText += " " + filteredTemplate.replace("{filtered}", formattedFiltered);
      }

      // Show no results message if applicable
      if (visible === 0 && counterOpts.noResultsTemplate) {
        counterText = counterOpts.noResultsTemplate;
      }

      // Update counter element
      counterElement.textContent = counterText;

      // Emit event
      this.emit("counterUpdated", {
        total,
        visible,
        filtered,
        formattedTotal,
        formattedVisible,
        formattedFiltered
      });
    } catch (error) {
      // Fallback to basic counter if anything fails
      this.logger.error("Error updating counter:", error);
      counterElement.textContent = `${this.state.getState().items.visible.size}/${this.items.length}`;
    }
  }

  /**
   * Update options
   * @public
   */
  updateOptions(newOptions) {
    this.options.update(newOptions);
    this.styleManager.updateStyles(newOptions);
    this.refresh();
  }

  /**
   * Refresh system
   * @public
   */
  refresh() {
    this.logger.debug("Refreshing AFS");
    this.items = this.container.querySelectorAll(this.options.get("itemSelector"));
    this.state.setState("items.total", this.items.length);
    this.filter.applyFilters();
    this.search.search(this.search.getValue());

    // Only update pagination if it's enabled
    if (this.options.get("pagination.enabled")) {
      this.pagination.update();
    }
    this.emit("refreshed", {
      itemCount: this.items.length
    });
  }

  // Event Handlers
  /**
   * Handle resize
   * @private
   */
  handleResize = (() => debounce(() => {
    this.emit("resize");
    // Do not call this.refresh() here to prevent filter resets on mobile/orientation change
    // If you need to update layout, do it here without resetting filter state
  }, 250))();

  /**
   * Handle visibility change
   * @private
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.emit("hidden");
      this.saveState();
    } else {
      this.emit("visible");
      this.restoreState();
    }
  }

  /**
   * Setup mutation observer
   * @private
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.type === "childList")) {
        this.refresh();
      }
    });
    observer.observe(this.container, {
      childList: true,
      subtree: true
    });
  }

  // Utility Methods
  /**
   * Get version
   * @public
   */
  getVersion() {
    return VERSION;
  }

  /**
   * Check feature support
   * @public
   */
  isFeatureSupported(feature) {
    const supportedFeatures = {
      search: !!this.search,
      pagination: true,
      animation: typeof document.createElement("div").style.transition !== "undefined",
      urlState: typeof window.history.pushState === "function",
      localStorage: (() => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return true;
        } catch (e) {
          return false;
        }
      })()
    };
    return !!supportedFeatures[feature];
  }

  /**
   * Destroy instance
   * @public
   */
  destroy() {
    this.logger.debug("Destroying AFS instance");

    // Remove event listeners
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    // Destroy features
    this.filter.destroy();
    this.search.destroy();
    this.sort.destroy();
    this.pagination.destroy();
    this.rangeFilter.destroy();

    // Cleanup
    this.styleManager.removeStyles();
    this.state.reset();
    sessionStorage.removeItem("afs_state");

    // Reset items
    this.items.forEach(item => {
      item.style = "";
      item.classList.remove(this.options.get("hiddenClass"), this.options.get("activeClass"));
    });
    this.emit("destroyed");
  }
}

export { AFS, VERSION };
//# sourceMappingURL=afs.modern.js.map
