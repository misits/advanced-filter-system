import { State } from "../src/core/State";
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

describe("State — subscription & encapsulated mutators", () => {
  let state;

  beforeEach(() => {
    state = new State();
  });

  test("subscribe() fires on a matching setState write and returns an unsubscribe", () => {
    const cb = jest.fn();
    const off = state.subscribe("search.query", cb);

    state.setState("search.query", "hello");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenLastCalledWith("hello", "search.query");

    off();
    state.setState("search.query", "world");
    expect(cb).toHaveBeenCalledTimes(1); // no further calls after unsubscribe
  });

  test("ancestor subscribers are notified for descendant writes", () => {
    const onItems = jest.fn();
    state.subscribe("items", onItems);

    const set = new Set([{}, {}]);
    state.setVisibleItems(set);

    expect(onItems).toHaveBeenCalledWith(set, "items.visible");
  });

  test("visible-item mutators update the set and notify", () => {
    const cb = jest.fn();
    state.subscribe("items.visible", cb);

    const a = {};
    const b = {};
    state.addVisibleItem(a);
    state.addVisibleItem(b);
    expect(state.getState().items.visible.has(a)).toBe(true);
    expect(state.getState().items.visible.size).toBe(2);

    state.removeVisibleItem(a);
    expect(state.getState().items.visible.has(a)).toBe(false);
    expect(state.getState().items.visible.size).toBe(1);

    state.clearVisibleItems();
    expect(state.getState().items.visible.size).toBe(0);

    expect(cb).toHaveBeenCalledTimes(4); // 2 adds + 1 remove + 1 clear
  });

  test("a throwing subscriber does not break the write or other subscribers", () => {
    const good = jest.fn();
    state.subscribe("items.visible", () => {
      throw new Error("boom");
    });
    state.subscribe("items.visible", good);

    expect(() => state.addVisibleItem({})).not.toThrow();
    expect(good).toHaveBeenCalled();
    expect(state.getState().items.visible.size).toBe(1);
  });
});
