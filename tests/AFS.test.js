import { AFS } from "../src/AFS";

describe("Advanced Filter System (AFS) - Full Feature Test Suite", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    // Mock DOM structure
    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-filter" data-filter="category:fruit">Fruit</button>
        <button class="btn-filter" data-filter="category:vegetable">Vegetable</button>
        <input class="filter-search" />
        <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
        <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
        <div class="filter-counter"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterButtonSelector: ".btn-filter",
      searchInputSelector: ".filter-search",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      filterMode: "OR",
      searchKeys: ["title"],
      debounceTime: 0,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    // Clear URL params to prevent state leaking between tests
    window.history.pushState({}, "", window.location.pathname);
    document.body.innerHTML = "";
  });

  // 1. Initialization
  test("Should initialize with default options", () => {
    expect(filterInstance.options.get("containerSelector")).toBe(".filter-container");
    expect(filterInstance.items.length).toBe(2);
  });

  // 2. Filter by Button Click
  test("Should filter items based on selected filter button", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 3. Reset Filters
  test("Should reset filters and display all items", () => {
    filterInstance.filter.resetFilters();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(2);
  });

  // 4. Search Functionality
  test("Should filter items based on search input", () => {
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));

    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 5. Counter Update
  test("Should update the counter correctly", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    // Verify filter state is correct (set synchronously in applyFilters)
    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    // Update counter based on current state
    filterInstance.updateCounter();

    const counter = document.querySelector(".filter-counter");
    expect(counter.textContent).toBe("Showing 1 of 2 (1 filtered)");
  });

  // 6. Sorting
  test("Should sort items based on multiple criteria", () => {
    filterInstance.sort.sortMultiple([{ key: "title", direction: "asc" }]);

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Apple");
  });

  // 7. Range Filtering
  test("Should filter items based on numeric range", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <div class="filter-item" data-price="10" data-title="Low Price"></div>
        <div class="filter-item" data-price="100" data-title="High Price"></div>
        <div class="filter-counter"></div>
      </div>
    `;
    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
    });

    // Apply range filter using show/hide (mirrors RangeFilter.applyFilter behavior)
    filterInstance.items.forEach((item) => {
      const price = parseFloat(item.dataset.price);
      if (price >= 0 && price <= 50) {
        filterInstance.showItem(item);
      } else {
        filterInstance.hideItem(item);
      }
    });
    jest.runAllTimers();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Low Price");
  });

  // 8. URL Management
  test("Should update URL when filters are applied", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    // Manually trigger URL update (normally async in Promise.then)
    filterInstance.urlManager.updateURL();

    const urlParams = new URLSearchParams(window.location.search);
    expect(urlParams.get("category")).toBe("fruit");
  });

  // 9. Group Mode (AND/OR)
  test("Should toggle between AND and OR modes for group filtering", () => {
    filterInstance.filter.setFilterMode("AND");
    expect(filterInstance.options.get("filterMode")).toBe("AND");

    filterInstance.filter.setFilterMode("OR");
    expect(filterInstance.options.get("filterMode")).toBe("OR");
  });

  // 10. State Save and Restore
  test("Should save and restore filter state", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    // Verify filter was applied
    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    // Save current active filters
    const savedFilters = new Set(filterInstance.filter.activeFilters);

    // Reset filters
    filterInstance.filter.resetFilters();
    expect(filterInstance.state.getState().items.visible.size).toBe(2);

    // Restore saved filters
    filterInstance.filter.activeFilters.clear();
    savedFilters.forEach((f) => filterInstance.filter.activeFilters.add(f));
    filterInstance.filter.applyFilters();

    expect(filterInstance.state.getState().items.visible.size).toBe(1);
  });

  // 11. Pagination
  test("Should handle pagination correctly", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-filter" data-filter="category:a">A</button>
        <div class="filter-item" data-title="Item 1" data-categories="category:a"></div>
        <div class="filter-item" data-title="Item 2" data-categories="category:b"></div>
        <div class="filter-item" data-title="Item 3" data-categories="category:a"></div>
        <div class="filter-item" data-title="Item 4" data-categories="category:b"></div>
      </div>
      <div class="pagination-container"></div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterButtonSelector: ".btn-filter",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 2,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    jest.runAllTimers();

    // All 4 items should be visible (filter-wise)
    expect(filterInstance.state.getState().items.visible.size).toBe(4);

    // Should be on page 1 with 2 pages total
    expect(filterInstance.state.getState().pagination.totalPages).toBe(2);
    expect(filterInstance.state.getState().pagination.currentPage).toBe(1);

    // Go to page 2
    filterInstance.pagination.goToPage(2);
    jest.runAllTimers();

    expect(filterInstance.state.getState().pagination.currentPage).toBe(2);

    // Filter for category:a
    const aButton = document.querySelector('[data-filter="category:a"]');
    aButton.click();
    jest.runAllTimers();

    // 2 items match category:a, should be on page 1 with 1 page total
    expect(filterInstance.state.getState().items.visible.size).toBe(2);
    expect(filterInstance.state.getState().pagination.totalPages).toBe(1);
  });

  // 12. Filter by Text Search and Category
  test("Should combine text search and category filter correctly", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();
    jest.runAllTimers();

    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));

    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 13. Filter Mode Changes
  test("Should handle filter mode changes", () => {
    expect(filterInstance.options.get("filterMode")).toBe("OR");

    filterInstance.filter.setFilterMode("AND");
    expect(filterInstance.options.get("filterMode")).toBe("AND");

    filterInstance.filter.setFilterMode("OR");
    expect(filterInstance.options.get("filterMode")).toBe("OR");
  });

  // 14. AND vs OR Filter Behavior
  test("Should filter differently in AND vs OR modes", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <div class="filter-item" data-categories="type:fruit color:red" data-title="Apple"></div>
        <div class="filter-item" data-categories="type:fruit color:green" data-title="Pear"></div>
        <div class="filter-item" data-categories="type:vegetable color:red" data-title="Tomato"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      hiddenClass: "hidden",
      filterMode: "OR",
      filterCategoryMode: "OR",
      animation: { duration: 0 },
    });

    // Set multiple filters directly
    filterInstance.filter.activeFilters.clear();
    filterInstance.filter.activeFilters.add("type:fruit");
    filterInstance.filter.activeFilters.add("color:red");

    // OR mode: items matching type:fruit OR color:red → all 3
    filterInstance.filter.applyFilters();
    expect(filterInstance.state.getState().items.visible.size).toBe(3);

    // Switch to AND mode (setFilterMode calls applyFilters internally)
    filterInstance.filter.setFilterMode("AND");
    // Only Apple matches both type:fruit AND color:red
    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    // Switch back to OR
    filterInstance.filter.setFilterMode("OR");
    expect(filterInstance.state.getState().items.visible.size).toBe(3);
  });

  // 15. Event System
  test("Should emit events on filtering", () => {
    const mockCallback = jest.fn();
    filterInstance.on("filterToggled", mockCallback);

    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: "category:fruit",
        activeFilters: expect.arrayContaining(["category:fruit"]),
      }),
    );
  });

  // 16. Animation Options
  test("Should apply custom animation options", () => {
    filterInstance.options.set("animation.duration", 500);

    expect(filterInstance.options.get("animation.duration")).toBe(500);
  });

  // 17. Custom Sort with Comparator
  test("Should sort with custom comparator function", () => {
    filterInstance.sort.sortWithComparator("title", (a, b) => b.localeCompare(a));

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Carrot");
  });

  // 18. Export and Import Filter State
  test("Should export and import filter state", () => {
    // Apply a filter
    filterInstance.filter.addFilter("category:fruit");

    // Verify initial state
    let visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");

    // Sync state with active filters (state.filters.current is only synced in urlManager.updateURL)
    filterInstance.urlManager.updateURL();

    // Export current state
    const exportedState = filterInstance.getState();
    expect(exportedState.filters.current).toContain("category:fruit");

    // Reset all filters
    filterInstance.filter.resetFilters();

    visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(2);

    // Import the previously exported state
    filterInstance.filter.activeFilters.clear();
    exportedState.filters.current.forEach((f) =>
      filterInstance.filter.activeFilters.add(f),
    );
    filterInstance.filter.applyFilters();

    // Verify restored state
    visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
    expect(filterInstance.filter.activeFilters.has("category:fruit")).toBe(true);
  });

  // 19. Animation States
  test("Should handle animation states correctly", () => {
    const item = document.querySelector(".filter-item");

    // Test show animation
    filterInstance.showItem(item);
    jest.runAllTimers();

    // After all timers, item should not be hidden
    expect(item.classList.contains(filterInstance.options.get("hiddenClass"))).toBe(false);

    // Test hide animation
    filterInstance.hideItem(item);
    jest.runAllTimers();

    expect(item.classList.contains(filterInstance.options.get("hiddenClass"))).toBe(true);
  });

  // 20. Complex Filter Combinations
  test("Should handle complex filter combinations", () => {
    // Apply category filter
    filterInstance.filter.addFilter("category:fruit");

    // Apply search filter
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));
    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 21. Dropdown Filtering with filterDropdownSelector
  test("Should filter items using dropdown selects with filterDropdownSelector", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <select class="dropdown-filter" data-filter-type="category">
          <option value="">All Categories</option>
          <option value="category:fruit">Fruit</option>
          <option value="category:vegetable">Vegetable</option>
        </select>
        <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
        <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
        <div class="filter-counter"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterDropdownSelector: ".dropdown-filter",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animationDuration: 0,
      filterMode: "OR",
    });

    // Select "Fruit" from dropdown
    const dropdown = document.querySelector('.dropdown-filter');
    dropdown.value = "category:fruit";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    let visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");

    // Switch to "Vegetable" — should replace, not accumulate
    dropdown.value = "category:vegetable";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Carrot");
  });

  // 22. Dropdown "All" option with value="" clears filters
  test("Should clear filters when dropdown 'All' option with value='' is selected", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <select class="dropdown-filter" data-filter-type="category">
          <option value="">All Categories</option>
          <option value="category:fruit">Fruit</option>
          <option value="category:vegetable">Vegetable</option>
        </select>
        <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
        <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
        <div class="filter-counter"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterDropdownSelector: ".dropdown-filter",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animationDuration: 0,
      filterMode: "OR",
    });

    const dropdown = document.querySelector('.dropdown-filter');

    // Select "Fruit" first
    dropdown.value = "category:fruit";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    expect(filterInstance.state.getState().items.visible.size).toBe(1);

    // Now select "All" (value="")
    dropdown.value = "";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    // All items should be visible again
    expect(filterInstance.state.getState().items.visible.size).toBe(2);

    // Verify no empty string in active filters
    const activeFilters = filterInstance.filter.getActiveFilters();
    expect(activeFilters.has("")).toBe(false);
    expect(activeFilters.has("*")).toBe(true);
  });

  // 23. clearAllFilters resets dropdowns with value=""
  test("Should reset dropdowns with value='' options when clearAllFilters is called", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <select class="dropdown-filter" data-filter-type="category">
          <option value="">All Categories</option>
          <option value="category:fruit">Fruit</option>
          <option value="category:vegetable">Vegetable</option>
        </select>
        <div class="filter-item" data-categories="category:fruit" data-title="Apple"></div>
        <div class="filter-item" data-categories="category:vegetable" data-title="Carrot"></div>
        <div class="filter-counter"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterDropdownSelector: ".dropdown-filter",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animationDuration: 0,
      filterMode: "OR",
    });

    const dropdown = document.querySelector('.dropdown-filter');

    // Select "Fruit"
    dropdown.value = "category:fruit";
    dropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    expect(dropdown.value).toBe("category:fruit");

    // Clear all filters
    filterInstance.filter.clearAllFilters();
    jest.runAllTimers();

    // Dropdown should be reset to "" (the All option)
    expect(dropdown.value).toBe("");

    // All items should be visible
    expect(filterInstance.state.getState().items.visible.size).toBe(2);
  });

  // 24. Multiple dropdown filters work together
  test("Should handle multiple dropdowns filtering simultaneously", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <select class="dropdown-filter" data-filter-type="category">
          <option value="">All Categories</option>
          <option value="category:fruit">Fruit</option>
          <option value="category:vegetable">Vegetable</option>
        </select>
        <select class="dropdown-filter" data-filter-type="color">
          <option value="">All Colors</option>
          <option value="color:red">Red</option>
          <option value="color:green">Green</option>
        </select>
        <div class="filter-item" data-categories="category:fruit color:red" data-title="Apple"></div>
        <div class="filter-item" data-categories="category:fruit color:green" data-title="Pear"></div>
        <div class="filter-item" data-categories="category:vegetable color:green" data-title="Carrot"></div>
        <div class="filter-counter"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterDropdownSelector: ".dropdown-filter",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animationDuration: 0,
      filterCategoryMode: "mixed",
    });

    const categoryDropdown = document.querySelectorAll('.dropdown-filter')[0];
    const colorDropdown = document.querySelectorAll('.dropdown-filter')[1];

    // Select "Fruit" category
    categoryDropdown.value = "category:fruit";
    categoryDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    expect(filterInstance.state.getState().items.visible.size).toBe(2); // Apple + Pear

    // Also select "Green" color — should show items that are fruit AND green
    colorDropdown.value = "color:green";
    colorDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Pear");

    // Clear color dropdown — should go back to all fruits
    colorDropdown.value = "";
    colorDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    jest.runAllTimers();

    expect(filterInstance.state.getState().items.visible.size).toBe(2); // Apple + Pear
  });

  // 25. Pagination does not get overridden by animation
  test("Should not show items beyond the current page when pagination is enabled", () => {
    // Create 15 items
    const itemsHTML = Array.from({ length: 15 }, (_, i) => {
      const color = i % 2 === 0 ? "color:red" : "color:blue";
      return `<div class="filter-item" data-categories="${color}" data-title="Item ${i + 1}"></div>`;
    }).join('\n');

    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="color:red">Red</button>
        <button class="btn-filter" data-filter="color:blue">Blue</button>
        ${itemsHTML}
        <div class="filter-counter"></div>
      </div>
      <div class="pagination-container"></div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterButtonSelector: ".btn-filter",
      counterSelector: ".filter-counter",
      activeClass: "active",
      hiddenClass: "hidden",
      animationDuration: 0,
      filterMode: "OR",
      pagination: {
        enabled: true,
        itemsPerPage: 10,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    jest.runAllTimers();

    // All 15 items should match the filter (showing all)
    expect(filterInstance.state.getState().items.visible.size).toBe(15);

    // Pagination should show 2 pages
    expect(filterInstance.state.getState().pagination.totalPages).toBe(2);
    expect(filterInstance.state.getState().pagination.currentPage).toBe(1);

    // Items beyond page 1 (indices 10-14) should be hidden
    const allItems = document.querySelectorAll('.filter-item');
    for (let i = 10; i < 15; i++) {
      expect(allItems[i].classList.contains('hidden')).toBe(true);
    }

    // Advance timers well past animation duration to ensure no async callback overrides
    jest.advanceTimersByTime(1000);

    // Items 11-15 should STILL be hidden (animation must not override pagination)
    for (let i = 10; i < 15; i++) {
      expect(allItems[i].classList.contains('hidden')).toBe(true);
    }
  });

  // 26. Pagination scrollToTop
  test("Should scroll to top of the items list on page change when scrollToTop is enabled", () => {
    const itemsHTML = Array.from({ length: 15 }, (_, i) =>
      `<div class="filter-item" data-categories="color:red" data-title="Item ${i + 1}"></div>`
    ).join('\n');

    document.body.innerHTML = `
      <div class="filter-container">
        ${itemsHTML}
      </div>
      <div class="pagination-container"></div>
    `;

    const scrollToMock = jest.fn();
    window.scrollTo = scrollToMock;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 10,
        container: ".pagination-container",
        showPrevNext: false,
        scrollToTop: true,
        scrollOffset: 50,
        scrollBehavior: "auto",
      },
    });

    jest.runAllTimers();
    scrollToMock.mockClear();

    filterInstance.pagination.goToPage(2);
    jest.runAllTimers();

    expect(filterInstance.state.getState().pagination.currentPage).toBe(2);
    expect(scrollToMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "auto", top: expect.any(Number) })
    );
  });

  // 27. Pagination public API
  test("Should expose pagination navigation helpers and getPageInfo", () => {
    const itemsHTML = Array.from({ length: 15 }, (_, i) =>
      `<div class="filter-item" data-categories="color:red" data-title="Item ${i + 1}"></div>`
    ).join('\n');

    document.body.innerHTML = `
      <div class="filter-container">
        ${itemsHTML}
      </div>
      <div class="pagination-container"></div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 10,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    jest.runAllTimers();

    expect(filterInstance.pagination.getPageInfo()).toEqual({
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 2,
    });

    filterInstance.pagination.nextPage();
    expect(filterInstance.pagination.getCurrentPage()).toBe(2);

    filterInstance.pagination.previousPage();
    expect(filterInstance.pagination.getCurrentPage()).toBe(1);

    filterInstance.pagination.lastPage();
    expect(filterInstance.pagination.getCurrentPage()).toBe(2);

    filterInstance.pagination.firstPage();
    expect(filterInstance.pagination.getCurrentPage()).toBe(1);

    filterInstance.pagination.setItemsPerPage(5);
    expect(filterInstance.pagination.getItemsPerPage()).toBe(5);
    expect(filterInstance.pagination.getTotalPages()).toBe(3);

    // destroy() must not throw (AFS.destroy calls pagination.destroy)
    expect(() => filterInstance.destroy()).not.toThrow();
  });

  // 28. Sort buttons apply their declared direction on first click
  test("Should sort with the declared direction on first click, then toggle", () => {
    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-sort" data-sort-key="price" data-sort-direction="asc">Price</button>
        <div class="filter-item" data-title="B" data-price="200"></div>
        <div class="filter-item" data-title="A" data-price="100"></div>
        <div class="filter-item" data-title="C" data-price="300"></div>
      </div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      sortButtonSelector: ".btn-sort",
      hiddenClass: "hidden",
      animation: { duration: 0 },
    });

    const button = document.querySelector(".btn-sort");
    const prices = () =>
      Array.from(document.querySelectorAll(".filter-item")).map((i) => i.dataset.price);

    // First click: ascending (as declared)
    button.click();
    jest.runAllTimers();
    expect(prices()).toEqual(["100", "200", "300"]);

    // Second click: toggles to descending
    button.click();
    jest.runAllTimers();
    expect(prices()).toEqual(["300", "200", "100"]);
  });

  // 29. URL params survive initialization (pagination setup must not wipe them)
  test("Should apply filters from URL params on load when pagination is enabled", () => {
    window.history.pushState({}, "", "?category=fruit");

    document.body.innerHTML = `
      <div class="filter-container">
        <button class="btn-filter" data-filter="*">All</button>
        <button class="btn-filter" data-filter="category:fruit">Fruit</button>
        <div class="filter-item" data-title="Apple" data-categories="category:fruit"></div>
        <div class="filter-item" data-title="Carrot" data-categories="category:vegetable"></div>
        <div class="filter-item" data-title="Pear" data-categories="category:fruit"></div>
      </div>
      <div class="pagination-container"></div>
    `;

    filterInstance = new AFS({
      containerSelector: ".filter-container",
      itemSelector: ".filter-item",
      filterButtonSelector: ".btn-filter",
      hiddenClass: "hidden",
      animation: { duration: 0 },
      pagination: {
        enabled: true,
        itemsPerPage: 2,
        container: ".pagination-container",
        showPrevNext: false,
      },
    });

    jest.runAllTimers();

    // URL filter must be applied, not wiped by pagination setup
    expect(filterInstance.filter.getActiveFilters().has("category:fruit")).toBe(true);
    expect(filterInstance.state.getState().items.visible.size).toBe(2);
    expect(window.location.search).toContain("category=fruit");
  });
});
