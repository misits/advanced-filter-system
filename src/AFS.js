/**
 * @fileoverview Advanced Filter System - Main Class
 */
import { Logger } from "./core/Logger";
import { Options } from "./core/Options";
import { State } from "./core/State";
import { StyleManager } from "./styles/StyleManager";
import { EventEmitter } from "./core/EventEmitter";

import { Filter } from "./features/Filter";
import { InputRangeFilter } from "./features/InputRangeFilter";
import { Search } from "./features/Search";
import { Sort } from "./features/Sort";
import { Pagination } from "./features/Pagination";
import { URLManager } from "./features/URLManager";
import { RangeFilter } from "./features/RangeFilter";
import { DateFilter } from "./features/DateFilter";

import { debounce } from "./utils";

// Version
export const VERSION = "1.3.12";

export class AFS extends EventEmitter {
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
      this.logger.debug(
        "Logger initialized with debug:",
        debug,
        "level:",
        logLevel
      );

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

    this.container = document.querySelector(
      this.options.get("containerSelector")
    );
    if (!this.container) {
      throw new Error(
        `Container not found: ${this.options.get("containerSelector")}`
      );
    }

    this.items = this.container.querySelectorAll(
      this.options.get("itemSelector")
    );
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
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange.bind(this)
      );
    }

    if (this.options.get("observeDOM")) {
      this.setupMutationObserver();
    }

    this.emit("initialized", {
      itemCount: this.items.length,
      options: this.options.export(),
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

    // Force reflow before starting animation
    item.offsetHeight;

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

    items.forEach((item) => {
      fragment.appendChild(item);
      this.state.getState().items.visible.add(item);
    });

    this.container.appendChild(fragment);
    this.items = this.container.querySelectorAll(
      this.options.get("itemSelector")
    );
    this.filter.applyFilters();
  }

  /**
   * Remove items
   * @public
   */
  removeItems(itemsToRemove) {
    const items = Array.isArray(itemsToRemove)
      ? itemsToRemove
      : [itemsToRemove];
    const visibleItems = this.state.getState().items.visible;

    items.forEach((item) => {
      visibleItems.delete(item);
      item.remove();
    });

    this.items = this.container.querySelectorAll(
      this.options.get("itemSelector")
    );
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
      timestamp: Date.now(),
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
    const counterElement = document.querySelector(
      this.options.get("counterSelector")
    );
    if (!counterElement) return;

    try {
      // Get count values
      const total = this.items.length;
      const visible = this.state.getState().items.visible.size;
      const filtered = total - visible;

      // Get counter options with defaults
      const counterOpts =
        this.options.get("counter") || Options.defaults.counter;
      const template = counterOpts.template || "Showing {visible} of {total}";
      const formatter =
        counterOpts.formatter || ((num) => num.toLocaleString());

      // Format numbers
      const formattedVisible = formatter(visible);
      const formattedTotal = formatter(total);
      const formattedFiltered = formatter(filtered);

      // Build counter text
      let counterText = template
        .replace("{visible}", formattedVisible)
        .replace("{total}", formattedTotal)
        .replace("{filtered}", formattedFiltered);

      // Add filtered count if enabled
      if (filtered > 0 && counterOpts.showFiltered) {
        const filteredTemplate =
          counterOpts.filteredTemplate || "({filtered} filtered)";
        counterText +=
          " " + filteredTemplate.replace("{filtered}", formattedFiltered);
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
        formattedFiltered,
      });
    } catch (error) {
      // Fallback to basic counter if anything fails
      this.logger.error("Error updating counter:", error);
      counterElement.textContent = `${
        this.state.getState().items.visible.size
      }/${this.items.length}`;
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

    this.items = this.container.querySelectorAll(
      this.options.get("itemSelector")
    );
    this.state.setState("items.total", this.items.length);

    this.filter.applyFilters();
    this.search.search(this.search.getValue());

    // Only update pagination if it's enabled
    if (this.options.get("pagination.enabled")) {
      this.pagination.update();
    }

    this.emit("refreshed", { itemCount: this.items.length });
  }

  // Event Handlers
  /**
   * Handle resize
   * @private
   */
  handleResize = debounce(() => {
    this.emit("resize");
    // Do not call this.refresh() here to prevent filter resets on mobile/orientation change
    // If you need to update layout, do it here without resetting filter state
  }, 250);

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
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === "childList")) {
        this.refresh();
      }
    });

    observer.observe(this.container, {
      childList: true,
      subtree: true,
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
      animation:
        typeof document.createElement("div").style.transition !== "undefined",
      urlState: typeof window.history.pushState === "function",
      localStorage: (() => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return true;
        } catch (e) {
          return false;
        }
      })(),
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
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

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
    this.items.forEach((item) => {
      item.style = "";
      item.classList.remove(
        this.options.get("hiddenClass"),
        this.options.get("activeClass")
      );
    });

    this.emit("destroyed");
  }
}
