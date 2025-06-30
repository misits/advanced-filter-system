/**
 * @fileoverview Pagination functionality for AFS
 */
import { Animation } from "../styles/Animation.js";

export class Pagination {
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
        totalPages: 1,
      });
      return;
    }

    this.container = document.createElement("div");
    this.container.className = this.options.containerClass;

    const itemsContainer = document.querySelector(
      this.afs.options.get("pagination.container")
    );
    if (!itemsContainer) {
      this.afs.logger.error("Items container not found.");
      return;
    }
    itemsContainer.appendChild(this.container);

    // Initialize pagination state with defaults
    this.afs.state.setState("pagination", {
      currentPage: 1,
      itemsPerPage: this.options.itemsPerPage,
      totalPages: 0,
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

    this.container.addEventListener("click", (e) => {
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
    const totalPages = Math.max(
      1,
      Math.ceil(visibleItems.length / itemsPerPage)
    );

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
      totalPages,
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
      visibleItems: visibleItems.length,
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

    const { currentPage, itemsPerPage } = this.afs.state.getState().pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // First hide all items
    this.afs.items.forEach((item) => {
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
      itemsToShow.forEach((item) => {
        // Remove hidden class and restore display
        item.style.display = "";
        item.classList.remove(this.afs.options.get("hiddenClass"));

        // Apply show animation in the next frame
        requestAnimationFrame(() => {
          this.animation.applyShowAnimation(
            item,
            this.options.animationType || "fade"
          );
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

    const { currentPage, totalPages } = this.afs.state.getState().pagination;

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
        class: "afs-pagination-prev",
      });
      fragment.appendChild(prevButton);
    }

    fragment.appendChild(
      this.createPageButton("1", 1, { active: currentPage === 1 })
    );

    const range = this.calculatePageRange(currentPage, totalPages);

    if (range.start > 2) fragment.appendChild(this.createEllipsis());

    for (let i = range.start; i <= range.end; i++) {
      if (i === 1 || i === totalPages) continue;
      fragment.appendChild(
        this.createPageButton(i.toString(), i, { active: currentPage === i })
      );
    }

    if (range.end < totalPages - 1) fragment.appendChild(this.createEllipsis());

    if (totalPages > 1)
      fragment.appendChild(
        this.createPageButton(totalPages.toString(), totalPages, {
          active: currentPage === totalPages,
        })
      );

    if (this.options.showPrevNext) {
      const nextButton = this.createPageButton("›", currentPage + 1, {
        disabled: currentPage === totalPages,
        class: "afs-pagination-next",
      });
      fragment.appendChild(nextButton);
    }

    return fragment;
  }

  /**
   * Create page button
   * @private
   */
  createPageButton(
    text,
    page,
    { active = false, disabled = false, class: className = "" } = {}
  ) {
    const button = document.createElement("button");
    button.textContent = text;
    button.dataset.page = page;
    button.classList.add(this.options.pageButtonClass || "afs-page-button");

    if (className) button.classList.add(className);
    if (active)
      button.classList.add(this.options.activePageClass || "afs-page-active");
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

    if (end - start < maxButtons - 3)
      start = Math.max(2, end - (maxButtons - 3));

    return { start, end };
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

    // Force a reflow before updating
    this.afs.container.offsetHeight;

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
      totalPages: state.totalPages,
    });
  }

  scrollToTop() {
    const container = document.querySelector(
      this.afs.options.get("pagination.container")
    );
    if (!container) {
      this.afs.logger.warn("Scroll container not found.");
      return;
    }

    window.scrollTo({
      top: container.offsetTop - this.options.scrollOffset,
      behavior: "smooth",
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
    this.afs.emit("paginationModeChanged", { enabled });
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
        visibleItems.forEach((item) => {
          item.style.display = "";
          item.classList.remove(this.afs.options.get("hiddenClass"));

          // For mobile, skip animation to improve performance and prevent blur issues
          if (isMobile) {
            item.style.opacity = "1";
            item.style.transform = "";
            item.style.filter = "none";
          } else {
            requestAnimationFrame(() => {
              this.animation.applyShowAnimation(
                item,
                this.options?.animationType || "fade"
              );
            });
          }
        });

        // Extra cleanup for mobile devices to ensure no blur filters remain
        if (isMobile) {
          setTimeout(() => {
            visibleItems.forEach((item) => {
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
      this.afs.items.forEach((item) => {
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
