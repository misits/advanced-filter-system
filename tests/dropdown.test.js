import { AFS } from "../src/AFS";
import { cleanupEnv } from "./helpers";

const DROPDOWN_OPTIONS = {
  containerSelector: ".filter-container",
  itemSelector: ".filter-item",
  filterDropdownSelector: ".dropdown-filter",
  counterSelector: ".filter-counter",
  activeClass: "active",
  hiddenClass: "hidden",
  animationDuration: 0,
  filterMode: "OR",
};

describe("AFS — Dropdown filtering", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanupEnv);

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

    filterInstance = new AFS(DROPDOWN_OPTIONS);

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

    filterInstance = new AFS(DROPDOWN_OPTIONS);

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

    filterInstance = new AFS(DROPDOWN_OPTIONS);

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
      ...DROPDOWN_OPTIONS,
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
});
