import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — State save / restore / export / import", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should save and restore filter state", () => {
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
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
});
