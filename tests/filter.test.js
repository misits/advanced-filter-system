import { AFS } from "../src/AFS";
import { createBasicAFS, cleanupEnv } from "./helpers";

describe("AFS — Filtering (buttons & modes)", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    filterInstance = createBasicAFS();
  });

  afterEach(cleanupEnv);

  test("Should filter items based on selected filter button", () => {
    const fruitButton = document.querySelector('[data-filter="category:fruit"]');
    fruitButton.click();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(1);
    expect(visibleItems[0].dataset.title).toBe("Apple");
  });

  test("Should reset filters and display all items", () => {
    filterInstance.filter.resetFilters();

    const visibleItems = Array.from(filterInstance.state.getState().items.visible);
    expect(visibleItems.length).toBe(2);
  });

  test("Should toggle between AND and OR modes for group filtering", () => {
    filterInstance.filter.setFilterMode("AND");
    expect(filterInstance.options.get("filterMode")).toBe("AND");

    filterInstance.filter.setFilterMode("OR");
    expect(filterInstance.options.get("filterMode")).toBe("OR");
  });

  test("Should handle filter mode changes", () => {
    expect(filterInstance.options.get("filterMode")).toBe("OR");

    filterInstance.filter.setFilterMode("AND");
    expect(filterInstance.options.get("filterMode")).toBe("AND");

    filterInstance.filter.setFilterMode("OR");
    expect(filterInstance.options.get("filterMode")).toBe("OR");
  });

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
});
