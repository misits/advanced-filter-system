import { AFS } from "../src/AFS";
import { cleanupEnv } from "./helpers";

describe("AFS — Pagination", () => {
  let filterInstance;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(cleanupEnv);

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
