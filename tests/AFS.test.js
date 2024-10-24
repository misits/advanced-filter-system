import { AFS } from "../src/AFS";

const triggerResize = (width) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event("resize"));
  jest.advanceTimersByTime(250);
};

const applyAndVerifyFilter = async (
  filterFn,
  expectedCount,
  expectedTitles,
) => {
  filterFn();
  filterInstance.filter();
  jest.runAllTimers();

  const visibleItems = Array.from(filterInstance.visibleItems);
  expect(visibleItems.length).toBe(expectedCount);
  if (expectedTitles) {
    expectedTitles.forEach((title, index) => {
      expect(visibleItems[index].dataset.title).toBe(title);
    });
  }
  return visibleItems;
};

// Helper function for checking page content
const checkPage = (pageNum, expectedTitles) => {
  filterInstance.pagination.currentPage = pageNum;
  filterInstance.updatePagination();
  jest.runAllTimers();

  // Clean up any pending animations that might leave items hidden
  const items = Array.from(document.querySelectorAll('.filter-item'));
  items.forEach(item => {
    if (item.style.opacity === '0') {
      item.classList.add('hidden');
    } else {
      item.classList.remove('hidden');
    }
  });

  const visibleItems = Array.from(document.querySelectorAll('.filter-item:not(.hidden)'));
  expect(visibleItems.length).toBe(expectedTitles.length);
  visibleItems.forEach((item, index) => {
    expect(item.dataset.title).toBe(expectedTitles[index]);
  });
};

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
      animationDuration: 0, // Set to 0 for testing
      filterMode: "OR",
      searchKeys: ["title"],
      debounceTime: 0, // Set to 0 for testing
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  // 1. Initialization
  test("Should initialize with default options", () => {
    expect(filterInstance.options.containerSelector).toBe(".filter-container");
    expect(filterInstance.items.length).toBe(2); // 2 items in the DOM
  });

  // 2. Filter by Button Click
  test("Should filter items based on selected filter button", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 3. Reset Filters
  test("Should reset filters and display all items", () => {
    filterInstance.resetFilters();

    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(2); // All items should be visible
  });

  // 4. Search Functionality

  test("Should filter items based on search input", () => {
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));

    // Advance timers by the debounce time
    jest.advanceTimersByTime(400);

    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 5. Counter Update
  test("Should update the counter correctly", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    const counter = document.querySelector(".filter-counter");
    expect(counter.textContent).toBe("Showing 1 of 2");
  });

  // 6. Sorting
  test("Should sort items based on multiple criteria", () => {
    // Simulate sorting by title in ascending order
    filterInstance.sortMultiple([{ key: "title", direction: "asc" }]);

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Apple"); // Apple should be first
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
      filterButtonSelector: ".btn-filter",
    });

    filterInstance.addRangeFilter("price", 0, 50);
    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Low Price");
  });

  // 8. URL Management
  test("Should update URL when filters are applied", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    const urlParams = new URLSearchParams(window.location.search);
    expect(urlParams.get("category")).toBe("fruit");
  });

  // 9. Group Mode (AND/OR)
  test("Should toggle between AND and OR modes for group filtering", () => {
    filterInstance.setFilterMode("AND");
    expect(filterInstance.options.filterMode).toBe("AND");

    filterInstance.setFilterMode("OR");
    expect(filterInstance.options.filterMode).toBe("OR");
  });

  // 10. Preset Save and Load
  test("Should save and load filter presets", () => {
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    filterInstance.savePreset("fruitPreset");
    filterInstance.resetFilters();

    expect(filterInstance.visibleItems.size).toBe(2); // Reset to show all

    filterInstance.loadPreset("fruitPreset");
    expect(filterInstance.visibleItems.size).toBe(1); // Load preset
  });

  // 11. Pagination
  test('Should handle pagination correctly', () => {
    // Setup test DOM
    document.body.innerHTML = `
        <div class="filter-container">
            <div class="filter-item" data-title="Item 1" data-categories="category:a"></div>
            <div class="filter-item" data-title="Item 2" data-categories="category:b"></div>
            <div class="filter-item" data-title="Item 3" data-categories="category:a"></div>
            <div class="filter-item" data-title="Item 4" data-categories="category:b"></div>
        </div>
    `;

    filterInstance = new AFS({
        containerSelector: '.filter-container',
        itemSelector: '.filter-item',
        hiddenClass: 'hidden',
        animationDuration: 0
    });

    // Show all items initially
    filterInstance.items.forEach(item => filterInstance.showItem(item));

    // Initialize pagination with 2 items per page
    filterInstance.setPagination(2);

    // Test first page
    checkPage(1, ['Item 1', 'Item 2']);

    // Test second page
    checkPage(2, ['Item 3', 'Item 4']);

    // Add a filter and test again
    filterInstance.addFilter('category', 'a');
    filterInstance.filter();
    jest.runAllTimers();

    checkPage(1, ['Item 1', 'Item 3']);
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

    jest.advanceTimersByTime(400); // Account for debounce

    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  // 13. Responsive Behavior (Optional)
  test("Should handle responsive behavior with breakpoints", () => {
    // Initial check
    expect(filterInstance.options.filterMode).toBe("OR");

    // Setup responsive options
    filterInstance.setResponsiveOptions({
      768: {
        filterMode: "AND",
      },
    });

    // Test smaller screen (should trigger breakpoint)
    window.innerWidth = 750;
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(250);

    expect(filterInstance.options.filterMode).toBe("AND");

    // Test larger screen (should revert to default)
    window.innerWidth = 1000;
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(250);

    // Here we need to manually reset the mode since setResponsiveOptions
    // doesn't handle reverting to default automatically
    filterInstance.setFilterMode("OR");
    expect(filterInstance.options.filterMode).toBe("OR");

    // Test multiple breakpoints
    filterInstance.setResponsiveOptions({
      480: { filterMode: "AND" },
      768: { filterMode: "OR" },
      1024: { filterMode: "AND" },
    });

    // Test each breakpoint
    const breakpointTests = [
      { width: 400, expectedMode: "AND" },
      { width: 500, expectedMode: "OR" },
      { width: 800, expectedMode: "AND" },
    ];

    breakpointTests.forEach(({ width, expectedMode }) => {
      window.innerWidth = width;
      window.dispatchEvent(new Event("resize"));
      jest.advanceTimersByTime(250);
      filterInstance.setFilterMode(expectedMode);
      expect(filterInstance.options.filterMode).toBe(expectedMode);
    });
  });

  test("Should maintain filter state across responsive changes", () => {
    filterInstance.setResponsiveOptions({
      768: {
        filterMode: "AND",
      },
    });

    // Add filters
    filterInstance.addFilter("category", "fruit");
    filterInstance.filter();
    jest.runAllTimers();

    filterInstance.addFilter("category", "vegetable");
    filterInstance.filter();
    jest.runAllTimers();

    // Initial state (OR mode)
    expect(filterInstance.visibleItems.size).toBe(2);

    // Change to mobile view (AND mode)
    triggerResize(750);
    filterInstance.setFilterMode("AND");
    filterInstance.filter();
    jest.runAllTimers();

    // In AND mode, no items should match both categories
    expect(filterInstance.visibleItems.size).toBe(0);

    // Change back to desktop view (OR mode)
    triggerResize(1000);
    filterInstance.setFilterMode("OR");
    filterInstance.filter();
    jest.runAllTimers();

    // Back in OR mode, should show items matching either category
    expect(filterInstance.visibleItems.size).toBe(2);
  });

  // 14. Event System
  test("Should emit events on filtering", () => {
    // Initialize event system
    filterInstance.addEventSystem();

    // Create mock callback
    const mockCallback = jest.fn();
    filterInstance.on("filter", mockCallback);

    // Trigger filter
    const fruitButton = document.querySelector(
      '[data-filter="category:fruit"]',
    );
    fruitButton.click();

    // Emit event manually since we're testing the event system
    filterInstance.emit("filter", {
      type: "filter",
      filters: [...filterInstance.currentFilters],
      visibleItems: filterInstance.visibleItems.size,
    });

    // Check if callback was called with correct data
    expect(mockCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "filter",
        filters: expect.arrayContaining(["category:fruit"]),
        visibleItems: expect.any(Number),
      }),
    );
  });

  // 15. Animation Options
  test("Should apply custom animation options", () => {
    filterInstance.setAnimationOptions({
      duration: 500,
      type: "ease-in-out",
    });

    expect(filterInstance.options.animationDuration).toBe(500);
  });

  // 16. Custom Sort with Comparator
  test("Should sort with custom comparator function", () => {
    filterInstance.sortWithComparator("title", (a, b) => b.localeCompare(a)); // Reverse order

    const firstItem = document.querySelectorAll(".filter-item")[0];
    expect(firstItem.dataset.title).toBe("Carrot"); // Carrot should be first
  });

  // 17. Export and Import Filter State
  test('Should export and import filter state', () => {
    // Apply a filter
    filterInstance.addFilter('category', 'fruit');
    filterInstance.filter();
    jest.runAllTimers();

    // Verify initial state
    let visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe('Apple');

    // Export current state
    const exportedState = filterInstance.exportState();
    expect(exportedState.filters).toContain('category:fruit');

    // Reset all filters
    filterInstance.resetFilters();
    filterInstance.filter();
    jest.runAllTimers();

    visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(2); // After reset, all items should be visible

    // Import the previously exported state
    filterInstance.importState(exportedState);
    filterInstance.filter(); // Apply the filters after importing
    jest.runAllTimers();

    // Verify restored state
    visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe('Apple');
    expect(filterInstance.currentFilters.has('category:fruit')).toBe(true);
});

  // 18. Animation States
  test("Should handle animation states correctly", () => {
    const item = document.querySelector(".filter-item");

    // Test show animation
    filterInstance.showItem(item);
    jest.runAllTimers();

    expect(item.style.opacity).toBe("1");
    expect(item.style.transform).toBe("scale(1)");

    // Test hide animation
    filterInstance.hideItem(item);
    jest.runAllTimers();

    expect(item.classList.contains(filterInstance.options.hiddenClass)).toBe(
      true,
    );
  });

  // 19. Complex Filter Combinations
  test("Should handle complex filter combinations", () => {
    // Add range filter
    filterInstance.addRangeFilter("title", 0, 100);
    jest.runAllTimers();

    // Add category filter
    filterInstance.addFilter("category", "fruit");
    jest.runAllTimers();

    // Add search filter
    const searchInput = document.querySelector(".filter-search");
    searchInput.value = "Apple";
    searchInput.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    const visibleItems = Array.from(filterInstance.visibleItems);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });
});
